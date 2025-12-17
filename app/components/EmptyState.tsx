'use client'

import { Empty, Button } from 'antd'
import { HomeOutlined } from '@ant-design/icons'
import Link from 'next/link'

interface EmptyStateProps {
  description?: string
  showHomeButton?: boolean
}

export default function EmptyState({ description = '暂无数据', showHomeButton = false }: EmptyStateProps) {
  return (
    <Empty
      description={description}
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      style={{ padding: '40px 20px' }}
    >
      {showHomeButton && (
        <Link href="/">
          <Button type="primary" icon={<HomeOutlined />}>
            返回首页
          </Button>
        </Link>
      )}
    </Empty>
  )
}

