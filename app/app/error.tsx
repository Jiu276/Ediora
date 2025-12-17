'use client'

import { useEffect } from 'react'
import { Result, Button } from 'antd'
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
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
        title="页面加载出错"
        subTitle={
          <div>
            <p>抱歉，页面遇到了一个错误。请尝试刷新页面或返回首页。</p>
            {process.env.NODE_ENV === 'development' && (
              <details style={{ marginTop: 16, textAlign: 'left', maxWidth: 600 }}>
                <summary style={{ cursor: 'pointer', color: '#1890ff' }}>错误详情（开发模式）</summary>
                <pre
                  style={{
                    marginTop: 8,
                    padding: 12,
                    background: '#fff',
                    border: '1px solid #d9d9d9',
                    borderRadius: 4,
                    overflow: 'auto',
                    fontSize: 12,
                    maxHeight: 300,
                  }}
                >
                  {error.message}
                  {error.stack && (
                    <>
                      {'\n\n'}
                      {error.stack}
                    </>
                  )}
                </pre>
              </details>
            )}
          </div>
        }
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
  )
}

