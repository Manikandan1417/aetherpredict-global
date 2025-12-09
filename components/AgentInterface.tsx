
import React, { useState, useEffect, useRef } from 'react';
import { getAgentResponse } from '../services/geminiService';

interface AgentInterfaceProps {
  activeBasinId: string;
  onNavigate: (location: string) => void;
}

const AgentInterface: React.FC<AgentInterfaceProps> = ({ activeBasinId, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    { role: 'model', content: "Shield Protocol Active. Awaiting orders." }
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isOpen]);

  useEffect(() => {
    if (isMuted) {
      window.speechSynthesis.cancel();
    }
  }, [isMuted]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    const newMsgs = [...messages, { role: 'user', content: text }];
    setMessages(newMsgs);
    setInput("");
    setIsProcessing(true);

    try {
      // Pass activeBasinId so Agent knows context
      const response = await getAgentResponse(text, chatHistory, activeBasinId);
      
      setMessages([...newMsgs, { role: 'model', content: response.text }]);
      setChatHistory(response.newHistory);

      // Handle Side Effects (Navigation)
      if (response.action && response.action.type === 'NAVIGATE') {
         onNavigate(response.action.payload);
      }

      // TTS
      if (!isMuted) {
        const utterance = new SpeechSynthesisUtterance(response.text);
        utterance.rate = 1.1;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }

    } catch (e) {
      setMessages([...newMsgs, { role: 'model', content: "Error connecting to backend." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window)) return;
    
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleSend(transcript);
    };
    recognition.start();
  };

  const suggestions = [
    "Status of Cyclone Ditwah?",
    "Show Florida risks",
    "Deep dive Tampa",
    "Find nearest shelters"
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="absolute bottom-6 right-6 z-[600] w-14 h-14 bg-cyan-600 hover:bg-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(8,145,178,0.6)] border border-white/20 transition-all hover:scale-110"
        >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" viewBox="0 0 20 20" fill="currentColor">
             <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
           </svg>
        </button>
      )}

      {/* Chat Interface */}
      {isOpen && (
        <div className="absolute bottom-6 right-6 z-[600] w-96 h-[500px] glass-panel rounded-2xl flex flex-col overflow-hidden border border-cyan-500/30 shadow-2xl animate-fade-in-up">
          {/* Header */}
          <div className="bg-slate-900/80 p-4 border-b border-slate-700 flex justify-between items-center">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <h3 className="font-bold text-cyan-400">GEMINI 3 PRO AGENT</h3>
             </div>
             
             <div className="flex items-center gap-3">
               <button 
                  onClick={() => setIsMuted(!isMuted)} 
                  className={`p-1 rounded hover:bg-slate-800 transition-colors ${isMuted ? 'text-slate-500' : 'text-cyan-400'}`}
                  title={isMuted ? "Unmute Voice" : "Mute Voice"}
               >
                  {isMuted ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                         <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                  ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                         <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                  )}
               </button>
               <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                 </svg>
               </button>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
             {messages.map((m, i) => (
               <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg text-sm ${m.role === 'user' ? 'bg-cyan-700/50 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'}`}>
                    {m.content}
                  </div>
               </div>
             ))}
             {isProcessing && (
               <div className="flex justify-start">
                 <div className="bg-slate-800 p-3 rounded-lg rounded-bl-none border border-slate-700 flex gap-1">
                   <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                   <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100"></div>
                   <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200"></div>
                 </div>
               </div>
             )}
             <div ref={messagesEndRef} />
          </div>

          {!isProcessing && messages.length < 5 && (
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
              {suggestions.map(s => (
                <button 
                  key={s} 
                  onClick={() => handleSend(s)}
                  className="whitespace-nowrap bg-slate-800 border border-slate-700 text-cyan-400 text-xs px-3 py-1 rounded-full hover:bg-slate-700 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="p-3 bg-slate-900 border-t border-slate-700 flex gap-2">
             <button 
               onClick={toggleVoice}
               className={`p-2 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400 hover:text-cyan-400'}`}
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
               </svg>
             </button>
             <input 
               className="flex-1 bg-slate-800 border-none rounded px-3 text-sm text-white focus:ring-1 focus:ring-cyan-500 outline-none"
               placeholder="Ask Shield..."
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
             />
             <button 
               onClick={() => handleSend(input)}
               disabled={!input.trim()}
               className="p-2 bg-cyan-600 hover:bg-cyan-500 rounded text-white disabled:opacity-50"
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
               </svg>
             </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AgentInterface;
