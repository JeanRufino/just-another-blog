import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
)

const presentes = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../lista_cha_de_panela.json'), 'utf-8')
).slice(4)

async function seed() {
  console.log(`Inserindo ${presentes.length} presentes...`)

  const { data, error } = await supabase
    .from('presentes')
    .insert(presentes)
    .select()

  if (error) {
    console.error('Erro:', error.message)
    process.exit(1)
  }

  console.log(`✓ ${data.length} presentes inseridos com sucesso!`)
}

seed()
