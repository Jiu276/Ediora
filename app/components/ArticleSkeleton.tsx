'use client'

import { Card, Skeleton, Row, Col } from 'antd'

interface ArticleSkeletonProps {
  count?: number
  columns?: { xs?: number; sm?: number; lg?: number }
}

export default function ArticleSkeleton({ count = 6, columns = { xs: 24, sm: 12, lg: 8 } }: ArticleSkeletonProps) {
  return (
    <Row gutter={[16, 16]}>
      {Array.from({ length: count }).map((_, index) => (
        <Col {...columns} key={index}>
          <Card>
            <Skeleton.Image active style={{ width: '100%', height: 200 }} />
            <Skeleton active paragraph={{ rows: 2 }} style={{ marginTop: 16 }} />
            <Skeleton.Button active size="small" style={{ marginTop: 8 }} />
          </Card>
        </Col>
      ))}
    </Row>
  )
}

