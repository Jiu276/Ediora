import { NextResponse } from 'next/server'
import { clearAuthSession } from '@/lib/auth'

export async function POST() {
  try {
    await clearAuthSession()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: '登出失败' },
      { status: 500 }
    )
  }
}

