'use client'

import { Space, Button, message } from 'antd'
import { 
  WeiboOutlined, 
  WechatOutlined, 
  QqOutlined, 
  CopyOutlined,
  ShareAltOutlined 
} from '@ant-design/icons'

interface ShareButtonsProps {
  title: string
  url: string
  description?: string
  image?: string
}

export default function ShareButtons({ title, url, description, image }: ShareButtonsProps) {
  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      message.success('链接已复制到剪贴板')
    } catch (error) {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = fullUrl
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        message.success('链接已复制到剪贴板')
      } catch (err) {
        message.error('复制失败，请手动复制')
      }
      document.body.removeChild(textArea)
    }
  }

  const handleWeibo = () => {
    const shareUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(fullUrl)}&title=${encodeURIComponent(title)}`
    window.open(shareUrl, '_blank', 'width=600,height=400')
  }

  const handleWechat = () => {
    message.info('请使用微信扫描二维码分享')
    // 这里可以集成二维码生成库
  }

  const handleQQ = () => {
    const shareUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(fullUrl)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description || '')}`
    window.open(shareUrl, '_blank', 'width=600,height=400')
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: fullUrl,
        })
      } catch (error) {
        // 用户取消分享
      }
    } else {
      handleCopy()
    }
  }

  return (
    <Space size="small" wrap>
      {navigator.share && (
        <Button
          icon={<ShareAltOutlined />}
          onClick={handleNativeShare}
          size="small"
        >
          分享
        </Button>
      )}
      <Button
        icon={<WeiboOutlined />}
        onClick={handleWeibo}
        size="small"
        style={{ color: '#e6162d' }}
      >
        微博
      </Button>
      <Button
        icon={<WechatOutlined />}
        onClick={handleWechat}
        size="small"
        style={{ color: '#07c160' }}
      >
        微信
      </Button>
      <Button
        icon={<QqOutlined />}
        onClick={handleQQ}
        size="small"
        style={{ color: '#12b7f5' }}
      >
        QQ
      </Button>
      <Button
        icon={<CopyOutlined />}
        onClick={handleCopy}
        size="small"
      >
        复制链接
      </Button>
    </Space>
  )
}

