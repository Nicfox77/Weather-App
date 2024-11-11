'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Search } from 'lucide-react'
import { useDebounce } from 'use-debounce'

type Location = {
    formatted: string
    lat: number
    lon: number
    place_id: string
}

type WeatherData = {
    current: {
        temp: number
        feels_like: number
        humidity: number
        wind_speed: number
        weather: Array<{ description: string; icon: string }>
    }
    hourly: Array<{
        dt: number
        temp: number
        weather: Array<{ description: string; icon: string }>
    }>
    daily: Array<{
        dt: number
        temp: { min: number; max: number }
        weather: Array<{ description: string; icon: string }>
    }>
}

export default function WeatherApp() {
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearchTerm] = useDebounce(searchTerm, 300)
    const [locations, setLocations] = useState<Location[]>([])
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const searchLocations = async (query: string) => {
        if (!query) {
            setLocations([])
            return
        }

        try {
            const response = await fetch(
                `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
                    query
                )}&format=json&apiKey=${process.env.GEOAPIFY_API_KEY}`
            )
            const data = await response.json()
            setLocations(data.results || [])
        } catch (error) {
            console.error('Error fetching locations:', error)
            setError('Failed to fetch locations. Please try again.')
        }
    }

    const fetchWeather = async (lat: number, lon: number) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=metric&appid=${process.env.OPENWEATHERMAP_API_KEY}`
            )
            const data = await response.json()
            setWeatherData(data)
        } catch (error) {
            console.error('Error fetching weather data:', error)
            setError('Failed to fetch weather data. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleLocationSelect = (location: Location) => {
        setSelectedLocation(location)
        setSearchTerm(location.formatted)
        setLocations([])
        fetchWeather(location.lat, location.lon)
    }

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        })
    }

    const formatTime = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
            hour: 'numeric',
            hour12: true,
        })
    }

    return (
        <div className="container mx-auto p-4 max-w-3xl">
            <h1 className="text-3xl font-bold mb-4">Weather App</h1>
            <div className="relative mb-4">
                <Input
                    type="text"
                    placeholder="Search for a location..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value)
                        searchLocations(e.target.value)
                    }}
                    className="w-full"
                />
                {locations.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-auto">
                        {locations.map((location) => (
                            <li
                                key={location.place_id}
                                className="p-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => handleLocationSelect(location)}
                            >
                                {location.formatted}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {loading && (
                <div className="flex justify-center items-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            )}

            {error && <div className="text-red-500 mb-4">{error}</div>}

            {weatherData && (
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Current Weather</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-4xl font-bold">{Math.round(weatherData.current.temp)}°C</p>
                                    <p className="text-lg">{weatherData.current.weather[0].description}</p>
                                </div>
                                <img
                                    src={`http://openweathermap.org/img/wn/${weatherData.current.weather[0].icon}@2x.png`}
                                    alt={weatherData.current.weather[0].description}
                                    className="w-16 h-16"
                                />
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-2">
                                <p>Feels like: {Math.round(weatherData.current.feels_like)}°C</p>
                                <p>Humidity: {weatherData.current.humidity}%</p>
                                <p>Wind: {Math.round(weatherData.current.wind_speed)} m/s</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Hourly Forecast</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex overflow-x-auto space-x-4 pb-2">
                                {weatherData.hourly.slice(1, 25).map((hour) => (
                                    <div key={hour.dt} className="flex flex-col items-center">
                                        <p className="text-sm">{formatTime(hour.dt)}</p>
                                        <img
                                            src={`http://openweathermap.org/img/wn/${hour.weather[0].icon}.png`}
                                            alt={hour.weather[0].description}
                                            className="w-8 h-8"
                                        />
                                        <p className="text-sm font-semibold">{Math.round(hour.temp)}°C</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>7-Day Forecast</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {weatherData.daily.slice(1).map((day) => (
                                    <div key={day.dt} className="flex items-center justify-between">
                                        <p className="w-24">{formatDate(day.dt)}</p>
                                        <img
                                            src={`http://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                                            alt={day.weather[0].description}
                                            className="w-8 h-8"
                                        />
                                        <p className="w-32 text-center">{day.weather[0].description}</p>
                                        <p className="w-24 text-right">
                                            {Math.round(day.temp.min)}°C / {Math.round(day.temp.max)}°C
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}