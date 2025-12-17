import Link from 'next/link'
import { Result, Button } from 'antd'
import { HomeOutlined } from '@ant-design/icons'

export default function NotFound() {
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
        status="404"
        title="404"
        subTitle="抱歉，您访问的页面不存在。"
        extra={
          <Button type="primary" icon={<HomeOutlined />} href="/">
            返回首页
          </Button>
        }
      />
    </div>
  )
}

