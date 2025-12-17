'use client'

import { Component, ReactNode } from 'react'
import { Result, Button } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Result
          status="500"
          title="页面加载出错"
          subTitle={this.state.error?.message || '抱歉，页面出现了一些问题'}
          extra={
            <Button type="primary" icon={<ReloadOutlined />} onClick={this.handleReset}>
              重新加载
            </Button>
          }
        />
      )
    }

    return this.props.children
  }
}
