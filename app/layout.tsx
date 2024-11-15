import '@/styles/globals.css'
import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({subsets: ['latin']})

export const metadata: Metadata = {
    title: 'Weather App',
    description: 'A simple weather application with location search and forecasts',
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body className={`${inter.className} bg-background text-foreground sm:px-0`}>
        {children}
        <SpeedInsights />
        <Analytics  />
        </body>
        </html>
    )
}