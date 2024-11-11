import WeatherApp from '@/components/weather-app'

export default function Home() {
  return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <WeatherApp />
      </main>
  )
}