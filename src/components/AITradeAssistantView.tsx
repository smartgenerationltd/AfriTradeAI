import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Send, Globe, MapPin, Search, ArrowRight, ShieldAlert, 
  FileCheck, Calculator, Users, CheckCircle2, RefreshCw, 
  HelpCircle, ChevronRight, AlertTriangle, MessageSquare, Plus,
  Trash2, ExternalLink, Zap, Brain, History, BookOpen, Truck, Scale, TrendingUp, Copy, Check
} from 'lucide-react';
import { Country } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  AIChatSession, 
  AIChatMessage, 
  saveChatSessionToFirestore, 
  getUserChatSessionsFromFirestore, 
  deleteChatSessionFromFirestore 
} from '../services/firebase';

interface AITradeAssistantViewProps {
  countries: Country[];
  initialPrompt?: string;
  initialOrigin?: string;
  initialDestination?: string;
  initialProduct?: string;
  onOpenCalculator: (origin?: string, dest?: string) => void;
  onOpenDocuments: (origin?: string, dest?: string, product?: string) => void;
  onOpenMatching: (query?: string) => void;
}

type TaskType = 'complex' | 'general' | 'fast';
type ChatRole = 'afcfta_specialist' | 'logistics_advisor' | 'customs_broker' | 'market_analyst' | 'general_assistant';

interface RoleMeta {
  id: ChatRole;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge: string;
}

const ROLES: RoleMeta[] = [
  {
    id: 'afcfta_specialist',
    title: 'AfCFTA Legal & Tariff Specialist',
    icon: Scale,
    description: 'Rules of Origin, tariff reduction schedules, and Guided Trade Initiative compliance.',
    badge: 'Legal & Tariffs'
  },
  {
    id: 'logistics_advisor',
    title: 'Trade Corridor & Logistics Coordinator',
    icon: Truck,
    description: 'Northern & Central corridors, transit times, OSBPs, ports, and freight forwarders.',
    badge: 'Logistics & Corridors'
  },
  {
    id: 'customs_broker',
    title: 'Customs & Standards Specialist',
    icon: BookOpen,
    description: 'HS Code classification, SCT clearance, KEBS/RSB/SON standards, and SPS/PVoC certificates.',
    badge: 'Customs & Standards'
  },
  {
    id: 'market_analyst',
    title: 'Commodity & Market Intelligence Analyst',
    icon: TrendingUp,
    description: 'Supply-demand trends, wholesale price discovery, and regional buyer matchmaking.',
    badge: 'Market Intelligence'
  },
  {
    id: 'general_assistant',
    title: 'Pan-African Trade Copilot',
    icon: Globe,
    description: 'General intra-African trade navigation, business calculations, and regional partner advisory.',
    badge: 'General Advisory'
  }
];

export const AITradeAssistantView: React.FC<AITradeAssistantViewProps> = ({
  countries,
  initialPrompt = '',
  initialOrigin = 'Rwanda',
  initialDestination = 'Kenya',
  initialProduct = 'Bourbon Arabica Coffee',
  onOpenCalculator,
  onOpenDocuments,
  onOpenMatching,
}) => {
  const { currentUser, isAuthenticated, signInWithGoogle } = useAuth();

  // Active chat session state
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => 'session_' + Date.now());
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState(initialPrompt);
  const [loading, setLoading] = useState(false);

  // Configuration controls
  const [selectedRole, setSelectedRole] = useState<ChatRole>('general_assistant');
  const [taskType, setTaskType] = useState<TaskType>('general');
  const [useSearchGrounding, setUseSearchGrounding] = useState(false);
  const [useMapsGrounding, setUseMapsGrounding] = useState(false);

  // Corridor Context
  const [originCountry, setOriginCountry] = useState(initialOrigin);
  const [destinationCountry, setDestinationCountry] = useState(initialDestination);
  const [productName, setProductName] = useState(initialProduct);

  // User location for Maps Grounding
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  // Sessions Drawer
  const [savedSessions, setSavedSessions] = useState<AIChatSession[]>([]);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Request user location for Maps Grounding when enabled
  useEffect(() => {
    if (useMapsGrounding && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
        },
        (err) => {
          console.info('Geolocation access denied or unavailable:', err.message);
        },
        { timeout: 5000 }
      );
    }
  }, [useMapsGrounding]);

  // Load previous chat sessions from Firestore
  useEffect(() => {
    async function loadSessions() {
      const uid = currentUser?.uid || currentUser?.id || 'guest_user';
      try {
        const sessions = await getUserChatSessionsFromFirestore(uid);
        setSavedSessions(sessions);
      } catch (err) {
        console.warn('Could not load chat sessions:', err);
      }
    }
    loadSessions();
  }, [currentUser]);

  // Handle initial prompt if provided from outside
  useEffect(() => {
    if (initialPrompt && messages.length === 0) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  // Send message to multi-turn chat endpoint
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || loading) return;

    const userMessageId = 'msg_' + Date.now();
    const newUserMessage: AIChatMessage = {
      id: userMessageId,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInputPrompt('');
    setLoading(true);

    try {
      // Build contextual corridor prefix if relevant
      const corridorPrefix = `[Corridor Context: ${originCountry} -> ${destinationCountry} | Product: ${productName}]\n\n`;
      const messagesPayload = updatedMessages.map(m => ({
        role: m.role,
        content: m.role === 'user' ? (m.id === userMessageId ? corridorPrefix + m.content : m.content) : m.content
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesPayload,
          taskType,
          role: selectedRole,
          useSearch: useSearchGrounding,
          useMaps: useMapsGrounding,
          userLocation: userCoords
        })
      });

      if (!res.ok) {
        throw new Error(`Chat API error: status ${res.status}`);
      }

      const data = await res.json();

      const newAssistantMessage: AIChatMessage = {
        id: 'msg_' + (Date.now() + 1),
        role: 'model',
        content: data.text || 'No response text available.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed,
        groundingChunks: data.groundingChunks,
        webSearchQueries: data.webSearchQueries
      };

      const finalMessages = [...updatedMessages, newAssistantMessage];
      setMessages(finalMessages);

      // Persist session to Firestore
      const uid = currentUser?.uid || currentUser?.id || 'guest_user';
      const sessionData: AIChatSession = {
        id: currentSessionId,
        userId: uid,
        title: query.slice(0, 45) + (query.length > 45 ? '...' : ''),
        role: selectedRole,
        taskType: taskType,
        messages: finalMessages,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await saveChatSessionToFirestore(sessionData);

      // Update in-memory session list
      setSavedSessions(prev => {
        const idx = prev.findIndex(s => s.id === currentSessionId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = sessionData;
          return updated;
        }
        return [sessionData, ...prev];
      });

    } catch (err: any) {
      console.error('Failed to get chat response:', err);
      const errorMessage: AIChatMessage = {
        id: 'msg_' + (Date.now() + 1),
        role: 'model',
        content: `### ⚠️ Connection Notice\nUnable to reach the AfriTrade AI server. Please verify your connection and try again.\n\n*Details: ${err.message || 'Network request failed'}*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: taskType === 'complex' ? 'gemini-3.1-pro-preview' : 'gemini-3.5-flash'
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Start fresh conversation
  const handleStartNewChat = () => {
    setCurrentSessionId('session_' + Date.now());
    setMessages([]);
    setInputPrompt('');
  };

  // Load selected session
  const handleLoadSession = (session: AIChatSession) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages || []);
    setSelectedRole((session.role as ChatRole) || 'general_assistant');
    setTaskType(session.taskType || 'general');
    setShowHistoryDrawer(false);
  };

  // Delete session
  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    await deleteChatSessionFromFirestore(sessionId);
    setSavedSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      handleStartNewChat();
    }
  };

  const copyToClipboard = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const samplePrompts = [
    {
      title: "AfCFTA Rules of Origin",
      prompt: "What are the specific value-addition and transformation criteria for coffee and agricultural agro-processing under AfCFTA?",
      role: "afcfta_specialist" as ChatRole,
      task: "complex" as TaskType,
    },
    {
      title: "Northern Corridor Transit",
      prompt: "Analyze the transit logistics, One-Stop Border Posts (OSBP), and port clearance between Mombasa and Kigali.",
      role: "logistics_advisor" as ChatRole,
      task: "general" as TaskType,
    },
    {
      title: "Live Commodity Pricing",
      prompt: "Search for current wholesale coffee and tea export prices and demand across East and Southern Africa.",
      role: "market_analyst" as ChatRole,
      task: "general" as TaskType,
      search: true
    },
    {
      title: "Border Posts & Ports Locations",
      prompt: "Locate major border clearance posts and ports connecting Kenya, Uganda, and Rwanda with operational coordinates.",
      role: "logistics_advisor" as ChatRole,
      task: "general" as TaskType,
      maps: true
    },
    {
      title: "Quick HS Code Definition",
      prompt: "What is the 6-digit Harmonized System code for unroasted Arabica coffee beans, and what is its standard tariff line?",
      role: "customs_broker" as ChatRole,
      task: "fast" as TaskType,
    }
  ];

  const currentRoleMeta = ROLES.find(r => r.id === selectedRole) || ROLES[4];

  // Helper to parse markdown text nicely
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-2 text-xs text-zinc-200 leading-relaxed font-sans">
        {lines.map((line, i) => {
          if (line.startsWith('### ')) {
            return (
              <h4 key={i} className="text-sm font-bold text-emerald-400 font-display mt-3 pt-1 border-t border-zinc-800/60 first:mt-0 first:pt-0 first:border-0">
                {line.replace('### ', '')}
              </h4>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h3 key={i} className="text-base font-bold text-emerald-300 font-display mt-4 pt-1 border-t border-zinc-800/80 first:mt-0 first:pt-0 first:border-0">
                {line.replace('## ', '')}
              </h3>
            );
          }
          if (line.startsWith('* ') || line.startsWith('- ')) {
            return (
              <div key={i} className="flex items-start gap-2 pl-2">
                <span className="text-emerald-500 font-bold shrink-0">•</span>
                <span>{line.replace(/^[*\-]\s+/, '')}</span>
              </div>
            );
          }
          if (/^\d+\.\s/.test(line)) {
            const num = line.match(/^\d+/)?.[0];
            const text = line.replace(/^\d+\.\s*/, '');
            return (
              <div key={i} className="flex items-start gap-2 pl-2">
                <span className="text-emerald-400 font-mono font-semibold shrink-0">{num}.</span>
                <span>{text}</span>
              </div>
            );
          }
          if (line.startsWith('> ')) {
            return (
              <blockquote key={i} className="pl-3 border-l-2 border-emerald-500/60 text-zinc-400 italic my-2">
                {line.replace('> ', '')}
              </blockquote>
            );
          }
          if (!line.trim()) {
            return <div key={i} className="h-1" />;
          }
          return <p key={i}>{line}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-3 space-y-4 text-zinc-100">
      {/* Header Bar */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-emerald-400 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" /> AfriTrade Multi-Turn Copilot
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-[11px] font-mono">
              {taskType === 'complex' && '🧠 Complex Task (gemini-3.1-pro-preview)'}
              {taskType === 'general' && '⚡ General Task (gemini-3.5-flash)'}
              {taskType === 'fast' && '🚀 Fast Task (gemini-3.1-flash-lite)'}
            </span>
            {useSearchGrounding && (
              <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-[11px] font-mono flex items-center gap-1">
                <Search className="w-3 h-3" /> Live Search Grounded
              </span>
            )}
            {useMapsGrounding && (
              <span className="px-2 py-0.5 rounded bg-blue-950/80 border border-blue-800/80 text-blue-300 text-[11px] font-mono flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Maps Grounded
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-display text-zinc-100">
            Intra-African Trade Intelligence Terminal
          </h1>
          <p className="text-zinc-400 text-xs leading-relaxed mt-0.5">
            Interactive multi-turn AI consultation for AfCFTA compliance, customs clearance, transit corridors, and market matchmaking.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleStartNewChat}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs text-zinc-200 transition flex items-center gap-1.5 font-medium"
            title="Start new conversation"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>New Chat</span>
          </button>

          <button
            onClick={() => setShowHistoryDrawer(true)}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs text-zinc-300 transition flex items-center gap-1.5"
            title="View saved conversations"
          >
            <History className="w-3.5 h-3.5 text-zinc-400" />
            <span>History ({savedSessions.length})</span>
          </button>

          {!isAuthenticated && (
            <button
              onClick={() => signInWithGoogle('buyer')}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs text-emerald-400 transition flex items-center gap-1.5 font-medium"
              title="Sign in with Google to sync conversations"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Sync Cloud</span>
            </button>
          )}
        </div>
      </div>

      {/* Control & Grounding Configuration Bar */}
      <div className="bg-zinc-900/90 rounded-xl p-3.5 sm:p-4 border border-zinc-800 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Role Persona Picker */}
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 mb-1">
              Chatbot Role & System Instruction:
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as ChatRole)}
              className="w-full p-2 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-200 text-xs font-mono focus:border-zinc-700 focus:outline-hidden"
            >
              {ROLES.map(role => (
                <option key={role.id} value={role.id}>
                  {role.title}
                </option>
              ))}
            </select>
          </div>

          {/* Model & Task Speed Selector */}
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 mb-1">
              Task Speed & Engine:
            </label>
            <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 font-mono text-[11px]">
              <button
                type="button"
                onClick={() => setTaskType('complex')}
                className={`py-1 rounded text-center transition ${
                  taskType === 'complex' 
                    ? 'bg-zinc-800 text-emerald-400 font-semibold shadow-xs' 
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="gemini-3.1-pro-preview for particularly complex legal & tariff analysis"
              >
                Complex
              </button>
              <button
                type="button"
                onClick={() => setTaskType('general')}
                className={`py-1 rounded text-center transition ${
                  taskType === 'general' 
                    ? 'bg-zinc-800 text-emerald-400 font-semibold shadow-xs' 
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="gemini-3.5-flash for general trade tasks & grounding"
              >
                General
              </button>
              <button
                type="button"
                onClick={() => setTaskType('fast')}
                className={`py-1 rounded text-center transition ${
                  taskType === 'fast' 
                    ? 'bg-zinc-800 text-emerald-400 font-semibold shadow-xs' 
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="gemini-3.1-flash-lite for rapid lookups & fast Q&A"
              >
                Fast
              </button>
            </div>
          </div>

          {/* Grounding Toggles: Search Grounding & Maps Grounding */}
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 mb-1">
              Grounding Capabilities:
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const next = !useSearchGrounding;
                  setUseSearchGrounding(next);
                  if (next) setUseMapsGrounding(false); // only one grounding tool at a time
                }}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono flex items-center justify-center gap-1.5 transition ${
                  useSearchGrounding 
                    ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300 font-semibold' 
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
                title="Search Grounding using gemini-3.5-flash with googleSearch tool"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Google Search</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const next = !useMapsGrounding;
                  setUseMapsGrounding(next);
                  if (next) setUseSearchGrounding(false); // only one grounding tool at a time
                }}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono flex items-center justify-center gap-1.5 transition ${
                  useMapsGrounding 
                    ? 'bg-blue-950/80 border-blue-700 text-blue-300 font-semibold' 
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
                title="Maps Grounding using gemini-3.5-flash with googleMaps tool"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Google Maps</span>
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Corridor Context Parameters */}
        <div className="pt-2 border-t border-zinc-800/70 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
          <div>
            <span className="text-[10px] text-zinc-500 block mb-0.5">Origin Country:</span>
            <select
              value={originCountry}
              onChange={(e) => setOriginCountry(e.target.value)}
              className="w-full p-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs focus:outline-hidden"
            >
              {countries.map(c => (
                <option key={c.code} value={c.name}>{c.flag} {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 block mb-0.5">Destination Country:</span>
            <select
              value={destinationCountry}
              onChange={(e) => setDestinationCountry(e.target.value)}
              className="w-full p-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs focus:outline-hidden"
            >
              {countries.map(c => (
                <option key={c.code} value={c.name}>{c.flag} {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 block mb-0.5">Focus Commodity:</span>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Bourbon Coffee, Shea Butter"
              className="w-full p-1.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Main Conversation Canvas (Scrollable Thread) */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-[580px] shadow-2xl">
        {/* Thread Header with active Role indicator */}
        <div className="bg-zinc-900/90 px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center text-emerald-400">
              <currentRoleMeta.icon className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-semibold text-zinc-200">{currentRoleMeta.title}</span>
              <span className="text-zinc-500 text-[11px] ml-2 hidden sm:inline">{currentRoleMeta.description}</span>
            </div>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">
            {messages.length} message{messages.length === 1 ? '' : 's'} in thread
          </span>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center p-4 max-w-xl mx-auto space-y-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 shadow-inner">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-100 font-display">
                  Welcome to AfriTrade AI Copilot
                </h3>
                <p className="text-zinc-400 text-xs mt-1">
                  Start an interactive, multi-turn conversation. Choose a role above or click any prompt below to begin your trade investigation:
                </p>
              </div>

              {/* Sample Prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full text-left">
                {samplePrompts.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedRole(s.role);
                      setTaskType(s.task);
                      if (s.search) {
                        setUseSearchGrounding(true);
                        setUseMapsGrounding(false);
                      } else if (s.maps) {
                        setUseMapsGrounding(true);
                        setUseSearchGrounding(false);
                      }
                      handleSendMessage(s.prompt);
                    }}
                    className="p-3 rounded-lg border border-zinc-800/90 bg-zinc-900/60 hover:bg-zinc-850 hover:border-zinc-700 text-xs text-zinc-300 font-mono transition group flex flex-col justify-between"
                  >
                    <div className="font-semibold text-emerald-400 mb-1 flex items-center justify-between">
                      <span>{s.title}</span>
                      <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-emerald-400" />
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-2">
                      {s.prompt}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <div className="w-7 h-7 rounded-lg bg-zinc-850 border border-zinc-700 flex items-center justify-center text-emerald-400 shrink-0 mt-1">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-xl p-3.5 sm:p-4 space-y-2.5 ${
                    msg.role === 'user'
                      ? 'bg-zinc-850 text-zinc-100 border border-zinc-700/80 ml-auto'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-200'
                  }`}
                >
                  {/* Top message metadata */}
                  <div className="flex items-center justify-between gap-3 text-[10px] font-mono text-zinc-400 border-b border-zinc-800/80 pb-1.5">
                    <span className="font-semibold text-zinc-300">
                      {msg.role === 'user' ? 'You (Trader)' : 'AfriTrade AI'}
                    </span>
                    <div className="flex items-center gap-2">
                      {msg.modelUsed && (
                        <span className="px-1.5 py-0.2 rounded bg-zinc-950 text-emerald-400 border border-zinc-800">
                          {msg.modelUsed}
                        </span>
                      )}
                      <span>{msg.timestamp}</span>
                      {msg.role === 'model' && (
                        <button
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          className="hover:text-zinc-200 p-0.5 rounded transition"
                          title="Copy response text"
                        >
                          {copiedMsgId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Message content */}
                  {msg.role === 'user' ? (
                    <div className="text-xs text-zinc-100 whitespace-pre-wrap leading-relaxed font-mono">
                      {msg.content}
                    </div>
                  ) : (
                    renderFormattedContent(msg.content)
                  )}

                  {/* Google Search Grounding Sources Display */}
                  {msg.groundingChunks && msg.groundingChunks.some(c => c.web?.uri) && (
                    <div className="pt-2 mt-2 border-t border-zinc-800/80 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                        <Search className="w-3.5 h-3.5" />
                        <span>Verified Google Search Sources:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.groundingChunks
                          .filter(c => c.web?.uri)
                          .map((chunk, cIdx) => (
                            <a
                              key={cIdx}
                              href={chunk.web?.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 text-[10px] text-zinc-300 hover:text-emerald-300 transition"
                            >
                              <span className="max-w-[200px] truncate">{chunk.web?.title || chunk.web?.uri}</span>
                              <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-70" />
                            </a>
                          ))}
                      </div>
                      {msg.webSearchQueries && msg.webSearchQueries.length > 0 && (
                        <p className="text-[10px] font-mono text-zinc-500">
                          Searched: {msg.webSearchQueries.join(' • ')}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Google Maps Grounding Sources Display */}
                  {msg.groundingChunks && msg.groundingChunks.some(c => c.maps?.uri) && (
                    <div className="pt-2 mt-2 border-t border-zinc-800/80 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-blue-400">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Google Maps Verified Trade Corridors & Places:</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {msg.groundingChunks
                          .filter(c => c.maps?.uri)
                          .map((chunk, mIdx) => (
                            <a
                              key={mIdx}
                              href={chunk.maps?.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 text-xs text-zinc-200 hover:text-blue-300 transition flex items-center justify-between group"
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                <span className="font-mono text-[11px] truncate font-medium">
                                  {chunk.maps?.title || 'View on Google Maps'}
                                </span>
                              </div>
                              <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-blue-400 shrink-0 ml-1.5" />
                            </a>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Quick operational action links attached to assistant advice */}
                  {msg.role === 'model' && (
                    <div className="pt-2 border-t border-zinc-800/70 flex flex-wrap gap-2 text-[10px] font-mono">
                      <button
                        onClick={() => onOpenCalculator(originCountry, destinationCountry)}
                        className="px-2 py-1 rounded bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-emerald-400 flex items-center gap-1"
                      >
                        <Calculator className="w-3 h-3 text-emerald-400" />
                        <span>Calculate Landed Cost</span>
                      </button>
                      <button
                        onClick={() => onOpenDocuments(originCountry, destinationCountry, productName)}
                        className="px-2 py-1 rounded bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-emerald-400 flex items-center gap-1"
                      >
                        <FileCheck className="w-3 h-3 text-emerald-400" />
                        <span>Documents Checklist</span>
                      </button>
                      <button
                        onClick={() => onOpenMatching(`Counterparties for ${productName} in ${destinationCountry}`)}
                        className="px-2 py-1 rounded bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-emerald-400 flex items-center gap-1"
                      >
                        <Users className="w-3 h-3 text-emerald-400" />
                        <span>Match Partners</span>
                      </button>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0 mt-1">
                    <span className="text-xs font-bold font-mono">U</span>
                  </div>
                )}
              </div>
            ))
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded-lg bg-zinc-850 border border-zinc-700 flex items-center justify-center text-emerald-400 shrink-0">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 space-y-2 text-xs text-zinc-400 font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    Consulting {currentRoleMeta.title}...
                    {useSearchGrounding && ' (Grounding with Google Search)'}
                    {useMapsGrounding && ' (Querying Google Maps Corridors)'}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500">
                  Processing via {taskType === 'complex' ? 'gemini-3.1-pro-preview' : taskType === 'fast' ? 'gemini-3.1-flash-lite' : 'gemini-3.5-flash'}...
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Composer */}
        <div className="p-3 bg-zinc-900/90 border-t border-zinc-800 space-y-2">
          <div className="relative flex items-center">
            <textarea
              rows={2}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={`Ask ${currentRoleMeta.badge}: Tariffs, transit routes, AfCFTA documents, or market questions (Shift+Enter for new line)...`}
              className="w-full p-2.5 pr-24 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-hidden focus:border-zinc-700 resize-none font-mono"
            />
            <div className="absolute right-2.5 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={loading || !inputPrompt.trim()}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-zinc-950 font-bold text-xs transition flex items-center gap-1 shadow-xs"
              >
                {loading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-zinc-500 px-1">
            <div className="flex items-center gap-3">
              <span>Press <strong>Enter</strong> to send</span>
              <span>•</span>
              <span className="text-zinc-400">Context: {originCountry} → {destinationCountry}</span>
            </div>
            <span>Auto-saving to Firestore</span>
          </div>
        </div>
      </div>

      {/* Mandatory Customs Disclaimer Notice */}
      <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-900/50 flex items-start gap-2.5 text-amber-300 text-xs font-mono">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-[11px] mb-0.5">Mandatory Customs & Regulatory Disclaimer:</strong>
          <p className="leading-relaxed text-[11px] text-amber-300/80">
            Verify current requirements with the relevant customs, trade or government authority. AI output is informational and must not be presented as legal or customs advice.
          </p>
        </div>
      </div>

      {/* Saved Conversations Drawer / Modal */}
      {showHistoryDrawer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full p-4 space-y-4 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-zinc-100">Saved Chat Sessions</h3>
              </div>
              <button
                onClick={() => setShowHistoryDrawer(false)}
                className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded bg-zinc-800"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {savedSessions.length === 0 ? (
                <div className="text-center py-8 text-xs text-zinc-500 font-mono">
                  No saved sessions yet. Start asking questions to build your trade history.
                </div>
              ) : (
                savedSessions.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleLoadSession(s)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition flex items-center justify-between group ${
                      s.id === currentSessionId
                        ? 'bg-zinc-800 border-emerald-500/60 text-emerald-300'
                        : 'bg-zinc-950 border-zinc-800/90 text-zinc-300 hover:bg-zinc-850 hover:border-zinc-700'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold truncate font-mono text-[11px]">
                        {s.title}
                      </p>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {s.messages?.length || 0} msgs • {new Date(s.updatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleDeleteSession(e, s.id)}
                      className="text-zinc-500 hover:text-red-400 p-1 rounded opacity-60 group-hover:opacity-100 transition"
                      title="Delete chat session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-zinc-800 flex justify-between items-center text-xs text-zinc-400 font-mono">
              <span>{savedSessions.length} total sessions</span>
              <button
                onClick={handleStartNewChat}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 transition"
              >
                + New Conversation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
