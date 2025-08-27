import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get level distribution from levels table
    const { data: levelsData, error: levelsError } = await supabase
      .from('levels')
      .select('level')

    if (levelsError) {
      console.error('Error fetching levels data:', levelsError)
      return NextResponse.json({ error: 'Failed to fetch levels data' }, { status: 500 })
    }

    // Count users by level
    const levelCounts = {
      level1: 0,
      level2: 0,
      level3: 0,
      level4: 0,
      level5Plus: 0
    }

    levelsData?.forEach(({ level }) => {
      if (level === 1) levelCounts.level1++
      else if (level === 2) levelCounts.level2++
      else if (level === 3) levelCounts.level3++
      else if (level === 4) levelCounts.level4++
      else if (level >= 5) levelCounts.level5Plus++
    })

    const levelDistribution = [
      {
        name: 'Level 1',
        value: levelCounts.level1,
        color: '#8884d8'
      },
      {
        name: 'Level 2',
        value: levelCounts.level2,
        color: '#82ca9d'
      },
      {
        name: 'Level 3',
        value: levelCounts.level3,
        color: '#8dd1e1'
      },
      {
        name: 'Level 4',
        value: levelCounts.level4,
        color: '#82ca9d'
      },
      {
        name: 'Level 5+',
        value: levelCounts.level5Plus,
        color: '#8884d8'
      }
    ]

    return NextResponse.json({ 
      success: true, 
      data: levelDistribution,
      totals: {
        totalUsers: levelsData?.length || 0,
        level1: levelCounts.level1,
        level2: levelCounts.level2,
        level3: levelCounts.level3,
        level4: levelCounts.level4,
        level5Plus: levelCounts.level5Plus
      }
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}