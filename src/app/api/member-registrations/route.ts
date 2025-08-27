import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || 'monthly'
    
    const supabase = await createClient()

    if (timeframe === 'yearly') {
      // Get data for the last 5 years
      const currentYear = new Date().getFullYear()
      const startYear = currentYear - 4
      
      const { data, error } = await supabase
        .from('Member')
        .select('created_at')
        .gte('created_at', `${startYear}-01-01T00:00:00Z`)
      
      if (error) {
        console.error('Error fetching members:', error)
        return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
      }
      
      if (!data || data.length === 0) {
        return NextResponse.json({
          success: true,
          data: [],
          totals: { totalRegistrations: 0, currentPeriodRegistrations: 0 }
        })
      }
      
      // Group data by year
      const yearlyCounts: { [key: number]: number } = {}
      for (let year = startYear; year <= currentYear; year++) {
        yearlyCounts[year] = 0
      }
      
      data.forEach(member => {
        const year = new Date(member.created_at).getFullYear()
        if (year >= startYear && year <= currentYear) {
          yearlyCounts[year] = (yearlyCounts[year] || 0) + 1
        }
      })
      
      const resultData = Object.keys(yearlyCounts).map(year => ({
        name: year.toString(),
        registrations: yearlyCounts[parseInt(year)]
      }))
      
      const totalRegistrations = data.length
      const currentYearRegistrations = yearlyCounts[currentYear] || 0
      
      return NextResponse.json({
        success: true,
        data: resultData,
        totals: {
          totalRegistrations,
          currentPeriodRegistrations: currentYearRegistrations
        }
      })
      
    } else if (timeframe === 'weekly') {
      // Get data for the last 8 weeks
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - 55) // 8 weeks * 7 days - 1 day
      
      const { data, error } = await supabase
        .from('Member')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
      
      if (error) {
        console.error('Error fetching members:', error)
        return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
      }
      
      if (!data || data.length === 0) {
        return NextResponse.json({
          success: true,
          data: [],
          totals: { totalRegistrations: 0, currentPeriodRegistrations: 0 }
        })
      }
      
      // Group data by week
      const weekData: { name: string; registrations: number }[] = []
      const currentDate = new Date()
      
      for (let i = 7; i >= 0; i--) {
        const weekEndDate = new Date(currentDate)
        weekEndDate.setDate(currentDate.getDate() - (i * 7))
        const weekStartDate = new Date(weekEndDate)
        weekStartDate.setDate(weekEndDate.getDate() - 6)
        
        // Format week label
        const weekLabel = `W${8-i}`
        
        const count = data.filter(member => {
          const joinDate = new Date(member.created_at)
          return joinDate >= weekStartDate && joinDate <= weekEndDate
        }).length
        
        weekData.push({ 
          name: weekLabel, 
          registrations: count 
        })
      }
      
      const totalRegistrations = data.length
      const currentWeekRegistrations = weekData[weekData.length - 1].registrations
      
      return NextResponse.json({
        success: true,
        data: weekData,
        totals: {
          totalRegistrations,
          currentPeriodRegistrations: currentWeekRegistrations
        }
      })
      
    } else { // monthly (default)
      // Get current date and last 12 months
      const currentDate = new Date()
      const pastYearDate = new Date()
      pastYearDate.setMonth(currentDate.getMonth() - 11)

      const { data, error } = await supabase
        .from('Member')
        .select('created_at')
        .gte('created_at', pastYearDate.toISOString())

      if (error) {
        console.error('Error fetching members:', error)
        return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
      }
      
      if (!data || data.length === 0) {
        return NextResponse.json({
          success: true,
          data: [],
          totals: { totalRegistrations: 0, currentPeriodRegistrations: 0 }
        })
      }
      
      // Group data in JS by month
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const monthlyData: { name: string; registrations: number }[] = []
      let currentMonthRegistrations = 0

      for (let i = 11; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const year = date.getFullYear()
        const month = date.getMonth()
        const monthName = `${monthNames[month]} ${year.toString().slice(2)}`

        const startDate = new Date(year, month, 1)
        const endDate = new Date(year, month + 1, 0, 23, 59, 59)

        const count = data.filter(member => {
          const joinDate = new Date(member.created_at)
          return joinDate >= startDate && joinDate <= endDate
        }).length

        if (i === 0) currentMonthRegistrations = count

        monthlyData.push({ name: monthName, registrations: count })
      }

      return NextResponse.json({
        success: true,
        data: monthlyData,
        totals: {
          totalRegistrations: data.length,
          currentPeriodRegistrations: currentMonthRegistrations
        }
      })
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



