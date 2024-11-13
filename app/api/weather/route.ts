// app/api/weather/route.ts

import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    const units = searchParams.get('units') || 'metric' // Default to metric if units not provided

    if (!lat || !lon) {
        return NextResponse.json(
            { message: 'Missing latitude or longitude' },
            { status: 400 }
        )
    }

    try {
        const apiKey = process.env.OPENWEATHERMAP_API_KEY
        const apiUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=${units}&exclude=minutely,alerts&appid=${apiKey}`

        const response = await fetch(apiUrl)
        const data = await response.json()

        // Add cache-control header to prevent caching
        return new Response(JSON.stringify(data), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store',
            },
        })
    } catch (error) {
        console.error('Error fetching weather data:', error)
        return NextResponse.json(
            { message: 'Error fetching weather data' },
            { status: 500 }
        )
    }
}
