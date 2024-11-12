import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')

    if (!lat || !lon) {
        return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 })
    }

    const apiKey = process.env.OPENWEATHERMAP_API_KEY
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=metric&appid=${apiKey}`

    try {
        const response = await fetch(url)
        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Error fetching weather data:', error)
        return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 })
    }
}