import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ success: false, error: 'URL é obrigatória' }, { status: 400 })
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        Accept: 'text/html',
      },
    })
    clearTimeout(timeout)

    if (!response.ok) {
      return NextResponse.json({ success: false })
    }

    const html = await response.text()

    const getMeta = (property: string): string | null => {
      const match = html.match(
        new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i')
      ) || html.match(
        new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i')
      )
      return match?.[1] ?? null
    }

    const title = getMeta('og:title')
    const image = getMeta('og:image')
    const price =
      getMeta('og:price:amount') ??
      getMeta('product:price:amount') ??
      getMeta('og:price') ??
      null

    if (!title && !image) {
      return NextResponse.json({ success: false })
    }

    return NextResponse.json({ success: true, title, image, price })
  } catch {
    return NextResponse.json({ success: false })
  }
}
