import { useState, useRef, useEffect } from 'react';
import { Menu, Sun, Moon, Send, MessageSquare, Clock, Search, PanelLeft } from 'lucide-react';
import ModelInfoIcon from './ModelInfoIcon';
import logoImg from '../assets/Tessolve.png'
 
export default function MainPage({
  sidebarOpen,
  setSidebarOpen,
  theme,
  setTheme,
  selectedModel,
  setSelectedModel,
  showSearchPage,
  chatHistory,
  loadChat,
  messages,
  messagesEndRef,
  inputMessage,
  setInputMessage,
  handleSendMessage
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const textareaRef = useRef(null);
 
  const filteredHistory = chatHistory.filter(chat =>
    chat.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );
 
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [inputMessage]);
 
  const onSubmit = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    handleSendMessage(e);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };
 
  const formatChatDate = (dateString) => {
    if (!dateString) return 'Unknown Date';
    try {
      const utcString = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
      const date = new Date(utcString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata'
      });
    } catch (e) {
      console.error("Error occurred:", e);
      return 'Saved Session';
    }
  };
 
  return (
    <main className="flex-1 flex flex-col h-full relative w-full overflow-hidden transition-all duration-300">
     
      <header className="h-16 flex items-center justify-between px-4 bg-slate-50 dark:bg-slate-950 shrink-0">
        <div className="flex items-center gap-2">
         
          <button
            className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-600 dark:text-slate-300 cursor-pointer"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
 
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="hidden md:block p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors mr-1"
              title="Open Sidebar"
            >
              <PanelLeft size={22} />
            </button>
          )}
 
          {/* RESTORED IMAGE LOGO */}
          {!sidebarOpen && (
            <img
              src={logoImg}
              alt="Tessolve Logo"
              className="h-10 w-auto object-contain cursor-pointer ml-1"
              onClick={() => setSidebarOpen(true)}
            />
          )}
        </div>
 
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>
 
      {/* Switchable Workspace Layout views */}
      {showSearchPage ? (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Chat History</h2>
              </div>
              <div className="relative w-full md:w-80">
                <Search size={16} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by keywords"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f47920] text-slate-800 dark:text-white shadow-sm"
                />
              </div>
            </div>
 
            {filteredHistory.length === 0 ? (
              <div className="py-12 text-center text-slate-400">No match</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredHistory.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => loadChat(chat.id)}
                    className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-[#f47920] dark:hover:border-[#f47920] cursor-pointer transition-all hover:shadow-md group flex flex-col justify-between h-32"
                  >
                    <div className="flex items-start gap-3">
                      <MessageSquare size={18} className="text-[#0082c8] mt-0.5 group-hover:text-[#f47920] transition-colors shrink-0" />
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-[15px] line-clamp-2 leading-snug">{chat.title}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                      <Clock size={12} />
                      <span>{formatChatDate(chat.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
           <h2 className="text-3xl font-bold text-center text-slate-300 dark:text-slate-700">Ready to generate Blender scripts</h2>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth bg-slate-50 dark:bg-slate-950">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'user' ? (
                  <div className="max-w-[75%] bg-[#0082c8] text-white rounded-2xl rounded-br-none px-4 py-3 shadow-sm text-[15px] leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </div>
                ) : (
                  <div className="max-w-[85%] w-full sm:w-auto text-[15px] leading-relaxed animate-fade-in">
                    <pre className="whitespace-pre-wrap font-mono text-sm p-5 rounded-2xl rounded-bl-none overflow-x-auto border border-slate-200 dark:border-slate-800/60 shadow-sm w-full bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100">
                      <code>{msg.content}</code>
                    </pre>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}
 
      {!showSearchPage && (
       
        <div className="p-6 bg-slate-50 dark:bg-slate-950 shrink-0">
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={onSubmit}
              className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-3xl px-4 py-2.5 flex items-end justify-between gap-2 shadow-sm focus-within:border-[#f47920] focus-within:ring-1 focus-within:ring-[#f47920] transition-all duration-200"
            >
              <div className="pb-2.5 shrink-0 pl-1">
                <ModelInfoIcon />
              </div>
 
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask for a Blender script"
                rows={1}
                className="flex-1 bg-transparent border-none focus:outline-none text-slate-800 dark:text-white px-2 text-[15px] placeholder-slate-400 dark:placeholder-slate-500 min-h-[40px] max-h-40 py-2 resize-none overflow-y-auto leading-relaxed"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onSubmit(e);
                  }
                }}
              />
 
              <div className="flex items-center gap-3 shrink-0 h-10 mb-0.5">
                <div className="relative flex items-center bg-transparent">
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="bg-transparent text-sm font-medium text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer pr-1 hover:text-[#f47920] transition-colors appearance-none"
                  >
                    <option value="qwen-2.5-coder" className="bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white">qwen 2.5 coder</option>
                    <option value="qwen-2.6-coder" className="bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white">qwen 2.6 coder</option>
                  </select>
                  <div className="h-2 w-2 rotate-45 border-b-2 border-r-2 border-slate-400 dark:border-slate-500" />
                </div>
               
                <div className="h-5 w-[1px] bg-slate-300 dark:bg-slate-700" />
 
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="p-2 text-[#f47920] hover:opacity-80 disabled:text-slate-300 dark:disabled:text-slate-600 transition-colors cursor-pointer flex items-center justify-center rounded-full"
                  title="Send Message"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}