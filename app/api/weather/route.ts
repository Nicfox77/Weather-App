// app/api/weather/route.ts

import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory cache object
const weatherCache: { [key: string]: { data: any; timestamp: number } } = {}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    const units = searchParams.get('units') || 'metric'
    const cacheKey = `${lat},${lon},${units}`

    if (!lat || !lon) {
        return NextResponse.json(
            { message: 'Missing latitude or longitude' },
            { status: 400 }
        )
    }

    const now = Date.now()
    const cacheDuration = 5 * 60 * 1000 // 5 minutes in milliseconds

    // Check if data is in cache and not expired
    if (weatherCache[cacheKey] && now - weatherCache[cacheKey].timestamp < cacheDuration) {
        console.log('Returning cached weather data')
        return NextResponse.json(weatherCache[cacheKey].data)
    }

    try {
        const apiKey = process.env.OPENWEATHERMAP_API_KEY
        const apiUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=${units}&exclude=minutely,alerts&appid=${apiKey}`

        const response = await fetch(apiUrl)
        const data = await response.json()

        // Store the data in cache
        weatherCache[cacheKey] = { data, timestamp: now }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error fetching weather data:', error)
        return NextResponse.json(
            { message: 'Error fetching weather data' },
            { status: 500 }
        )
    }
}
