/**
 * 数据库路由逻辑
 * 根据域名动态切换 Prisma 数据库连接
 */

import { PrismaClient } from '@prisma/client';
import { getDatabaseConfig, type SiteConfig } from './domain-mapping';

// 存储不同数据库的 Prisma 客户端实例
const prismaClients: Map<string, PrismaClient> = new Map();

/**
 * 获取指定数据库的 Prisma 客户端
 * 使用连接池复用，避免创建过多连接
 */
export function getPrismaClient(config: SiteConfig): PrismaClient {
  const key = config.database;
  
  // 如果已存在客户端，直接返回
  if (prismaClients.has(key)) {
    return prismaClients.get(key)!;
  }
  
  // 创建新的 Prisma 客户端
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: buildDatabaseUrl(config),
      },
    },
    // 配置连接池
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
  
  // 存储客户端
  prismaClients.set(key, prisma);
  
  return prisma;
}

/**
 * 构建数据库连接 URL
 */
function buildDatabaseUrl(config: SiteConfig): string {
  const { dbHost, dbPort, dbUser, dbPassword, database } = config;
  
  // 如果提供了完整的数据库 URL，直接使用
  if (process.env.DATABASE_URL) {
    // 替换数据库名称
    return process.env.DATABASE_URL.replace(/\/[^\/]+$/, `/${database}`);
  }
  
  // 构建连接 URL
  const password = dbPassword ? `:${encodeURIComponent(dbPassword)}` : '';
  const auth = dbUser ? `${dbUser}${password}@` : '';
  const host = dbHost || 'localhost';
  const port = dbPort || 3306;
  
  return `mysql://${auth}${host}:${port}/${database}?connection_limit=5&pool_timeout=20`;
}

/**
 * 根据请求域名获取 Prisma 客户端
 */
export function getPrismaByHost(host: string): PrismaClient {
  const config = getDatabaseConfig(host);
  return getPrismaClient(config);
}

/**
 * 清理所有 Prisma 客户端连接
 * 用于优雅关闭
 */
export async function disconnectAll(): Promise<void> {
  const promises = Array.from(prismaClients.values()).map(client => 
    client.$disconnect()
  );
  await Promise.all(promises);
  prismaClients.clear();
}

/**
 * 获取当前活跃的数据库连接数
 */
export function getActiveConnections(): number {
  return prismaClients.size;
}

