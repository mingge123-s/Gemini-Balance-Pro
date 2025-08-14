'use client'

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  RefreshCw, 
  BarChart3, 
  Key, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Server,
  Clock,
  Users
} from 'lucide-react';

interface ApiKey {
  key: string;
  name: string;
  enabled: boolean;
  requests: number;
  errors: number;
  lastUsed?: string;
  created: string;
}

interface ErrorLog {
  id: string;
  timestamp: string;
  apiKey: string;
  error: string;
  request: string;
  response?: string;
}

interface Stats {
  totalRequests: number;
  totalErrors: number;
  successRate: number;
  lastReset: string;
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalRequests: 0,
    totalErrors: 0,
    successRate: 100,
    lastReset: new Date().toISOString(),
  });
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const logsPerPage = 20;

  // 获取数据
  const fetchData = async () => {
    try {
      const [keysRes, logsRes, statsRes] = await Promise.all([
        fetch('/api/admin/keys'),
        fetch(`/api/admin/logs?page=${currentPage}&limit=${logsPerPage}`),
        fetch('/api/admin/stats'),
      ]);

      if (keysRes.ok) {
        const keys = await keysRes.json();
        setApiKeys(keys);
      }

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setErrorLogs(logsData.logs);
        setTotalLogs(logsData.total);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // 5秒刷新一次
    return () => clearInterval(interval);
  }, [currentPage]);

  // 添加API Key
  const addApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyValue.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: newKeyValue.trim(),
          name: newKeyName.trim() || `Key ${apiKeys.length + 1}`,
        }),
      });

      if (response.ok) {
        setNewKeyName('');
        setNewKeyValue('');
        fetchData();
      }
    } catch (error) {
      console.error('Failed to add API key:', error);
    }
    setLoading(false);
  };

  // 删除API Key
  const deleteApiKey = async (key: string) => {
    if (!confirm('确定要删除这个API Key吗？')) return;

    try {
      const response = await fetch('/api/admin/keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to delete API key:', error);
    }
  };

  // 切换API Key状态
  const toggleApiKey = async (key: string, enabled: boolean) => {
    try {
      const response = await fetch('/api/admin/key-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, enabled: !enabled }),
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to toggle API key:', error);
    }
  };

  // 清空日志
  const clearLogs = async () => {
    if (!confirm('确定要清空所有错误日志吗？')) return;

    try {
      const response = await fetch('/api/admin/clear-logs', {
        method: 'POST',
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  };

  // 重置统计
  const resetStats = async () => {
    if (!confirm('确定要重置所有统计数据吗？')) return;

    try {
      const response = await fetch('/api/admin/reset-stats', {
        method: 'POST',
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to reset stats:', error);
    }
  };

  // 生成图表数据
  const chartData = apiKeys.map(key => ({
    name: key.name,
    requests: key.requests,
    errors: key.errors,
    successRate: key.requests > 0 ? ((key.requests - key.errors) / key.requests * 100) : 100,
  }));

  const enabledKeys = apiKeys.filter(key => key.enabled).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gemini Balance Pro</h1>
              <p className="text-sm text-gray-600">Gemini API代理增强版 - 监控面板</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Server className="h-4 w-4" />
                <span>活跃Keys: {enabledKeys}/{apiKeys.length}</span>
              </div>
              <button
                onClick={fetchData}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 导航标签 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: '总览', icon: BarChart3 },
              { id: 'keys', name: 'API Keys', icon: Key },
              { id: 'logs', name: '错误日志', icon: AlertTriangle },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 总览页面 */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Activity className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        总请求数
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalRequests.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        错误数
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalErrors.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        成功率
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.successRate.toFixed(1)}%
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        活跃Keys
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {enabledKeys} / {apiKeys.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* 图表 - 简化版本 */}
            {chartData.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  API Key 统计
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {chartData.map((data, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900">{data.name}</h4>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <div>请求: {data.requests}</div>
                        <div>错误: {data.errors}</div>
                        <div>成功率: {data.successRate.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 重置统计按钮 */}
            <div className="flex justify-end">
              <button
                onClick={resetStats}
                className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                重置统计
              </button>
            </div>
          </div>
        )}

        {/* API Keys管理页面 */}
        {activeTab === 'keys' && (
          <div className="space-y-6">
            {/* 添加新Key表单 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                添加新的API Key
              </h3>
              <form onSubmit={addApiKey} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      名称（可选）
                    </label>
                    <input
                      type="text"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Key 名称"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      API Key
                    </label>
                    <input
                      type="text"
                      value={newKeyValue}
                      onChange={(e) => setNewKeyValue(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="AIzaSy..."
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {loading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          添加
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* API Keys列表 */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  API Keys ({apiKeys.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {apiKeys.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <Key className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>暂无API Key，请先添加一个。</p>
                  </div>
                ) : (
                  apiKeys.map((key) => (
                    <div key={key.key} className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            <div className={`flex-shrink-0 w-3 h-3 rounded-full ${key.enabled ? 'bg-green-400' : 'bg-red-400'}`} />
                            <div>
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {key.name}
                              </p>
                              <p className="text-xs text-gray-500 font-mono">
                                {key.key.substring(0, 20)}...
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                            <span>请求: {key.requests}</span>
                            <span>错误: {key.errors}</span>
                            <span>成功率: {key.requests > 0 ? ((key.requests - key.errors) / key.requests * 100).toFixed(1) : 100}%</span>
                            {key.lastUsed && (
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(key.lastUsed).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleApiKey(key.key, key.enabled)}
                            className={`p-1 rounded ${key.enabled ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-500'}`}
                          >
                            {key.enabled ? (
                              <ToggleRight className="h-6 w-6" />
                            ) : (
                              <ToggleLeft className="h-6 w-6" />
                            )}
                          </button>
                          <button
                            onClick={() => deleteApiKey(key.key)}
                            className="p-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 错误日志页面 */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  错误日志 ({totalLogs})
                </h3>
                <button
                  onClick={clearLogs}
                  className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  清空日志
                </button>
              </div>
              <div className="divide-y divide-gray-200">
                {errorLogs.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>暂无错误日志，系统运行正常！</p>
                  </div>
                ) : (
                  errorLogs.map((log) => (
                    <div key={log.id} className="p-6">
                      <div className="flex items-start space-x-3">
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                              {new Date(log.timestamp).toLocaleString('zh-CN')}
                            </p>
                            <span className="text-xs font-mono text-gray-400">
                              {log.apiKey.substring(0, 10)}...
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 mt-1">
                            {log.request}
                          </p>
                          <p className="text-sm text-red-600 mt-1">
                            {log.error}
                          </p>
                          {log.response && (
                            <details className="mt-2">
                              <summary className="text-xs text-gray-500 cursor-pointer">
                                响应详情
                              </summary>
                              <pre className="mt-1 text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-x-auto">
                                {log.response}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* 分页 */}
              {totalLogs > logsPerPage && (
                <div className="px-6 py-3 border-t border-gray-200 flex justify-between items-center">
                  <div className="text-sm text-gray-700">
                    显示 {(currentPage - 1) * logsPerPage + 1} 到{' '}
                    {Math.min(currentPage * logsPerPage, totalLogs)} 共 {totalLogs} 条
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                    >
                      上一页
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage * logsPerPage >= totalLogs}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                    >
                      下一页
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* API使用说明 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">
            API 使用说明
          </h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              <strong>代理地址:</strong> <code className="bg-blue-100 px-2 py-1 rounded">https://your-domain.vercel.app/api/gemini/v1beta/...</code>
            </p>
            <p>
              <strong>使用方法:</strong> 将 Gemini API 的 <code>https://generativelanguage.googleapis.com</code> 替换为你的域名 + <code>/api/gemini</code>
            </p>
            <p>
              <strong>支持功能:</strong> 自动负载均衡、错误日志记录、请求统计、Key管理
            </p>
            <p className="text-red-600">
              <strong>注意:</strong> 请妥善保管你的管理面板地址，避免泄露给他人。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
