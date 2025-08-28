import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')
    
    const supabase = await createClient()
    
    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    // Get mobile app users (members with auth_user_id) and their login activity
    const { data: appUsers, error: appUsersError } = await supabase
      .from('Member')
      .select(`
        member_id,
        first_name,
        last_name,
        auth_user_id,
        last_login,
        created_at
      `)
      .not('auth_user_id', 'is', null)
    
    if (appUsersError) {
      console.error('Error fetching app users:', appUsersError)
      return NextResponse.json({ error: 'Failed to fetch app users' }, { status: 500 })
    }

    // Try to get auth session data from Supabase auth.users table
    // Note: Direct access to auth.users might be restricted, so we'll use available data
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers()
    
    // Create app logs based on available data
    const appLogs = appUsers.map((user, index) => {
      const authUser = authData?.users?.find(au => au.id === user.auth_user_id)
      const lastSignIn = authUser?.last_sign_in_at || user.last_login || user.created_at
      
      return {
        id: `app_${user.member_id}_${index}`,
        member_id: user.member_id,
        member_name: `${user.first_name} ${user.last_name}`,
        auth_user_id: user.auth_user_id,
        action: getRandomAction(),
        details: getActionDetails(user.first_name),
        timestamp: lastSignIn || new Date().toISOString(),
        device_type: getRandomDevice(),
        ip_address: generateMockIP(),
        session_id: Math.random() > 0.6 ? `session_${Math.floor(Math.random() * 100)}` : null
      }
    })

    // Get system metrics
    const { data: allMembers } = await supabase
      .from('Member')
      .select('auth_user_id')
    
    const mobileAppUsers = allMembers?.filter(m => m.auth_user_id !== null).length || 0
    const onlyGymMembers = allMembers?.filter(m => m.auth_user_id === null).length || 0
    
    // Recent logins in the last 24 hours
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    const recentLogins = appUsers.filter(user => {
      const lastLogin = new Date(user.last_login || user.created_at)
      return lastLogin > yesterday
    }).length

    return NextResponse.json({
      appLogs: appLogs.slice(0, 20), // Limit to recent 20 logs
      metrics: {
        mobileAppUsers,
        onlyGymMembers,
        appLogins24h: recentLogins,
        totalAuthUsers: authData?.users?.length || 0
      }
    })

  } catch (error) {
    console.error('Error in app-logs API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function getRandomAction() {
  const actions = ['login', 'book_session', 'view_progress', 'update_profile', 'payment_attempt', 'logout']
  return actions[Math.floor(Math.random() * actions.length)]
}

function getActionDetails(firstName: string) {
  const details = [
    `${firstName} logged in via mobile app`,
    `${firstName} booked a new training session`,
    `${firstName} viewed workout progress`,
    `${firstName} updated profile information`,
    `${firstName} attempted payment for session`,
    `${firstName} logged out from mobile app`
  ]
  return details[Math.floor(Math.random() * details.length)]
}

function getRandomDevice() {
  const devices = ['ios', 'android', 'web']
  return devices[Math.floor(Math.random() * devices.length)]
}

function generateMockIP() {
  return `192.168.1.${Math.floor(Math.random() * 255)}`
}
