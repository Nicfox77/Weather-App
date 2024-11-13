// app/api/send-email/route.ts

import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
    try {

        console.log('EMAIL_USER is defined:', !!process.env.EMAIL_USER)
        console.log('EMAIL_PASS is defined:', !!process.env.EMAIL_PASS)

        const { email, location, weatherData, unit } = await req.json()

        if (!email || !location || !weatherData || !unit) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
        }

        // Validate email format on the server side
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json({ message: 'Invalid email address' }, { status: 400 })
        }

        // Configure your SMTP transporter
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // Or your email service provider
            auth: {
                user: process.env.EMAIL_USER, // Your email address
                pass: process.env.EMAIL_PASS, // Your email password or app-specific password
            },
        })

        // Construct the email content
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Weather Report for ${location}`,
            html: generateEmailContent(location, weatherData, unit),
        }

        await transporter.sendMail(mailOptions)
        return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 })
    } catch (error) {
        console.error('Error sending email:', error)
        return NextResponse.json({ message: 'Failed to send email' }, { status: 500 })
    }
}

// Helper function to generate the email HTML content
function generateEmailContent(location: string, weatherData: any, unit: 'metric' | 'imperial') {
    // Format date and time
    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
        })
    }

    const formatTime = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
            hour: 'numeric',
            hour12: true,
        })
    }

    const unitSymbol = unit === 'metric' ? '°C' : '°F'
    const windSpeedUnit = unit === 'metric' ? 'm/s' : 'mph'

    // Extract data
    const { current, hourly, daily } = weatherData

    // Start building the email content
    let emailContent = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h1 style="color: #0275d8;">Weather Report for ${location}</h1>
      <h2>Current Weather</h2>
      <p><strong>Temperature:</strong> ${Math.round(current.temp)}${unitSymbol}</p>
      <p><strong>Feels Like:</strong> ${Math.round(current.feels_like)}${unitSymbol}</p>
      <p><strong>Weather:</strong> ${current.weather[0].description}</p>
      <p><strong>Humidity:</strong> ${current.humidity}%</p>
      <p><strong>Wind Speed:</strong> ${Math.round(current.wind_speed)} ${windSpeedUnit}</p>

      <h2>Hourly Forecast (Next 12 Hours)</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <th style="border: 1px solid #ddd; padding: 8px;">Time</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Temp (${unitSymbol})</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Weather</th>
        </tr>
  `

    // Include hourly forecast
    hourly.slice(0, 12).forEach((hour: any) => {
        emailContent += `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">${formatTime(hour.dt)}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${Math.round(hour.temp)}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${hour.weather[0].description}</td>
        </tr>
    `
    })

    emailContent += `
      </table>

      <h2>7-Day Forecast</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <th style="border: 1px solid #ddd; padding: 8px;">Date</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Min (${unitSymbol})</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Max (${unitSymbol})</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Weather</th>
        </tr>
  `

    // Include daily forecast
    daily.slice(1, 8).forEach((day: any) => {
        emailContent += `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">${formatDate(day.dt)}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${Math.round(day.temp.min)}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${Math.round(day.temp.max)}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${day.weather[0].description}</td>
        </tr>
    `
    })

    emailContent += `
      </table>
      <p>Thank you for using our Weather App!</p>
    </div>
  `

    return emailContent
}
