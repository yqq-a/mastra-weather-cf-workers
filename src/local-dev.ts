// 本地开发测试文件
import { serve } from '@hono/node-server';
import app from './index';
import type { Env } from './types/env';

// 从环境变量加载配置
const env: Env = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  WEATHER_API_KEY: process.env.WEATHER_API_KEY || 'demo_key',
  APP_NAME: 'Mastra Weather App (Local)',
  APP_VERSION: '1.0.0-local',
  ENVIRONMENT: 'development',
  DEBUG: 'true'
};

// 检查必需的环境变量
if (!env.OPENAI_API_KEY) {
  console.error('❌ 缺少 OPENAI_API_KEY 环境变量');
  console.log('💡 请设置环境变量或在 .env 文件中配置');
  console.log('   export OPENAI_API_KEY=sk-your_key_here');
  console.log('   或者创建 .env 文件：');
  console.log('   echo "OPENAI_API_KEY=sk-your_key_here" > .env');
  process.exit(1);
}

// 创建本地开发服务器
const port = 3000;

console.log('🚀 启动本地开发服务器...');
console.log(`📍 服务器地址: http://localhost:${port}`);
console.log('🔧 环境配置:');
console.log(`   - OpenAI API Key: ${env.OPENAI_API_KEY ? '✅ 已配置' : '❌ 未配置'}`);
console.log(`   - Weather API Key: ${env.WEATHER_API_KEY && env.WEATHER_API_KEY !== 'demo_key' ? '✅ 已配置' : '⚠️ 使用模拟数据'}`);
console.log(`   - 环境: ${env.ENVIRONMENT}`);
console.log('\n🧪 测试端点:');
console.log(`   - 主页: http://localhost:${port}/`);
console.log(`   - 健康检查: http://localhost:${port}/health`);
console.log(`   - 天气查询: http://localhost:${port}/api/weather`);
console.log(`   - 快速测试: http://localhost:${port}/api/weather/北京`);
console.log('\n📝 API测试示例:');
console.log(`curl -X POST http://localhost:${port}/api/weather -H "Content-Type: application/json" -d '{"city":"上海"}'`);
console.log('');

// 启动服务器
serve({
  fetch: (req) => app.fetch(req, env),
  port
}, (info) => {
  console.log(`✅ 服务器运行在 http://localhost:${info.port}`);
  console.log('\n按 Ctrl+C 停止服务器');
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n👋 正在停止服务器...');
  process.exit(0);
});