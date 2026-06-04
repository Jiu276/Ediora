'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, List } from 'antd'
import type { ThemeConfig } from '@/lib/themeLoader'
import type { TocHeading } from '@/components/articleToc'

interface ArticleTocCardProps {
  headings: TocHeading[]
  config: ThemeConfig
  onNavigate: (id: string) => void
}

export default function ArticleTocCard({ headings, config, onNavigate }: ArticleTocCardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const headingIds = useMemo(() => headings.map((h) => h.id), [headings])

  useEffect(() => {
    if (headingIds.length === 0) return
    if (typeof window === 'undefined') return

    const els = headingIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))

    if (els.length === 0) return
    if (!('IntersectionObserver' in window)) return

    const observer = new IntersectionObserver(
      (entries) => {
        // 选择当前可见程度最高的那个
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))

        if (visible[0]?.target?.id) setActiveId(visible[0].target.id)
      },
      {
        root: null,
        threshold: [0.1, 0.25, 0.5, 0.75],
        // 让“靠近顶部”的标题更容易被选中
        rootMargin: '-10% 0px -70% 0px',
      },
    )

    for (const el of els) observer.observe(el)
    return () => observer.disconnect()
  }, [headingIds])

  return (
    <Card
      size="small"
      title="Contents"
      style={{
        marginBottom: 24,
        borderRadius: 10,
        background: config.colors.cardBackground,
        borderColor: config.colors.border,
      }}
      bodyStyle={{ paddingTop: 8, paddingBottom: 8 }}
    >
      <List
        size="small"
        dataSource={headings}
        split={false}
        renderItem={(h) => {
          const isActive = activeId === h.id
          const indent = Math.max(0, (h.level - 1) * 10) // 层级缩进
          return (
            <List.Item
              style={{
                padding: '3px 0',
              }}
            >
              <a
                href={`#${h.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  onNavigate(h.id)
                }}
                style={{
                  paddingLeft: indent,
                  color: isActive ? config.colors.primary : config.colors.subtext,
                  textDecoration: 'none',
                  lineHeight: 1.35,
                  fontSize: h.level === 2 ? 12.8 : 12.4,
                  fontWeight: isActive ? 650 : 550,
                  paddingTop: 0,
                  paddingBottom: 0,
                  display: 'block',
                }}
              >
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.text}</span>
              </a>
            </List.Item>
          )
        }}
      />
    </Card>
  )
}

