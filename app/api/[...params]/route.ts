import { NextRequest, NextResponse } from 'next/server';
import dotenv from 'dotenv';

dotenv.config();

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const type = searchParams.get('type');

    if (type === 'locations') {
        const geoapifyApiKey = process.env.GEOAPIFY_API_KEY;
        const res = await fetch(
            `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query as string)}&format=json&apiKey=${geoapifyApiKey}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        const data = await res.json();
        return NextResponse.json(data);
    } else if (type === 'weather') {
        const openWeatherMapApiKey = process.env.OPENWEATHERMAP_API_KEY;
        const res = await fetch(
            `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=metric&appid=${openWeatherMapApiKey}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        const data = await res.json();
        return NextResponse.json(data);
    } else {
        return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
    }
}