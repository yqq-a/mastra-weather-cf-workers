// Cloudflare Workers主入口文件
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { createWeatherAgent } from './lib/weather-agent';
import type { Env, WeatherRequest, WeatherResponse } from './types/env';

// 创建Hono应用实例
type Variables = {
  env: Env;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// 中间件配置
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
}));

app.use('*', logger());
app.use('*', prettyJSON());

// 健康检查端点
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    service: 'Mastra Weather CF Workers',
    version: c.env.APP_VERSION || '1.0.0',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT || 'development'
  });
});

// 根路径 - 提供简单的使用说明
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🌤️ Mastra Weather API</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px; margin: 0 auto; padding: 20px;
            background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
            color: white; min-height: 100vh;
        }
        .card {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 30px;
            margin: 20px 0;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .endpoint {
            background: rgba(0,0,0,0.2);
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
            font-family: 'Monaco', 'Consolas', monospace;
            word-break: break-all;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            background: rgba(255,255,255,0.2);
            border-radius: 20px;
            font-size: 0.9em;
            margin: 5px 5px 5px 0;
        }
        h1 { text-align: center; margin-bottom: 30px; }
        pre { 
            background: rgba(0,0,0,0.3); 
            padding: 15px; 
            border-radius: 8px; 
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        a { color: #74b9ff; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .test-form {
            background: rgba(255,255,255,0.05);
            padding: 20px;
            border-radius: 10px;
            margin: 15px 0;
        }
        .form-group {
            margin: 10px 0;
        }
        input, button {
            width: 100%;
            padding: 12px;
            border: 1px solid rgba(255,255,255,0.3);
            border-radius: 8px;
            background: rgba(255,255,255,0.1);
            color: white;
            font-size: 16px;
            box-sizing: border-box;
        }
        input::placeholder {
            color: rgba(255,255,255,0.7);
        }
        button {
            background: rgba(255,255,255,0.2);
            cursor: pointer;
            margin-top: 10px;
        }
        button:hover {
            background: rgba(255,255,255,0.3);
        }
        #result {
            margin-top: 15px;
            padding: 15px;
            background: rgba(0,0,0,0.2);
            border-radius: 8px;
            display: none;
        }
    </style>
</head>
<body>
    <h1>🌤️ Mastra Weather API</h1>
    
    <div class="card">
        <h2>⚡ 服务状态</h2>
        <div class="badge">🟢 运行中</div>
        <div class="badge">🚀 Cloudflare Workers</div>
        <div class="badge">🤖 Mastra AI</div>
        <div class="badge">📍 全球边缘计算</div>
        <div class="badge">⚡ 毫秒级响应</div>
    </div>
    
    <div class="card">
        <h2>🧪 快速测试</h2>
        <div class="test-form">
            <div class="form-group">
                <input type="text" id="cityInput" placeholder="请输入城市名称，如：北京、上海、New York" value="北京">
            </div>
            <button onclick="testWeather()">🌤️ 查询天气</button>
            <div id="result"></div>
        </div>
    </div>
    
    <div class="card">
        <h2>📡 API端点</h2>
        
        <h3>智能天气查询</h3>
        <div class="endpoint">
            POST /api/weather
        </div>
        
        <h4>请求示例：</h4>
        <pre>{\n  "city": "北京",\n  "language": "zh"\n}</pre>
        
        <h4>响应示例：</h4>
        <pre>{\n  "success": true,\n  "data": {\n    "city": "北京",\n    "temperature": 22,\n    "description": "晴朗",\n    "humidity": 45,\n    "windSpeed": 3.2,\n    "advice": "天气不错，适合外出..."\n  },\n  "timestamp": "2024-12-03T10:30:00.000Z"\n}</pre>

        <h3>快速查询</h3>
        <div class="endpoint">
            GET /api/weather/:city
        </div>
    </div>
    
    <div class="card">
        <h2>🔧 curl测试示例</h2>
        <div class="endpoint">
            curl -X POST ${new URL(c.req.url).origin}/api/weather \\
              -H "Content-Type: application/json" \\
              -d '{"city":"上海"}'
        </div>
        
        <div class="endpoint">
            curl ${new URL(c.req.url).origin}/api/weather/深圳
        </div>
    </div>
    
    <div class="card">
        <h2>🔗 相关链接</h2>
        <p>🐙 <a href="https://github.com/yqq-a/mastra-weather-cf-workers">GitHub 仓库</a></p>
        <p>📚 <a href="https://mastra.ai/docs">Mastra 文档</a></p>
        <p>⚡ <a href="https://developers.cloudflare.com/workers/">Cloudflare Workers</a></p>
        <p>🌤️ <a href="https://openweathermap.org/api">天气API文档</a></p>
    </div>

    <script>
        async function testWeather() {
            const cityInput = document.getElementById('cityInput');
            const result = document.getElementById('result');
            const city = cityInput.value.trim();
            
            if (!city) {
                alert('请输入城市名称');
                return;
            }
            
            result.style.display = 'block';
            result.innerHTML = '<p>🔍 正在查询中...</p>';
            
            try {
                const response = await fetch('/api/weather', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ city: city })
                });
                
                const data = await response.json();
                
                if (data.success && data.data) {
                    result.innerHTML = `
                        <h4>✅ 查询成功</h4>
                        <p><strong>📍 ${data.data.city || city}</strong></p>
                        <p>${data.data.advice || '智能天气助手正在为您分析...'}</p>
                        <small>⏰ ${data.timestamp}</small>
                    `;
                } else {
                    result.innerHTML = `
                        <h4>❌ 查询失败</h4>
                        <p>${data.error || '未知错误'}</p>
                    `;
                }
            } catch (error) {
                result.innerHTML = `
                    <h4>❌ 网络错误</h4>
                    <p>请检查网络连接或稍后重试</p>
                `;
            }
        }
        
        // 回车键触发查询
        document.getElementById('cityInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                testWeather();
            }
        });
    </script>
</body>
</html>
  `);
});

// 天气查询API端点
app.post('/api/weather', async (c) => {
  try {
    // 验证环境变量
    if (!c.env.OPENAI_API_KEY) {
      return c.json({
        success: false,
        error: 'OPENAI_API_KEY not configured',
        timestamp: new Date().toISOString()
      }, 500);
    }
    
    // 解析请求体
    const body = await c.req.json() as WeatherRequest;
    
    if (!body.city) {
      return c.json({
        success: false,
        error: 'City parameter is required',
        timestamp: new Date().toISOString()
      }, 400);
    }
    
    // 创建天气代理
    const weatherAgent = createWeatherAgent(c.env);
    
    // 构建查询消息
    const query = `请查询${body.city}的当前天气情况，并提供简洁的生活建议。`;
    
    // 生成回复（设置超时避免超出Workers执行时间限制）
    const result = await Promise.race([
      weatherAgent.generate(query),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 25000)
      )
    ]) as any;
    
    // 构建响应
    const response: WeatherResponse = {
      success: true,
      data: {
        city: body.city,
        temperature: 0, // 这些值会从AI回复中解析，或者从工具调用结果中获取
        description: '处理中...',
        humidity: 0,
        windSpeed: 0,
        advice: result.text
      },
      timestamp: new Date().toISOString()
    };
    
    return c.json(response);
    
  } catch (error) {
    console.error('Weather API error:', error);
    
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// 简化的天气查询端点（GET方法，用于快速测试）
app.get('/api/weather/:city', async (c) => {
  const city = c.req.param('city');
  
  if (!city) {
    return c.json({ error: 'City parameter is required' }, 400);
  }
  
  // 重定向到POST端点的逻辑
  try {
    const weatherAgent = createWeatherAgent(c.env);
    const query = `请简要查询${decodeURIComponent(city)}的当前天气`;
    
    const result = await Promise.race([
      weatherAgent.generate(query),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 20000)
      )
    ]) as any;
    
    return c.json({
      success: true,
      city: decodeURIComponent(city),
      response: result.text,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// 404处理
app.notFound((c) => {
  return c.json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    availableEndpoints: [
      'GET /',
      'GET /health',
      'POST /api/weather',
      'GET /api/weather/:city'
    ],
    timestamp: new Date().toISOString()
  }, 404);
});

// 错误处理
app.onError((err, c) => {
  console.error('Application error:', err);
  
  return c.json({
    success: false,
    error: 'Internal Server Error',
    message: c.env.ENVIRONMENT === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  }, 500);
});

// 导出默认处理器供Cloudflare Workers使用
export default app;