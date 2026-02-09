
import React, { useEffect, useRef } from 'react';
import { Message, MessageRole } from '../types';

interface ChatWindowProps {
  messages: Message[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleDownload = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 space-y-6 bg-transparent"
    >
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
          <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center">
            <i className="fas fa-magic text-amber-600 text-3xl"></i>
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-gray-800">Welcome to Tilleli</h2>
            <p className="text-gray-500 max-w-sm mx-auto">
              Upload a photo of a woman where her face is not visible, and I will add a beautiful Amazigh Kabyle face with traditional jewelry.
            </p>
          </div>
        </div>
      )}

      {messages.map((msg, index) => (
        <div 
          key={index} 
          className={`flex ${msg.role === MessageRole.USER ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`max-w-[85%] sm:max-w-[70%] space-y-2`}>
            {msg.role === MessageRole.MODEL && (
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-[10px] text-white">
                  <i className="fas fa-crown"></i>
                </div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Tilleli AI</span>
              </div>
            )}
            
            <div className={`p-4 rounded-2xl shadow-sm relative group ${
              msg.role === MessageRole.USER 
                ? 'bg-amber-600 text-white rounded-tr-none' 
                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              
              {msg.image && (
                <div className="mt-3 relative overflow-hidden rounded-lg border border-gray-200">
                  <img src={msg.image} alt="Transformation Result" className="w-full h-auto object-cover max-h-[400px]" />
                  {msg.role === MessageRole.MODEL && (
                    <button 
                      onClick={() => handleDownload(msg.image!, `kabyle_transformation_${index}.png`)}
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 flex items-center space-x-2 text-xs"
                      title="Download Image"
                    >
                      <i className="fas fa-download"></i>
                      <span>Download</span>
                    </button>
                  )}
                </div>
              )}

              {msg.isProcessing && (
                <div className="flex items-center space-x-2 mt-2">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  </div>
                  <span className="text-xs text-gray-400 italic">Designing the identity...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatWindow;
