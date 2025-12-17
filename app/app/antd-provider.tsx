'use client'

import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import enUS from 'antd/locale/en_US'
import React from 'react'
import { usePathname } from 'next/navigation'

export default function AntdProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  return (
    <ConfigProvider locale={isAdmin ? zhCN : enUS}>
      {children}
    </ConfigProvider>
  )
}

