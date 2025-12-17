/**
 * 移动端优化工具函数
 */

/**
 * 检测是否为移动设备
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

/**
 * 检测是否为平板设备
 */
export function isTablet(): boolean {
  if (typeof window === 'undefined') return false
  const width = window.innerWidth
  return width >= 768 && width < 1024
}

/**
 * 检测是否为桌面设备
 */
export function isDesktop(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth >= 1024
}

/**
 * 获取响应式列数配置
 */
export function getResponsiveCols() {
  if (typeof window === 'undefined') {
    return { xs: 24, sm: 12, lg: 8 }
  }

  if (isMobile()) {
    return { xs: 24 }
  } else if (isTablet()) {
    return { xs: 24, sm: 12 }
  } else {
    return { xs: 24, sm: 12, lg: 8 }
  }
}

/**
 * 优化移动端字体大小
 */
export function getResponsiveFontSize(baseSize: number): number {
  if (typeof window === 'undefined') return baseSize
  if (isMobile()) {
    return Math.max(baseSize * 0.9, 14)
  }
  return baseSize
}

/**
 * 优化移动端间距
 */
export function getResponsiveSpacing(baseSpacing: number): number {
  if (typeof window === 'undefined') return baseSpacing
  if (isMobile()) {
    return Math.max(baseSpacing * 0.75, 8)
  }
  return baseSpacing
}

