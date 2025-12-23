import { readFileSync } from 'fs'
import { join } from 'path'

let addressCache: Record<string, string> | null = null

function loadAddresses() {
  if (!addressCache) {
    try {
      const filePath = join(process.cwd(), 'public', 'addresses.json')
      const data = readFileSync(filePath, 'utf-8')
      addressCache = JSON.parse(data)
    } catch (error) {
      console.warn('Could not load addresses.json:', error)
      addressCache = {}
    }
  }
  return addressCache
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  if (!lat || !lng) {
    return Response.json({ error: 'Missing lat or lng' }, { status: 400 })
  }

  try {
    // Load precomputed addresses from JSON
    const addresses = loadAddresses()
    const key = `${parseFloat(lat).toFixed(6)},${parseFloat(lng).toFixed(6)}`
    
    if (addresses[key]) {
      return Response.json({ address: addresses[key] })
    }
    
    // Fallback to coordinates if not found
    return Response.json({ address: `${lat}, ${lng}` })
  } catch (error) {
    console.error('Error loading address:', error)
    return Response.json({ address: `${lat}, ${lng}` })
  }
}
