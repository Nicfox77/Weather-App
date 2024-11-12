import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }

    const apiKey = process.env.GEOAPIFY_API_KEY
    const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&format=json&apiKey=${apiKey}`

    try {
        const response = await fetch(url)
        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Error fetching geocode data:', error)
        return NextResponse.json({ error: 'Failed to fetch geocode data' }, { status: 500 })
    }
}