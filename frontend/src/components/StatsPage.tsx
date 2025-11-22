import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { Brain, Sparkles, FlaskConical, Clock, Zap, MessageSquare, Activity, Trash2 } from 'lucide-react';
import { Chat } from './ModelDemo';
import AIAnalyst from './AIAnalyst';

interface StatsPageProps {
  chatHistory: Chat[];
  onClearData?: () => void;
}

const StatsPage: React.FC<StatsPageProps> = ({ chatHistory, onClearData }) => {
  const [showAnalyst, setShowAnalyst] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearData = () => {
    if (onClearData) {
      onClearData();
      setShowClearConfirm(false);
    }
  };
  
  // Model configurations for consistent colors and icons
  const modelConfigs = {
    'deepseek': { 
      name: 'DeepSeek', 
      icon: Brain, 
      color: '#8B5CF6',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-700'
    },
    'gpt4': { 
      name: 'GPT-4', 
      icon: Sparkles, 
      color: '#3B82F6',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700'
    },
    'phi': { 
      name: 'Phi-3', 
      icon: FlaskConical, 
      color: '#10B981',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700'
    }
  };

  // Calculate statistics
  interface ModelStats {
    count: number;
    totalResponseTime: number;
    totalTokensPerSecond: number;
    totalTokens: number;
    totalPromptTokens: number;
    totalCompletionTokens: number;
  }

  const calculateStats = (): Record<string, ModelStats> | null => {
    if (chatHistory.length === 0) return null;

    const statsByModel = chatHistory.reduce((acc, chat) => {
      if (!acc[chat.model]) {
        acc[chat.model] = {
          count: 0,
          totalResponseTime: 0,
          totalTokensPerSecond: 0,
          totalTokens: 0,
          totalPromptTokens: 0,
          totalCompletionTokens: 0
        };
      }
      
      acc[chat.model].count++;
      acc[chat.model].totalResponseTime += parseFloat(chat.responseTime);
      acc[chat.model].totalTokensPerSecond += parseFloat(chat.tokensPerSecond);
      acc[chat.model].totalTokens += chat.usage.total_tokens;
      acc[chat.model].totalPromptTokens += chat.usage.prompt_tokens;
      acc[chat.model].totalCompletionTokens += chat.usage.completion_tokens;
      
      return acc;
    }, {} as Record<string, ModelStats>);

    return statsByModel;
  };

  const stats = calculateStats();

  // Prepare data for charts
  const responseTimeData = stats ? Object.entries(stats).map(([model, data]) => ({
    model: modelConfigs[model as keyof typeof modelConfigs]?.name || model,
    responseTime: parseFloat((data.totalResponseTime / data.count).toFixed(2)),
    fill: modelConfigs[model as keyof typeof modelConfigs]?.color || '#6B7280'
  })) : [];

  const tokensPerSecondData = stats ? Object.entries(stats).map(([model, data]) => ({
    model: modelConfigs[model as keyof typeof modelConfigs]?.name || model,
    tokensPerSecond: parseFloat((data.totalTokensPerSecond / data.count).toFixed(1)),
    fill: modelConfigs[model as keyof typeof modelConfigs]?.color || '#6B7280'
  })) : [];

  const tokenUsageData = stats ? Object.entries(stats).map(([model, data]) => ({
    model: modelConfigs[model as keyof typeof modelConfigs]?.name || model,
    promptTokens: data.totalPromptTokens,
    completionTokens: data.totalCompletionTokens,
    totalTokens: data.totalTokens
  })) : [];

  const modelUsageData = stats ? Object.entries(stats).map(([model, data]) => ({
    name: modelConfigs[model as keyof typeof modelConfigs]?.name || model,
    value: data.count,
    fill: modelConfigs[model as keyof typeof modelConfigs]?.color || '#6B7280'
  })) : [];

  // Summary cards data
  const totalInteractions = chatHistory.length;
  const avgResponseTime = stats ? Object.values(stats).reduce((sum: number, data: ModelStats) => sum + data.totalResponseTime, 0) / totalInteractions : 0;
  const avgTokensPerSecond = stats ? Object.values(stats).reduce((sum: number, data: ModelStats) => sum + data.totalTokensPerSecond, 0) / totalInteractions : 0;
  const totalTokensUsed = stats ? Object.values(stats).reduce((sum: number, data: ModelStats) => sum + data.totalTokens, 0) : 0;

  if (chatHistory.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-16">
          <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-600 mb-2">No Data Yet</h2>
          <p className="text-gray-500">Start chatting with the AI models to see statistics and visualizations here!</p>
        </div>
      </div>
    );
  }

  const handleAskAnalyst = () => {
    setShowAnalyst(true);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-4">
        <Button
          onClick={() => setShowClearConfirm(true)}
          variant="outline"
          className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear All Data
        </Button>
        <Button
          onClick={handleAskAnalyst}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
        >
          <Brain className="h-4 w-4 mr-2" />
          Ask AI Analyst
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Interactions</p>
                <p className="text-2xl font-bold text-blue-600">{totalInteractions}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-green-600">{avgResponseTime.toFixed(2)}s</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Tokens/Sec</p>
                <p className="text-2xl font-bold text-purple-600">{avgTokensPerSecond.toFixed(1)}</p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tokens</p>
                <p className="text-2xl font-bold text-orange-600">{totalTokensUsed.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              Average Response Time by Model
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="model" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value}s`, 'Response Time']}
                  labelStyle={{ color: '#374151' }}
                />
                <Bar dataKey="responseTime" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tokens Per Second Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-500" />
              Average Tokens per Second by Model
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tokensPerSecondData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="model" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value}`, 'Tokens/Sec']}
                  labelStyle={{ color: '#374151' }}
                />
                <Bar dataKey="tokensPerSecond" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Model Usage Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Model Usage Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={modelUsageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {modelUsageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Token Usage Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-orange-500" />
              Token Usage Breakdown by Model
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tokenUsageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="model" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [value.toLocaleString(), name === 'promptTokens' ? 'Prompt Tokens' : 'Completion Tokens']}
                  labelStyle={{ color: '#374151' }}
                />
                <Legend />
                <Bar dataKey="promptTokens" stackId="a" fill="#60A5FA" name="Prompt Tokens" />
                <Bar dataKey="completionTokens" stackId="a" fill="#34D399" name="Completion Tokens" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Model Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Model Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats && Object.entries(stats).map(([modelId, data]) => {
              const config = modelConfigs[modelId as keyof typeof modelConfigs];
              if (!config) return null;
              
              return (
                <div key={modelId} className={`p-4 rounded-lg ${config.bgColor} border`}>
                  <div className="flex items-center gap-3 mb-3">
                    <config.icon className={`h-6 w-6 ${config.textColor}`} />
                    <h4 className={`font-semibold ${config.textColor}`}>{config.name}</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Interactions:</span>
                      <span className="font-medium">{data.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Response Time:</span>
                      <span className="font-medium">{(data.totalResponseTime / data.count).toFixed(2)}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Tokens/Sec:</span>
                      <span className="font-medium">{(data.totalTokensPerSecond / data.count).toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Tokens:</span>
                      <span className="font-medium">{data.totalTokens.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* AI Analyst Modal */}
      {showAnalyst && stats && (
        <AIAnalyst
          statsData={stats}
          onClose={() => setShowAnalyst(false)}
        />
      )}

      {/* Clear Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Clear All Data?
                </h3>
                <p className="text-gray-600 mb-6">
                  This will permanently delete all chat history, statistics, and performance data. This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <Button
                    onClick={() => setShowClearConfirm(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleClearData}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Clear All Data
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsPage;