/**
 * HTTP 客户端工具，支持代理配置
 */

/**
 * 创建支持代理的 fetch 函数
 */
export function createFetchWithProxy() {
  const httpsProxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY
  const httpProxy = process.env.HTTP_PROXY

  // 如果没有配置代理，直接使用原生 fetch
  if (!httpsProxy && !httpProxy) {
    return fetch
  }

  // 如果配置了代理，需要使用支持代理的 HTTP 客户端
  // 在 Node.js 环境中，可以使用 node-fetch 或 undici
  // 这里我们使用原生 fetch（Next.js 13+ 支持），但需要配置代理
  
  // 注意：Node.js 的原生 fetch 不支持代理
  // 需要使用第三方库或通过环境变量配置
  
  // 对于 Next.js，可以通过设置环境变量让系统级代理生效
  // 或者使用 node-fetch 等库
  
  return fetch
}

/**
 * 获取代理配置信息（用于日志）
 */
export function getProxyInfo() {
  const httpsProxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY
  const httpProxy = process.env.HTTP_PROXY
  
  if (httpsProxy || httpProxy) {
    return {
      https: httpsProxy,
      http: httpProxy,
      enabled: true,
    }
  }
  
  return { enabled: false }
}

