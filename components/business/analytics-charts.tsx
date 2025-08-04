"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { useTranslation } from "@/lib/i18n"

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface AnalyticsChartsProps {
  revenueData: {
    labels: string[]
    data: number[]
  }
  bookingsData: {
    labels: string[]
    data: number[]
  }
  customerDemographics: {
    labels: string[]
    data: number[]
  }
}

export function AnalyticsCharts({ revenueData, bookingsData, customerDemographics }: AnalyticsChartsProps) {
  const { t } = useTranslation()

  // Revenue over time chart
  const revenueChartData = {
    labels: revenueData.labels,
    datasets: [
      {
        label: t('revenue'),
        data: revenueData.data,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        fill: false,
      },
    ],
  }

  // Bookings over time chart
  const bookingsChartData = {
    labels: bookingsData.labels,
    datasets: [
      {
        label: t('bookings'),
        data: bookingsData.data,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
    ],
  }

  // Customer demographics chart
  const demographicsChartData = {
    labels: customerDemographics.labels,
    datasets: [
      {
        data: customerDemographics.data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle>{t('revenue_trend')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Line data={revenueChartData} options={chartOptions} />
        </CardContent>
      </Card>

      {/* Bookings Trend */}
      <Card>
        <CardHeader>
          <CardTitle>{t('bookings_trend')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Bar data={bookingsChartData} options={chartOptions} />
        </CardContent>
      </Card>

      {/* Customer Demographics */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>{t('customer_demographics')}</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="w-1/2">
            <Doughnut data={demographicsChartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 