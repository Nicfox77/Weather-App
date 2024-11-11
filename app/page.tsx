import dotenv from "dotenv";
import WeatherApp from '@/components/weather-app'

dotenv.config();

export default function Home() {
  return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <WeatherApp />
      </main>
  )
}