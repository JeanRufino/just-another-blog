import axios from 'axios'
import * as cheerio from 'cheerio'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
)

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
  'Accept-Encoding': 'gzip, deflate, br',
  Connection: 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Cache-Control': 'max-age=0',
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function formatPreco(raw: string): string {
  const cleaned = raw.trim().replace(/\s+/g, ' ')
  if (cleaned.startsWith('R$')) return cleaned
  return `R$ ${cleaned}`
}

function extrairPreco(html: string, url: string): string | null {
  const $ = cheerio.load(html)

  // 1. Metatags
  const metaAmount =
    $('meta[property="product:price:amount"]').attr('content') ||
    $('meta[property="og:price:amount"]').attr('content')
  if (metaAmount) {
    const num = parseFloat(metaAmount.replace(',', '.'))
    if (!isNaN(num)) return `R$ ${num.toFixed(2).replace('.', ',')}`
  }

  // 2. itemprop="price"
  const itemProp =
    $('[itemprop="price"]').attr('content') ||
    $('[itemprop="price"]').first().text()
  if (itemProp) {
    const num = parseFloat(itemProp.replace(',', '.'))
    if (!isNaN(num)) return `R$ ${num.toFixed(2).replace('.', ',')}`
  }

  // 3. Shopee — classes com "price" e formato R$
  if (url.includes('shopee')) {
    const shopeeSelectors = ['._3n5NQx', '[class*="price"]', '[class*="Price"]']
    for (const sel of shopeeSelectors) {
      const el = $(sel).first().text()
      if (el && /R\$/.test(el)) return formatPreco(el.match(/R\$[\s\d.,]+/)![0])
    }
  }

  // 4. Mercado Livre
  if (url.includes('mercadolivre') || url.includes('mercadopago')) {
    const frac = $('.andes-money-amount__fraction').first().text()
    const cents = $('.andes-money-amount__cents').first().text()
    if (frac) return `R$ ${frac}${cents ? ',' + cents : ''}`
  }

  // 5. Amazon
  if (url.includes('amazon')) {
    const whole = $('.a-price-whole').first().text().replace(/\D/g, '')
    const frac = $('.a-price-fraction').first().text().replace(/\D/g, '')
    if (whole) return `R$ ${whole}${frac ? ',' + frac : ''}`
  }

  // 6. Qualquer elemento visível com R$ no texto (fallback genérico)
  const PRECO_RE = /R\$\s*\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?/
  let found: string | null = null
  $('*').each((_, el) => {
    if (found) return false
    const text = $(el).clone().children().remove().end().text().trim()
    const match = text.match(PRECO_RE)
    if (match) found = formatPreco(match[0])
  })
  return found
}

async function fetchPreco(url: string): Promise<string | null> {
  try {
    const res = await axios.get(url, {
      headers: HEADERS,
      timeout: 15000,
      maxRedirects: 5,
    })
    return extrairPreco(res.data as string, url)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`  Erro ao buscar ${url}: ${msg}`)
    return null
  }
}

async function main() {
  const { data: presentes, error } = await supabase
    .from('presentes')
    .select('id, nome, url')
    .order('id')

  if (error) {
    console.error('Erro ao buscar presentes:', error.message)
    process.exit(1)
  }

  console.log(`Encontrados ${presentes.length} presentes. Iniciando scraping...\n`)

  const atualizados: string[] = []
  const falhas: string[] = []

  for (const presente of presentes) {
    const { id, nome, url } = presente as { id: number; nome: string; url: string }

    if (!url) {
      console.log(`[SKIP] ${nome} — sem URL`)
      falhas.push(nome)
      continue
    }

    console.log(`[→] ${nome}`)
    console.log(`    ${url}`)

    const preco = await fetchPreco(url)

    if (preco) {
      const { error: updateError } = await supabase
        .from('presentes')
        .update({ preco })
        .eq('id', id)

      if (updateError) {
        console.log(`    ✗ Erro ao salvar: ${updateError.message}`)
        falhas.push(nome)
      } else {
        console.log(`    ✓ ${preco}`)
        atualizados.push(`${nome}: ${preco}`)
      }
    } else {
      console.log(`    ✗ Preço não encontrado`)
      falhas.push(nome)
    }

    await sleep(2000)
  }

  console.log('\n=== RESUMO ===')
  console.log(`Atualizados: ${atualizados.length}`)
  atualizados.forEach((a) => console.log(`  ✓ ${a}`))
  console.log(`\nFalhas: ${falhas.length}`)
  falhas.forEach((f) => console.log(`  ✗ ${f}`))
}

main()
