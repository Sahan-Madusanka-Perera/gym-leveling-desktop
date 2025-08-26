import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get all users from mobile app (users table)
    const { data: allMobileUsers, error: mobileError } = await supabase
      .from('users')
      .select('userId')

    if (mobileError) {
      console.error('Error fetching mobile users:', mobileError)
      return NextResponse.json({ error: 'Failed to fetch mobile users' }, { status: 500 })
    }

    // Get all gym members with mobile accounts (auth_user_id is not null)
    const { data: membersWithMobile, error: memberError } = await supabase
      .from('Member')
      .select('auth_user_id')
      .not('auth_user_id', 'is', null)

    if (memberError) {
      console.error('Error fetching members with mobile:', memberError)
      return NextResponse.json({ error: 'Failed to fetch members with mobile' }, { status: 500 })
    }

    // Create a set of auth_user_ids from gym members who have mobile accounts
    const memberAuthIds = new Set(membersWithMobile?.map(member => member.auth_user_id) || [])
    
    // Mobile-only users: users in mobile app who are NOT gym members
    const mobileOnlyUsers = allMobileUsers?.filter(user => !memberAuthIds.has(user.userId)) || []

    const userDistribution = [
      {
        name: 'Mobile Only Users',
        value: mobileOnlyUsers.length,
        color: '#8884d8'
      },
      {
        name: 'Gym Members with Mobile',
        value: membersWithMobile?.length || 0,
        color: '#82ca9d'
      }
    ]

    return NextResponse.json({ 
      success: true, 
      data: userDistribution,
      totals: {
        mobileOnlyUsers: mobileOnlyUsers.length,
        membersWithMobile: membersWithMobile?.length || 0,
        totalMobileUsers: allMobileUsers?.length || 0
      }
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
