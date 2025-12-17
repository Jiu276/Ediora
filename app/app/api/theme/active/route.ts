import { NextResponse } from 'next/server'
import { getActiveTheme } from '@/lib/themeLoader'
import { getThemeConfig } from '@/lib/themeConfig'

export async function GET() {
  try {
    const theme = await getActiveTheme()
    
    if (!theme) {
      // 如果没有激活的主题，返回默认主题配置
      const defaultConfig = getThemeConfig('default')
      return NextResponse.json({
        slug: 'default',
        name: '默认主题',
        config: {
          colors: {
            primary: defaultConfig.primary,
            accent: defaultConfig.accent,
            gradientStart: defaultConfig.gradientStart,
            gradientEnd: defaultConfig.gradientEnd,
          },
        },
      })
    }

    const visualConfig = getThemeConfig(theme.slug)
    
    return NextResponse.json({
      slug: theme.slug,
      name: theme.name,
      config: {
        colors: {
          primary: visualConfig.primary,
          accent: visualConfig.accent,
          gradientStart: visualConfig.gradientStart,
          gradientEnd: visualConfig.gradientEnd,
          text: visualConfig.text,
          subtext: visualConfig.subtext,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching active theme:', error)
    // 返回默认配置
    const defaultConfig = getThemeConfig('default')
    return NextResponse.json({
      slug: 'default',
      name: '默认主题',
      config: {
        colors: {
          primary: defaultConfig.primary,
          accent: defaultConfig.accent,
          gradientStart: defaultConfig.gradientStart,
          gradientEnd: defaultConfig.gradientEnd,
        },
      },
    })
  }
}
