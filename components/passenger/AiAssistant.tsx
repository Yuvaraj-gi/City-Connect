// components/passenger/AiAssistant.tsx - CORRECTED IMPORT

import React, { useState, useRef, useEffect } from 'react';
// THE FIX IS HERE: The import path is now correct.
import { getAiTravelResponse } from '../../services/aiService';
import UserIcon from '../icons/UserIcon';
import ChatIcon from '../icons/ChatIcon';

// ... The rest of the file is unchanged, but included for a complete copy-paste ...
interface Message { sender: 'user' | 'ai'; text: string; }
const AiAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([ { sender: 'ai', text: 'Hello! How can I help with your Chennai travel plans today?' } ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    try {
      const aiResponse = await getAiTravelResponse(input);
      const aiMessage: Message = { sender: 'ai', text: aiResponse };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = { sender: 'ai', text: 'Oops! Something went wrong. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { handleSend(); } }
  return (
    <div className="flex flex-col h-[65vh]">
      <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">AI Travel Assistant</h3>
      <div className="flex-grow bg-slate-50 rounded-lg p-4 overflow-y-auto mb-4 border dark:bg-slate-900 dark:border-slate-700">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'ai' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center"><ChatIcon className="w-5 h-5"/></div>}
              <div className={`max-w-xs md:max-w-md p-3 rounded-xl shadow-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 border dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              </div>
              {msg.sender === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center dark:bg-slate-600 dark:text-slate-300"><UserIcon className="w-5 h-5"/></div>}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center"><ChatIcon className="w-5 h-5"/></div>
              <div className="max-w-xs p-3 rounded-xl bg-white text-slate-700 border dark:bg-slate-700 dark:border-slate-600">
                <div className="flex items-center space-x-1">
                  <span className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>
      <div className="flex">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Ask a question in English, தமிழ், or हिन्दी..." className="flex-grow bg-white border-slate-300 rounded-l-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" disabled={isLoading}/>
        <button onClick={handleSend} disabled={isLoading} className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-400">Send</button>
      </div>
    </div>
  );
};
export default AiAssistant;