/**
 * 测试 Gemini API 可用的模型和端点
 * 用于调试 API 调用问题
 */

const API_KEY = process.env.GOOGLE_AI_API_KEY

/**
 * 测试不同的模型和 API 版本
 */
export async function testGeminiModels() {
  if (!API_KEY) {
    console.error('❌ API Key 未配置')
    return
  }

  const models = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro-latest',
  ]

  const versions = ['v1', 'v1beta']

  console.log('🧪 开始测试 Gemini API 模型...\n')

  for (const version of versions) {
    for (const model of models) {
      const endpoint = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${API_KEY}`
      
      try {
        console.log(`测试: ${version}/${model}`)
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Hello' }] }],
          }),
        })

        if (response.ok) {
          console.log(`✅ ${version}/${model} - 可用！`)
          return { version, model, endpoint }
        } else {
          const error = await response.text()
          console.log(`❌ ${version}/${model} - ${response.status}: ${error.substring(0, 100)}`)
        }
      } catch (error: any) {
        console.log(`❌ ${version}/${model} - 错误: ${error.message}`)
      }
    }
  }

  console.log('\n⚠️ 没有找到可用的模型，请检查 API Key 或网络连接')
  return null
}

