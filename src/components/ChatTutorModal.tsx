import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  X, 
  Bot, 
  User, 
  HelpCircle, 
  BookOpen, 
  Lightbulb, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { Question, ChatMessage } from '../types';
import { recordCreditSpend } from '../utils/creditTracker';

interface ChatTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  activeQuestion?: Question;
}

export const ChatTutorModal: React.FC<ChatTutorModalProps> = ({
  isOpen,
  onClose,
  initialPrompt,
  activeQuestion,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content:
        "Hello! I am Prof. Lama, your 24/7 STET Exam Preparation Mentor. I specialize in STET / Teacher Eligibility exams across Child Development & Pedagogy, Social Science, and English Language. How can I help clarify your doubts or exam concepts today?",
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const quickPrompts = [
    'Explain Piaget\'s 4 stages with memory tricks',
    'How do I solve Longitude & local time calculation questions?',
    'What are the 5 Constitutional Writs under Article 32 & 226?',
    'Explain BICS vs CALP by Jim Cummins',
    'What is the 5+3+3+4 structure in NEP 2020?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isGenerating) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: 'Just now',
      questionRef: activeQuestion,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputText('');
    setIsGenerating(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          currentTopic: activeQuestion?.topic || 'General STET Preparation',
          questionContext: activeQuestion
            ? {
                year: activeQuestion.year,
                question: activeQuestion.question,
                options: activeQuestion.options,
                correctIndex: activeQuestion.correctIndex,
                explanation: activeQuestion.explanation,
              }
            : undefined,
        }),
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply || "I'm ready to assist with any pedagogical or subject doubts you have.",
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, botMsg]);
      recordCreditSpend({
        type: 'chat',
        credits: 2.25,
        summary: text.slice(0, 50),
      });
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        role: 'assistant',
        content:
          "I experienced a temporary connection hiccup, but here is key advice: Remember for STET Assertion-Reason questions, check if statement (A) is factually true first, then verify if (R) logically causes (A). Please try asking again!",
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4" id="chat-tutor-modal">
      <div className="bg-white rounded-2xl w-full max-w-2xl h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-5 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/30 border border-violet-400/40 flex items-center justify-center text-violet-300">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base font-['Outfit']">24/7 Ask Lama</h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  AI Mentor Online
                </span>
              </div>
              <p className="text-xs text-slate-300">
                24/7 STET Exam Preparation Mentor • CDP, Social Science, Maths &amp; Science, English
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            id="close-chat-tutor-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Attached Question Context Pill if opened from question */}
        {activeQuestion && (
          <div className="bg-indigo-50/90 border-b border-indigo-100 px-4 py-2 text-xs text-indigo-950 flex items-center justify-between">
            <div className="flex items-center space-x-2 truncate">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="font-bold truncate">
                Context: [STET {activeQuestion.year} • {activeQuestion.category}] {activeQuestion.question}
              </span>
            </div>
            <span className="text-[10px] font-mono text-indigo-600 shrink-0 ml-2">Referenced</span>
          </div>
        )}

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((msg) => {
            const isBot = msg.role === 'assistant';

            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-2.5 ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                    isBot
                      ? 'bg-white text-slate-800 border border-slate-200/80 shadow-2xs'
                      : 'bg-indigo-600 text-white font-medium shadow-2xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                  <span className={`block text-[9px] mt-1.5 text-right ${isBot ? 'text-slate-400' : 'text-indigo-200'}`}>
                    {msg.timestamp}
                  </span>
                </div>

                {!isBot && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-2xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isGenerating && (
            <div className="flex items-center space-x-2 text-xs text-slate-500 bg-white p-3 rounded-xl border border-slate-200 w-fit">
              <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
              <span>Prof. Lama is formulating your exam explanation...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Question Chips */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 overflow-x-auto flex items-center space-x-2 no-scrollbar">
          <span className="text-[10px] font-bold text-slate-400 shrink-0 uppercase">Suggestions:</span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 whitespace-nowrap transition-colors border border-slate-200 shrink-0 cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask about a theory, historical event, question doubt, or memory trick..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isGenerating}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              id="tutor-chat-input-field"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isGenerating}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs disabled:opacity-40 transition-colors shadow-xs flex items-center space-x-1.5 cursor-pointer"
              id="tutor-chat-send-btn"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
