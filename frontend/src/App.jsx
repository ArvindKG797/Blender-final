import { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import MainPage from './components/MainPage';
import * as api from './services/api';
 
export default function App() {
  const [theme, setTheme] = useState('dark');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
 
  {/* model selector usesate */}
  const [selectedModel, setSelectedModel] = useState('qwen 2.5 coder');
 
  const [showSearchPage, setShowSearchPage] = useState(false);
  const messagesEndRef = useRef(null);
 
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
 
  useEffect(() => {
    api.getChats().then(setChatHistory).catch(console.error);
  }, []);
 
  const loadChat = async (id) => {
    try {
      const data = await api.getChatHistory(id);
      setMessages(data.messages);
      setActiveChatId(id);
      setShowSearchPage(false);
      if (window.innerWidth < 768) setSidebarOpen(false);
    } catch (error) {
      console.error("Failed to load chat", error);
    }
  };
 
  const startNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setShowSearchPage(false);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };
 
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
 
    const newMsg = { role: 'user', content: inputMessage };
    setMessages((prev) => [...prev, newMsg]);
    setInputMessage('');
 
    try {
      const data = await api.sendMessage(activeChatId, newMsg.content, selectedModel);
      setMessages(data.messages);
      setActiveChatId(data.id);
      api.getChats().then(setChatHistory);
    } catch (error) {
      console.error("Error sending message", error);
    }
  };
 
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
 
  return (
    <div className="flex h-screen bg-white dark:bg-brandBlue-dark text-slate-900 dark:text-gray-100 transition-colors duration-300 font-sans w-full overflow-hidden">
     
      {/* Mobile Dimming Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
 
      {/* Sidebar Component */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeChatId={activeChatId}
        chatHistory={chatHistory}
        startNewChat={startNewChat}
        showSearchPage={showSearchPage}
        setShowSearchPage={setShowSearchPage}
        loadChat={loadChat}
      />
 
      {/* Main Content Component */}
      <MainPage
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        theme={theme}
        setTheme={setTheme}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        showSearchPage={showSearchPage}
        chatHistory={chatHistory}
        loadChat={loadChat}
        messages={messages}
        messagesEndRef={messagesEndRef}
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        handleSendMessage={handleSendMessage}
      />
 
    </div>
  );
}