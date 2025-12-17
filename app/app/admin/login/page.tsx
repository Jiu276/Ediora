'use client'

import { useState, useEffect } from 'react'
import { Form, Input, Button, message } from 'antd'
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'

interface ThemeColors {
  primary: string
  accent: string
  gradientStart: string
  gradientEnd: string
  text?: string
  subtext?: string
}

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [themeColors, setThemeColors] = useState<ThemeColors>({
    primary: '#667eea',
    accent: '#764ba2',
    gradientStart: '#667eea',
    gradientEnd: '#764ba2',
  })

  // 获取当前主题颜色
  useEffect(() => {
    fetch('/api/theme/active')
      .then((res) => res.json())
      .then((data) => {
        if (data?.config?.colors) {
          setThemeColors(data.config.colors)
        }
      })
      .catch((error) => {
        console.error('Failed to fetch theme:', error)
      })
  }, [])

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        message.error(data.error || '登录失败')
        return
      }

      message.success('登录成功')
      // 跳转到后台首页
      router.push('/admin')
      router.refresh()
    } catch (error) {
      console.error('Login error:', error)
      message.error('登录失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 生成渐变背景
  const gradientBackground = `linear-gradient(135deg, ${themeColors.gradientStart} 0%, ${themeColors.gradientEnd} 50%, ${adjustBrightness(themeColors.gradientEnd, 20)} 100%)`

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: gradientBackground,
        backgroundSize: '400% 400%',
        animation: 'gradient 15s ease infinite',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style jsx>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>

      {/* 装饰性背景元素 */}
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-30%',
          left: '-30%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 10s ease-in-out infinite reverse',
        }}
      />

      {/* 登录卡片 */}
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '48px 40px',
          boxShadow: `0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)`,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo 区域 */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              width: 80,
              height: 80,
              margin: '0 auto 24px',
              background: `linear-gradient(135deg, ${themeColors.gradientStart} 0%, ${themeColors.gradientEnd} 100%)`,
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 10px 30px ${hexToRgba(themeColors.primary, 0.4)}`,
            }}
          >
            <SafetyOutlined style={{ fontSize: 40, color: '#fff' }} />
          </div>
          <h1
            style={{
              margin: 0,
              marginBottom: 8,
              fontSize: 32,
              fontWeight: 700,
              color: themeColors.primary || '#1890ff',
            }}
          >
            <span
              style={{
                background: `linear-gradient(135deg, ${themeColors.gradientStart} 0%, ${themeColors.gradientEnd} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: themeColors.primary || '#1890ff', // 后备颜色
              }}
            >
              Ediora
            </span>
          </h1>
          <p
            style={{
              color: '#333',
              margin: 0,
              fontSize: 14,
              letterSpacing: '0.5px',
              fontWeight: 400,
            }}
          >
            内容管理系统
          </p>
        </div>

        {/* 表单 */}
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
            style={{ marginBottom: 24 }}
          >
            <Input
              prefix={<UserOutlined style={{ color: themeColors.primary }} />}
              placeholder="用户名"
              style={{
                height: 48,
                borderRadius: '12px',
                border: '2px solid #e8e8e8',
                fontSize: 15,
                color: '#333',
                transition: 'all 0.3s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = themeColors.primary
                e.target.style.boxShadow = `0 0 0 3px ${hexToRgba(themeColors.primary, 0.1)}`
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e8e8e8'
                e.target.style.boxShadow = 'none'
              }}
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
            style={{ marginBottom: 32 }}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: themeColors.primary }} />}
              placeholder="密码"
              style={{
                height: 48,
                borderRadius: '12px',
                border: '2px solid #e8e8e8',
                fontSize: 15,
                color: '#333',
                transition: 'all 0.3s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = themeColors.primary
                e.target.style.boxShadow = `0 0 0 3px ${hexToRgba(themeColors.primary, 0.1)}`
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e8e8e8'
                e.target.style.boxShadow = 'none'
              }}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{
                height: 52,
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${themeColors.gradientStart} 0%, ${themeColors.gradientEnd} 100%)`,
                border: 'none',
                fontSize: 16,
                fontWeight: 600,
                boxShadow: `0 8px 20px ${hexToRgba(themeColors.primary, 0.4)}`,
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = `0 12px 30px ${hexToRgba(themeColors.primary, 0.5)}`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = `0 8px 20px ${hexToRgba(themeColors.primary, 0.4)}`
              }}
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </Form.Item>
        </Form>

        {/* 底部提示 */}
        <div
          style={{
            textAlign: 'center',
            marginTop: 32,
            paddingTop: 24,
            borderTop: '1px solid #f0f0f0',
          }}
        >
          <p
            style={{
              margin: 0,
              color: '#666',
              fontSize: 12,
            }}
          >
            安全登录 · 保护您的账户安全
          </p>
        </div>
      </div>
    </div>
  )
}

// 工具函数：将十六进制颜色转换为 rgba
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// 工具函数：调整颜色亮度
function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.min(255, Math.max(0, (num >> 16) + amt))
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt))
  const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt))
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)
}
