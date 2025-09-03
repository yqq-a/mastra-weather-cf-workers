// Cloudflare Workers优化的天气工具
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import type { Env } from '../types/env';

interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  description: string;
  windSpeed: number;
  pressure: number;
  visibility: number;
}

// 获取天气信息的函数，优化for Cloudflare Workers
const getWeatherInfo = async (city: string, env: Env): Promise<WeatherData> => {
  const apiKey = env.WEATHER_API_KEY;
  
  // 如果没有API密钥，返回模拟数据
  if (!apiKey || apiKey === 'demo_key') {
    console.log(`使用模拟数据为 ${city}`);
    return {
      temperature: Math.round(15 + Math.random() * 20), // 15-35度随机
      feelsLike: Math.round(15 + Math.random() * 20),
      humidity: Math.round(40 + Math.random() * 40), // 40-80%随机
      description: getRandomWeatherDescription(),
      windSpeed: Math.round(Math.random() * 10), // 0-10m/s
      pressure: Math.round(1000 + Math.random() * 50), // 1000-1050hPa
      visibility: Math.round(5 + Math.random() * 15) // 5-20km
    };
  }
  
  try {
    // 使用fetch API调用OpenWeatherMap
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=zh_cn`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mastra-Weather-App/1.0'
      },
      // Cloudflare Workers的fetch选项
      cf: {
        cacheTtl: 300, // 缓存5分钟
        cacheEverything: true
      }
    });
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json() as any;
    
    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      description: data.weather[0].description || '未知',
      windSpeed: Math.round((data.wind?.speed || 0) * 10) / 10,
      pressure: data.main.pressure,
      visibility: data.visibility ? Math.round(data.visibility / 1000) : 10
    };
  } catch (error) {
    console.error('获取天气信息失败:', error);
    
    // 如果API调用失败，返回模拟数据以保证服务可用性
    return {
      temperature: Math.round(15 + Math.random() * 20),
      feelsLike: Math.round(15 + Math.random() * 20), 
      humidity: Math.round(40 + Math.random() * 40),
      description: `${city}天气数据暂时无法获取，显示模拟数据`,
      windSpeed: Math.round(Math.random() * 10),
      pressure: 1013,
      visibility: 10
    };
  }
};

// 随机天气描述（模拟数据用）
function getRandomWeatherDescription(): string {
  const descriptions = [
    '晴朗', '多云', '阴天', '小雨', '中雨', 
    '雷阵雨', '雾', '轻雾', '晴转多云', '多云转阴'
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

// 创建天气工具，适配Cloudflare Workers环境
export const createWeatherTool = (env: Env) => {
  return createTool({
    id: "get-weather-info",
    description: `获取指定城市的实时天气信息，包括温度、湿度、风速等。支持中文城市名称查询。`,
    inputSchema: z.object({
      city: z.string().describe("要查询天气的城市名称，例如：北京、上海、深圳、New York等")
    }),
    outputSchema: z.object({
      temperature: z.number().describe("当前温度(摄氏度)"),
      feelsLike: z.number().describe("体感温度(摄氏度)"),
      humidity: z.number().describe("湿度百分比"),
      description: z.string().describe("天气描述"),
      windSpeed: z.number().describe("风速(米/秒)"),
      pressure: z.number().describe("气压(百帕)"),
      visibility: z.number().describe("能见度(公里)")
    }),
    execute: async ({ context: { city } }) => {
      console.log(`🌤️ 正在获取 ${city} 的天气信息...`);
      
      const weatherData = await getWeatherInfo(city, env);
      
      console.log(`✅ 成功获取 ${city} 的天气信息`);
      
      return weatherData;
    }
  });
};