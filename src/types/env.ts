// Cloudflare Workers环境变量类型定义
export interface Env {
  // 必需的API密钥
  OPENAI_API_KEY: string;
  WEATHER_API_KEY?: string;
  
  // 应用配置
  APP_NAME?: string;
  APP_VERSION?: string;
  ENVIRONMENT?: 'development' | 'staging' | 'production';
  DEBUG?: string;
  
  // Cloudflare特定的绑定
  // 如果需要KV存储、D1数据库等，可以在这里添加
  // WEATHER_CACHE?: KVNamespace;
  // DB?: D1Database;
}

// 响应类型定义
export interface WeatherResponse {
  success: boolean;
  data?: {
    city: string;
    temperature: number;
    description: string;
    humidity: number;
    windSpeed: number;
    advice: string;
  };
  error?: string;
  timestamp: string;
}

// 请求类型定义
export interface WeatherRequest {
  city: string;
  language?: 'zh' | 'en';
}