/**
 * 域名到数据库映射配置
 * 管理所有站点的域名和对应的数据库名称
 */

export interface SiteConfig {
  domain: string;
  database: string;
  dbHost?: string;
  dbPort?: number;
  dbUser?: string;
  dbPassword?: string;
}

// 域名到数据库映射表
// 生产环境建议从环境变量或数据库读取
export const DOMAIN_DB_MAP: Record<string, SiteConfig> = {
  // 示例配置
  'site1.example.com': {
    domain: 'site1.example.com',
    database: 'ediora_site1',
  },
  'site2.example.com': {
    domain: 'site2.example.com',
    database: 'ediora_site2',
  },
  // ... 添加更多站点
  // 可以通过脚本自动生成这100个站点的配置
};

// 默认数据库（用于管理后台或未匹配的域名）
export const DEFAULT_DATABASE = 'ediora_default';

/**
 * 根据域名获取数据库配置
 */
export function getDatabaseConfig(host: string): SiteConfig {
  // 移除端口号（如果有）
  const domain = host.split(':')[0].toLowerCase();
  
  // 查找匹配的配置
  const config = DOMAIN_DB_MAP[domain];
  
  if (config) {
    return {
      ...config,
      dbHost: config.dbHost || process.env.DB_HOST || 'localhost',
      dbPort: config.dbPort || parseInt(process.env.DB_PORT || '3306'),
      dbUser: config.dbUser || process.env.DB_USER || 'root',
      dbPassword: config.dbPassword || process.env.DB_PASSWORD || '',
    };
  }
  
  // 返回默认配置
  return {
    domain,
    database: DEFAULT_DATABASE,
    dbHost: process.env.DB_HOST || 'localhost',
    dbPort: parseInt(process.env.DB_PORT || '3306'),
    dbUser: process.env.DB_USER || 'root',
    dbPassword: process.env.DB_PASSWORD || '',
  };
}

/**
 * 从环境变量或配置文件加载映射
 * 生产环境建议使用数据库存储映射关系
 */
export async function loadDomainMapping(): Promise<Record<string, SiteConfig>> {
  // 方案1: 从环境变量读取（JSON格式）
  if (process.env.DOMAIN_DB_MAP) {
    try {
      return JSON.parse(process.env.DOMAIN_DB_MAP);
    } catch (e) {
      console.error('Failed to parse DOMAIN_DB_MAP from env:', e);
    }
  }
  
  // 方案2: 从数据库读取（推荐生产环境）
  // const mapping = await fetchMappingFromDatabase();
  // return mapping;
  
  // 方案3: 从文件读取
  // const mapping = await import('./domain-mapping.json');
  // return mapping.default;
  
  // 默认返回静态配置
  return DOMAIN_DB_MAP;
}

