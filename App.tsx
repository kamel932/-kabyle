
import React, { useState, useRef, useCallback } from 'react';
import { Message, MessageRole } from './types';
import { geminiService } from './services/geminiService';
import ChatWindow from './components/ChatWindow';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = useCallback(async () => {
    if (!selectedImage && !inputValue.trim()) return;

    const userMessage: Message = {
      role: MessageRole.USER,
      text: inputValue || (selectedImage ? "Transform this photo with a Kabyle face." : ""),
      image: selectedImage || undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    const currentImage = selectedImage;
    setSelectedImage(null);
    setIsProcessing(true);

    // Initial bot acknowledgment
    const botPlaceholder: Message = {
      role: MessageRole.MODEL,
      text: "Understood. I'm carefully analyzing the photo to integrate an authentic Kabyle face and traditional Amazigh jewelry. This will take a moment...",
      isProcessing: true,
    };
    setMessages(prev => [...prev, botPlaceholder]);

    try {
      if (currentImage) {
        const result = await geminiService.transformToKabyle(currentImage, userMessage.text);
        
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: MessageRole.MODEL,
            text: result.text,
            image: result.imageUrl,
            isProcessing: false,
          };
          return updated;
        });
      } else {
        // Generic response if no image provided
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: MessageRole.MODEL,
            text: "Please upload an image for me to transform. I need a visual base to add the Kabyle features to.",
            isProcessing: false,
          };
          return updated;
        });
      }
    } catch (error) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: MessageRole.MODEL,
          text: "I apologize, but I encountered an error during the transformation. Please ensure the image is clear and try again.",
          isProcessing: false,
        };
        return updated;
      });
    } finally {
      setIsProcessing(false);
    }
  }, [inputValue, selectedImage]);

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-screen max-w-5xl mx-auto shadow-2xl bg-white overflow-hidden border-x border-gray-100">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between glass-morphism sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 kabyle-gradient rounded-xl flex items-center justify-center text-white shadow-lg">
            <i className="fas fa-user-circle text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-gray-800">Tilleli</h1>
            <p className="text-[10px] uppercase tracking-widest text-emerald-600 font-bold">Amazigh Persona Creator</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-gray-400">
          <button className="p-2 hover:bg-gray-50 rounded-full transition-colors">
            <i className="fas fa-info-circle"></i>
          </button>
        </div>
      </header>

      {/* Main Chat Area */}
      <ChatWindow messages={messages} />

      {/* Input Area */}
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        {selectedImage && (
          <div className="mb-4 relative inline-block">
            <img 
              src={selectedImage} 
              alt="Selected" 
              className="w-24 h-24 object-cover rounded-xl border-2 border-amber-500 shadow-md" 
            />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-lg hover:bg-red-600 transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        <div className="flex items-end space-x-3">
          <div className="flex-1 relative flex items-center">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange} 
            />
            <button 
              onClick={triggerFileUpload}
              className={`absolute left-3 p-2 rounded-lg transition-all ${selectedImage ? 'text-amber-600 bg-amber-50' : 'text-gray-400 hover:text-amber-600'}`}
              title="Upload Image"
            >
              <i className="fas fa-image text-lg"></i>
            </button>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={selectedImage ? "Add specific instructions (optional)..." : "Upload a photo to begin..."}
              className="w-full pl-14 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none max-h-32 text-gray-700"
              rows={1}
            />
          </div>
          <button 
            onClick={handleSend}
            disabled={isProcessing || (!selectedImage && !inputValue.trim())}
            className={`h-[50px] w-[50px] flex items-center justify-center rounded-2xl shadow-lg transition-all ${
              isProcessing || (!selectedImage && !inputValue.trim())
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-amber-600 hover:bg-amber-700 text-white active:scale-95'
            }`}
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <i className="fas fa-paper-plane"></i>
            )}
          </button>
        </div>
        <p className="mt-2 text-[10px] text-gray-400 text-center uppercase tracking-widest">
          Powered by Gemini AI • Authentic Amazigh Aesthetics
        </p>
      </div>
    </div>
  );
};

export default App;
