import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Send, Sparkles, Loader2, Brain } from 'lucide-react';

interface ModelStats {
  count: number;
  totalResponseTime: number;
  totalTokensPerSecond: number;
  totalTokens: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
}

interface AIAnalystProps {
  statsData: Record<string, ModelStats>;
  onClose: () => void;
}

const AIAnalyst: React.FC<AIAnalystProps> = ({ statsData, onClose }) => {
  const [question, setQuestion] = useState('');
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async (customQuestion?: string) => {
    setIsLoading(true);
    setError('');
    
    const questionToAsk = customQuestion || question || 'Analyze these statistics and provide insights on performance and cost efficiency';
    
    try {
      const response = await fetch('/api/v1/analyze-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stats_data: statsData,
          question: questionToAsk
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get analysis');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
      
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
    }
    
    setIsLoading(false);
  };

  const quickQuestions = [
    'Which model is most cost-effective?',
    'Which model is fastest?',
    'Compare performance across all models',
    'Recommend best model for code generation'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
        <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-purple-600" />
              <CardTitle className="text-xl">AI Stats Analyst</CardTitle>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              aria-label="Close AI Analyst"
              title="Close"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Ask questions about your model performance and get AI-powered insights
          </p>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Quick Questions */}
          {!analysis && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Quick Questions:</p>
              <div className="grid grid-cols-1 gap-2">
                {quickQuestions.map((q, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnalyze(q)}
                    disabled={isLoading}
                    className="text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm text-blue-800 transition-colors border border-blue-200 disabled:opacity-50"
                  >
                    <Sparkles className="h-3 w-3 inline mr-2" />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Analysis Result */}
          {analysis && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Brain className="h-5 w-5 text-purple-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-purple-900 mb-2">AI Analysis:</p>
                    <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {analysis}
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setAnalysis('');
                  setQuestion('');
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Ask another question
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
              <p className="text-sm font-medium">Error:</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-3" />
              <p className="text-sm text-gray-600">Analyzing your data...</p>
            </div>
          )}

          {/* Custom Question Input */}
          {!analysis && !isLoading && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-gray-700 mb-3">Or ask your own question:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAnalyze();
                    }
                  }}
                  placeholder="e.g., Which model should I use for my use case?"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  disabled={isLoading}
                />
                <Button
                  onClick={() => handleAnalyze()}
                  disabled={!question || isLoading}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAnalyst;
