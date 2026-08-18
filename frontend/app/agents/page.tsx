'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  Bot, Headset, Database, Code, Send, Paperclip,
  Settings, Wrench, CheckCircle2, MoreVertical,
  Sparkles, MessageSquare
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AGENTS = [
  { id: 'support', name: 'Customer Support', icon: Headset, model: 'GPT-4 Turbo', status: 'active', color: 'from-blue-500 to-cyan-400' },
  { id: 'data', name: 'Data Analyst', icon: Database, model: 'Claude 3', status: 'idle', color: 'from-purple-500 to-pink-400' },
  { id: 'code', name: 'Code Assistant', icon: Code, model: 'GPT-4', status: 'idle', color: 'from-emerald-500 to-teal-400' },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Hello! I am your AI Customer Support agent. I can help with order inquiries, returns, troubleshooting, and general questions. How can I assist you today?',
    timestamp: new Date(),
  },
];

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0]);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I understand your request. Let me help you with that. Based on the context, I recommend checking the workflow logs for more details.",
        "Great question! You can achieve this by adding a Transform node after the HTTP request to map the response data to your desired format.",
        "I've analyzed your query. The best approach would be to use the conditional node to handle different response codes appropriately.",
        "Thank you for reaching out! I can see that your workflow is configured correctly. The issue might be related to API rate limiting.",
      ];
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Agents List */}
      <div className="w-80 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h3 className="font-semibold text-sm">AI Agents</h3>
          <button className="w-8 h-8 rounded-lg bg-primary hover:bg-primary/90 flex items-center justify-center text-white text-xs">
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {AGENTS.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className={cn(
                'w-full p-3 rounded-lg border text-left transition-all',
                selectedAgent.id === agent.id
                  ? 'bg-primary/5 border-primary/20'
                  : 'bg-accent/30 border-border hover:border-border/80'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center", agent.color)}>
                  <agent.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">{agent.name}</h4>
                  <p className="text-xs text-muted-foreground">{agent.model}</p>
                </div>
                <div className={cn("w-2 h-2 rounded-full", agent.status === 'active' ? 'bg-emerald-500' : 'bg-slate-500')} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col bg-background">
        <div className="h-16 border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center", selectedAgent.color)}>
              <selectedAgent.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">{selectedAgent.name}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className={cn("w-2 h-2 rounded-full", selectedAgent.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500')} />
                {selectedAgent.status === 'active' ? 'Online' : 'Idle'} · Model: {selectedAgent.model}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-lg bg-card border border-border hover:bg-accent text-sm transition-colors flex items-center gap-2">
              <Settings className="w-4 h-4" /> Settings
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-card border border-border hover:bg-accent text-sm transition-colors flex items-center gap-2">
              <Wrench className="w-4 h-4" /> Tools
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex gap-3 animate-slide-in',
                msg.role === 'user' && 'flex-row-reverse'
              )}
            >
              {msg.role === 'assistant' ? (
                <div className={cn("w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center shrink-0", selectedAgent.color)}>
                  <Bot className="w-4 h-4 text-white" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
              <div className={cn(
                "glass-panel rounded-2xl px-4 py-3 max-w-[70%]",
                msg.role === 'user' ? 'rounded-tr-sm bg-primary/10 border-primary/20' : 'rounded-tl-sm'
              )}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3">
              <div className={cn("w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center shrink-0", selectedAgent.color)}>
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="glass-panel rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <button className="p-2.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full px-4 py-2.5 rounded-lg bg-card border border-border focus:border-primary focus:outline-none text-sm"
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              className="px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-sm transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="w-80 bg-card border-l border-border flex flex-col">
        <div className="p-4 border-b border-border"><h3 className="font-semibold text-sm">Configuration</h3></div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground uppercase font-mono">System Prompt</label>
            <textarea
              className="w-full mt-1.5 px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-primary outline-none h-32 resize-none"
              defaultValue="You are a helpful customer support agent. Be polite, concise, and always offer to escalate to a human if needed."
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase font-mono">Model</label>
            <select className="w-full mt-1.5 px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-primary outline-none">
              <option>GPT-4 Turbo</option>
              <option>GPT-4</option>
              <option>Claude 3 Opus</option>
              <option>Claude 3 Sonnet</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase font-mono">Temperature</label>
            <input type="range" min="0" max="100" defaultValue="70" className="w-full mt-1.5 accent-primary" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>0</span><span>0.7</span><span>1</span></div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase font-mono">Max Tokens</label>
            <input type="number" defaultValue="2000" className="w-full mt-1.5 px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-primary outline-none" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase font-mono">Tools</label>
            <div className="mt-2 space-y-2">
              {['Web Search', 'DB Query', 'Calculator'].map((tool) => (
                <div key={tool} className="flex items-center justify-between p-2 rounded-lg bg-accent/30">
                  <span className="text-sm">{tool}</span>
                  <input type="checkbox" defaultChecked={tool !== 'Calculator'} className="accent-primary" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
