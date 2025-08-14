import { NextRequest, NextResponse } from 'next/server';

// 数据存储类 - 简化版本，实际部署时可以考虑使用外部数据库
class DataStore {
  private static instance: DataStore;
  private data: Map<string, any> = new Map();

  static getInstance(): DataStore {
    if (!DataStore.instance) {
      DataStore.instance = new DataStore();
    }
    return DataStore.instance;
  }

  set(key: string, value: any): void {
    this.data.set(key, value);
  }

  get(key: string): any {
    return this.data.get(key);
  }

  delete(key: string): void {
    this.data.delete(key);
  }

  getAll(): Record<string, any> {
    return Object.fromEntries(this.data);
  }
}

interface ApiKey {
  key: string;
  name: string;
  enabled: boolean;
  requests: number;
  errors: number;
  lastUsed?: Date;
  created: Date;
}

interface ErrorLog {
  id: string;
  timestamp: Date;
  apiKey: string;
  error: string;
  request: string;
  response?: string;
}

const store = DataStore.getInstance();

// 初始化存储
if (!store.get('apiKeys')) {
  store.set('apiKeys', []);
}
if (!store.get('errorLogs')) {
  store.set('errorLogs', []);
}
if (!store.get('stats')) {
  store.set('stats', {
    totalRequests: 0,
    totalErrors: 0,
    successRate: 100,
    lastReset: new Date(),
  });
}

function getRandomApiKey(): ApiKey | null {
  const apiKeys: ApiKey[] = store.get('apiKeys') || [];
  const enabledKeys = apiKeys.filter(key => key.enabled);
  
  if (enabledKeys.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * enabledKeys.length);
  return enabledKeys[randomIndex];
}

function updateKeyStats(keyValue: string, isError: boolean = false): void {
  const apiKeys: ApiKey[] = store.get('apiKeys') || [];
  const keyIndex = apiKeys.findIndex(k => k.key === keyValue);
  
  if (keyIndex !== -1) {
    apiKeys[keyIndex].requests++;
    apiKeys[keyIndex].lastUsed = new Date();
    
    if (isError) {
      apiKeys[keyIndex].errors++;
    }
    
    store.set('apiKeys', apiKeys);
  }
  
  // 更新总体统计
  const stats = store.get('stats');
  stats.totalRequests++;
  if (isError) {
    stats.totalErrors++;
  }
  stats.successRate = stats.totalRequests > 0 ? 
    ((stats.totalRequests - stats.totalErrors) / stats.totalRequests * 100) : 100;
  store.set('stats', stats);
}

function logError(apiKey: string, error: string, request: string, response?: string): void {
  const errorLogs: ErrorLog[] = store.get('errorLogs') || [];
  const newError: ErrorLog = {
    id: Date.now().toString(),
    timestamp: new Date(),
    apiKey,
    error,
    request,
    response,
  };
  
  errorLogs.unshift(newError); // 最新的在前面
  
  // 只保留最近1000条错误日志
  if (errorLogs.length > 1000) {
    errorLogs.splice(1000);
  }
  
  store.set('errorLogs', errorLogs);
}

async function handler(req: NextRequest, { params }: { params: { path: string[] } }) {
  const pathname = '/' + (params.path || []).join('/');

  // CORS处理
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      },
    });
  }

  // 管理接口
  if (pathname.startsWith('/admin/')) {
    const adminPath = pathname.replace('/admin/', '');
    
    switch (adminPath) {
      case 'keys':
        if (req.method === 'GET') {
          return NextResponse.json(store.get('apiKeys') || []);
        } else if (req.method === 'POST') {
          const body = await req.json();
          const apiKeys: ApiKey[] = store.get('apiKeys') || [];
          const newKey: ApiKey = {
            key: body.key,
            name: body.name || `Key ${apiKeys.length + 1}`,
            enabled: true,
            requests: 0,
            errors: 0,
            created: new Date(),
          };
          apiKeys.push(newKey);
          store.set('apiKeys', apiKeys);
          return NextResponse.json({ success: true, key: newKey });
        } else if (req.method === 'DELETE') {
          const body = await req.json();
          const apiKeys: ApiKey[] = store.get('apiKeys') || [];
          const filteredKeys = apiKeys.filter(k => k.key !== body.key);
          store.set('apiKeys', filteredKeys);
          return NextResponse.json({ success: true });
        }
        break;
        
      case 'key-status':
        if (req.method === 'PUT') {
          const body = await req.json();
          const apiKeys: ApiKey[] = store.get('apiKeys') || [];
          const keyIndex = apiKeys.findIndex(k => k.key === body.key);
          if (keyIndex !== -1) {
            apiKeys[keyIndex].enabled = body.enabled;
            store.set('apiKeys', apiKeys);
          }
          return NextResponse.json({ success: true });
        }
        break;
        
      case 'stats':
        return NextResponse.json(store.get('stats'));
        
      case 'logs':
        const logs = store.get('errorLogs') || [];
        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const start = (page - 1) * limit;
        const end = start + limit;
        
        return NextResponse.json({
          logs: logs.slice(start, end),
          total: logs.length,
          page,
          limit,
        });
        
      case 'clear-logs':
        if (req.method === 'POST') {
          store.set('errorLogs', []);
          return NextResponse.json({ success: true });
        }
        break;
        
      case 'reset-stats':
        if (req.method === 'POST') {
          store.set('stats', {
            totalRequests: 0,
            totalErrors: 0,
            successRate: 100,
            lastReset: new Date(),
          });
          // 重置所有key的统计
          const apiKeys: ApiKey[] = store.get('apiKeys') || [];
          apiKeys.forEach(key => {
            key.requests = 0;
            key.errors = 0;
            key.lastUsed = undefined;
          });
          store.set('apiKeys', apiKeys);
          return NextResponse.json({ success: true });
        }
        break;
    }
  }

  // Gemini API代理
  if (pathname.startsWith('/gemini/') || pathname === '/v1beta/models' || pathname.startsWith('/v1beta/')) {
    const selectedKey = getRandomApiKey();
    
    if (!selectedKey) {
      const error = 'No available API keys';
      logError('N/A', error, pathname, '503');
      return NextResponse.json({ error }, { status: 503 });
    }

    try {
      // 构建请求到Google Gemini API
      const targetUrl = `https://generativelanguage.googleapis.com${pathname.replace('/gemini', '')}`;
      const url = new URL(req.url);
      const searchParams = url.searchParams;
      searchParams.set('key', selectedKey.key);
      
      const headers: Record<string, string> = {};
      
      // 复制原始请求头（排除一些不需要的）
      req.headers.forEach((value, key) => {
        const lowerKey = key.toLowerCase();
        if (!['host', 'content-length', 'connection', 'authorization'].includes(lowerKey)) {
          headers[key] = value;
        }
      });
      
      // 如果有Authorization头，移除它因为我们使用URL参数传递key
      delete headers['authorization'];
      
      const body = req.method !== 'GET' ? await req.text() : undefined;
      
      const response = await fetch(`${targetUrl}?${searchParams.toString()}`, {
        method: req.method,
        headers,
        body,
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        updateKeyStats(selectedKey.key, true);
        logError(selectedKey.key, `HTTP ${response.status}`, pathname, responseText);
        
        return new NextResponse(responseText, {
          status: response.status,
          headers: {
            'Content-Type': response.headers.get('content-type') || 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
      
      updateKeyStats(selectedKey.key, false);
      
      return new NextResponse(responseText, {
        status: response.status,
        headers: {
          'Content-Type': response.headers.get('content-type') || 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      updateKeyStats(selectedKey.key, true);
      logError(selectedKey.key, errorMessage, pathname);
      
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as OPTIONS };
