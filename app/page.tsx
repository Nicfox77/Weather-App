import dotenv from "dotenv";
import WeatherApp from '@/components/weather-app'

dotenv.config();

export default function Home() {
  return (
      <main className="flex min-h-screen sm:px-0 flex-col items-center justify-center">
        <WeatherApp />
      </main>
  )
}