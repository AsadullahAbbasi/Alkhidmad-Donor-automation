'use client';

import { useState, useRef, useEffect } from 'react';
import { KARACHI_AREAS } from '@/lib/types';
import type { BloodGroup, KarachiArea } from '@/lib/types';

interface SearchFormProps {
  onSearch: (bloodGroup: BloodGroup, location: KarachiArea) => void;
  loading: boolean;
}

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function SearchForm({ onSearch, loading }: SearchFormProps) {
  const [location, setLocation] = useState<KarachiArea | ''>('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: 'As-salamu alaykum! Aapko konsa blood group chahiye?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const extractJsonFromText = (text: string) => {
    try {
      const match = text.match(/```json\n([\s\S]*?)\n```/);
      if (match && match[1]) {
        return JSON.parse(match[1]);
      }
      const inlineMatch = text.match(/{[\s\S]*"confirmed"[\s\S]*}/);
      if (inlineMatch) {
         return JSON.parse(inlineMatch[0]);
      }
    } catch (e) {
      console.error("Failed to parse json from response", e);
    }
    return null;
  };

  const cleanResponseText = (text: string) => {
    return text.replace(/```json\n[\s\S]*?\n```/g, '').replace(/{[\s\S]*"confirmed"[\s\S]*}/g, '').trim();
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isChatting || loading) return;

    if (!location) {
      alert("Please select a location first from the dropdown.");
      return;
    }

    const newMessage: Message = { role: 'user', content: inputValue.trim() };
    const chatHistory = [...messages];
    
    setMessages([...chatHistory, newMessage]);
    setInputValue('');
    setIsChatting(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          history: chatHistory.slice(1), // Ignore initial greeting
          message: newMessage.content,
        }),
      });

      const data = await res.json();
      
      if (res.ok && data.text) {
        const jsonPayload = extractJsonFromText(data.text);
        const cleanedText = cleanResponseText(data.text);
        
        if (cleanedText) {
           setMessages(prev => [...prev, { role: 'model', content: cleanedText }]);
        }

        if (jsonPayload && jsonPayload.confirmed && jsonPayload.bloodGroup) {
           const bg = jsonPayload.bloodGroup as BloodGroup;
           if (location) {
             onSearch(bg, location);
           }
        }
      } else {
        setMessages(prev => [...prev, { role: 'model', content: 'Sorry, I encountered an error. Please try again.' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: 'Network error. Please try again.' }]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="search-form" id="search-form">
      <div className="form-header">
        <div className="form-icon">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>
        <div>
          <h2 className="form-title">Find Blood Donors</h2>
          <p className="form-subtitle">
            Select a location and chat below to find donors
          </p>
        </div>
      </div>

      <div className="form-group mb-6">
        <label htmlFor="location" className="form-label">
          <span className="label-icon">📍</span>
          Target Location
        </label>
        <select
          id="location"
          className="form-select"
          value={location}
          onChange={(e) => setLocation(e.target.value as KarachiArea)}
          required
        >
          <option value="" disabled>
            Select area in Karachi
          </option>
          {KARACHI_AREAS.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
      </div>

      <div className="chat-container">
        <label className="form-label mb-2 block">
          <span className="label-icon">💬</span>
          Chat to Request Blood
        </label>
        <div className="chat-window">
          <div className="messages-area">
             {messages.map((m, idx) => (
               <div key={idx} className={`message-bubble ${m.role === 'model' ? 'bot' : 'user'}`}>
                 {m.content}
               </div>
             ))}
             {isChatting && (
               <div className="message-bubble bot typing">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
               </div>
             )}
             <div ref={messagesEndRef} />
          </div>
          <form className="chat-input-area" onSubmit={handleSendMessage}>
             <input 
               type="text" 
               className="chat-input"
               placeholder="Write your request e.g. 'Mujhay O- khoon chahiye'"
               value={inputValue}
               onChange={(e) => setInputValue(e.target.value)}
               disabled={isChatting || loading}
             />
             <button type="submit" className="chat-send-btn" disabled={isChatting || !inputValue.trim() || loading}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
             </button>
          </form>
        </div>
      </div>
      
      {loading && (
        <div className="mt-4 flex justify-center text-red-600 font-medium">
           Searching for donors...
        </div>
      )}
    </div>
  );
}
