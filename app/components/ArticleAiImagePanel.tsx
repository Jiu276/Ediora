'use client'

import { useState } from 'react'
import { Button, Card, Checkbox, Col, Image, Row, Space, Spin, message } from 'antd'
import { PictureOutlined } from '@ant-design/icons'
import { replaceImagesInContent, countContentImageSlots } from '@/lib/insertArticleImages'

/** AI 配图项 */
interface AiImageOption {
  id: string
  url: string
  thumbnail?: string
  description?: string
  source?: string
}

interface ArticleAiImagePanelProps {
  /** 文章 ID；新建文章时为 null */
  articleId: string | null
  /** 文章标题，用于生成配图 */
  title: string
  /** 文章正文 HTML，用作配图上下文 */
  content: string
  /** 当前封面 URL */
  featuredImage?: string | null
  /** 设置封面图 */
  onFeaturedImageChange: (url: string) => void
  /** 更新正文（插入配图时） */
  onContentChange: (html: string) => void
  /** 嵌入外层 Card 时不重复渲染边框 */
  embedded?: boolean
}

const AI_IMAGE_COUNT = 8

/**
 * 文章编辑页：AI 生成配图、多选、设为封面
 */
export default function ArticleAiImagePanel({
  articleId,
  title,
  content,
  onFeaturedImageChange,
  onContentChange,
  embedded = false,
}: ArticleAiImagePanelProps) {
  const [images, setImages] = useState<AiImageOption[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)

  /** 切换单张图片选中状态 */
  const toggleImage = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) {
        return prev.includes(id) ? prev : [...prev, id]
      }
      return prev.filter((item) => item !== id)
    })
  }

  /** 调用 API 生成 8 张配图 */
  const handleGenerate = async () => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      message.warning('请先填写文章标题')
      return
    }

    setGenerating(true)
    try {
      const res = await fetch('/api/auto-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: trimmedTitle,
          count: AI_IMAGE_COUNT,
          context: `${trimmedTitle}\n\n${content || ''}`.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        message.error(data.error || '生成配图失败')
        return
      }
      const list: AiImageOption[] = (data.images || []).map(
        (img: AiImageOption, index: number) => ({
          ...img,
          id: img.id || `ai-img-${index + 1}`,
        }),
      )
      setImages(list)
      setSelectedIds([])
      message.success(`已生成 ${list.length} 张配图`)
    } catch {
      message.error('生成配图失败，请稍后重试')
    } finally {
      setGenerating(false)
    }
  }

  /** 获取当前选中的图片对象（保持选择顺序） */
  const getSelectedImages = (): AiImageOption[] =>
    selectedIds
      .map((id) => images.find((img) => img.id === id))
      .filter((img): img is AiImageOption => Boolean(img))

  /** 将第一张选中图片设为封面 */
  const handleSetCover = () => {
    const selected = getSelectedImages()
    if (selected.length === 0) {
      message.warning('请先勾选要使用的图片')
      return
    }
    onFeaturedImageChange(selected[0].url)
    message.success('已设为封面图片')
  }

  /** 保存选中配图到文章配图表 */
  const handleSaveImages = async () => {
    if (!articleId) {
      message.warning('请先保存文章，再保存配图')
      return
    }
    const selected = getSelectedImages()
    if (selected.length === 0) {
      message.warning('请先勾选要保存的图片')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/articles/${articleId}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: selected.map((img) => ({
            url: img.url,
            thumbnail: img.thumbnail || img.url,
            description: img.description,
            source: img.source,
          })),
        }),
      })
      if (!res.ok) {
        message.error('保存配图失败')
        return
      }
      message.success(`已保存 ${selected.length} 张配图`)
    } catch {
      message.error('保存配图失败')
    } finally {
      setSaving(false)
    }
  }

  /** 将选中配图替换正文中已有图片（无图片时则插入） */
  const handleReplaceInContent = () => {
    const selected = getSelectedImages()
    if (selected.length === 0) {
      message.warning('请先勾选要使用的图片')
      return
    }
    const slots = countContentImageSlots(content)
    const next = replaceImagesInContent(content, selected, title.trim())
    onContentChange(next)
    if (slots > 0) {
      message.success(`已替换正文中 ${Math.min(selected.length, slots)} 张图片`)
    } else {
      message.success(`正文无图片，已插入 ${selected.length} 张配图`)
    }
  }

  const generateButton = (
    <Button
      type="primary"
      icon={<PictureOutlined />}
      onClick={handleGenerate}
      loading={generating}
    >
      生成 {AI_IMAGE_COUNT} 张配图
    </Button>
  )

  const panelBody = (
    <>
      {embedded && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <span style={{ fontWeight: 500 }}>AI 生成配图</span>
          {generateButton}
        </div>
      )}
      <Spin spinning={generating}>
      {images.length === 0 ? (
        <div style={{ color: '#999', fontSize: 13 }}>
          将根据标题与各章节正文提取关键词，生成 8 张主题相关配图。选中后可替换正文中已有图片，或设为封面。
          {countContentImageSlots(content) > 0 && (
            <div style={{ marginTop: 6, color: '#1677ff' }}>
              检测到正文中有 {countContentImageSlots(content)} 张图片，可直接替换。
            </div>
          )}
        </div>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {images.map((image) => (
              <Col key={image.id} xs={12} sm={8} md={6}>
                <div
                  style={{
                    border: selectedIds.includes(image.id)
                      ? '2px solid #1677ff'
                      : '1px solid #f0f0f0',
                    borderRadius: 8,
                    overflow: 'hidden',
                    background: '#fff',
                  }}
                >
                  <Image
                    src={image.url}
                    alt={image.description || title}
                    style={{ width: '100%', height: 120, objectFit: 'cover' }}
                    preview
                  />
                  <div style={{ padding: '8px 12px' }}>
                    <Checkbox
                      checked={selectedIds.includes(image.id)}
                      onChange={(e) => toggleImage(image.id, e.target.checked)}
                    >
                      选择图片
                    </Checkbox>
                    {image.description && (
                      <div
                        style={{
                          marginTop: 4,
                          fontSize: 12,
                          color: '#999',
                          lineHeight: 1.4,
                        }}
                      >
                        {image.description}
                      </div>
                    )}
                  </div>
                </div>
              </Col>
            ))}
          </Row>

          <div style={{ marginTop: 12, color: '#666', fontSize: 13 }}>
            已选择 {selectedIds.length} / {images.length} 张
          </div>

          <Space wrap style={{ marginTop: 16 }}>
            <Button type="primary" onClick={handleSetCover} disabled={selectedIds.length === 0}>
              添加为封面图片
            </Button>
            <Button type="primary" onClick={handleReplaceInContent} disabled={selectedIds.length === 0}>
              替换正文中的图片
            </Button>
            <Button
              onClick={handleSaveImages}
              loading={saving}
              disabled={!articleId || selectedIds.length === 0}
            >
              保存选中配图
            </Button>
          </Space>
        </>
      )}
      </Spin>
    </>
  )

  if (embedded) {
    return panelBody
  }

  return (
    <Card
      type="inner"
      title="AI 生成配图"
      style={{ marginBottom: 24 }}
      extra={generateButton}
    >
      {panelBody}
    </Card>
  )
}
