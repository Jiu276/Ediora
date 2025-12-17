'use client'

import { useEffect } from 'react'
import { Result, Button } from 'antd'
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="zh-CN">
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: '#f5f5f5',
          }}
        >
          <Result
            status="error"
            title="应用加载出错"
            subTitle="抱歉，应用遇到了一个严重错误。请尝试刷新页面。"
            extra={[
              <Button type="primary" key="reload" icon={<ReloadOutlined />} onClick={reset}>
                重试
              </Button>,
              <Button key="home" icon={<HomeOutlined />} onClick={() => (window.location.href = '/')}>
                返回首页
              </Button>,
            ]}
          />
        </div>
      </body>
    </html>
  )
}

