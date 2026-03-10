/**
 * Next.js 中间件
 * 在请求处理前识别域名并设置数据库上下文
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getDatabaseConfig } from './lib/domain-mapping';

// 将数据库配置存储到请求头中，供后续使用
export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const config = getDatabaseConfig(host);
  
  // 创建响应
  const response = NextResponse.next();
  
  // 将数据库配置添加到请求头（供 API 路由使用）
  response.headers.set('x-site-database', config.database);
  response.headers.set('x-site-domain', config.domain);
  
  // 也可以设置到环境变量（不推荐，因为会污染全局环境）
  // process.env.CURRENT_DATABASE = config.database;
  
  return response;
}

// 配置中间件匹配规则
export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了：
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

