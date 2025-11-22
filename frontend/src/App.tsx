import { useState, useEffect } from 'react';
import ModelDemo, { Chat } from './components/ModelDemo';
import StatsPage from './components/StatsPage.tsx';
import { MessageCircle, BarChart3 } from 'lucide-react';
import { loadChatHistory, saveChatHistory, clearChatHistory } from './lib/localStorage';

function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'stats'>('chat');
  const [chatHistory, setChatHistory] = useState<Chat[]>([]);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedHistory = loadChatHistory();
    if (savedHistory.length > 0) {
      setChatHistory(savedHistory);
    }
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      saveChatHistory(chatHistory);
    }
  }, [chatHistory]);

  // Handle clearing all data
  const handleClearData = () => {
    clearChatHistory();
    setChatHistory([]);
    setActiveTab('chat');
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-50 py-6 flex flex-col items-center border-b border-gray-200">
        <div className="container flex justify-center mb-4">
          <div className="bg-blue-500 text-white p-4 rounded-md inline-block">
            <h1 className="text-3xl font-bold text-center">
              Azure AI Foundry Multi Model Tool
            </h1>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex bg-white rounded-lg shadow-lg p-1">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all duration-200 ${
              activeTab === 'chat'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 hover:text-blue-500'
            }`}
          >
            <MessageCircle className="h-4 w-4" />
            Chat
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all duration-200 ${
              activeTab === 'stats'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 hover:text-blue-500'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Stats
            {chatHistory.length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 ml-1">
                {chatHistory.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'chat' ? (
          <ModelDemo chatHistory={chatHistory} setChatHistory={setChatHistory} />
        ) : (
          <StatsPage chatHistory={chatHistory} onClearData={handleClearData} />
        )}
      </div>
    </div>
  );
}

export default App;
