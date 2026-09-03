import React, { useState } from 'react';
import { 
  MessageSquare, Send, User, CheckCircle2, 
  Package, Clock, ArrowLeft 
} from 'lucide-react';
import { Conversation, Message, UserProfile } from '../types';

interface MessagesViewProps {
  currentUser: UserProfile;
  conversations: Conversation[];
  messages: Message[];
  onSendMessage: (conversationId: string, receiverId: string, text: string) => void;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  currentUser,
  conversations,
  messages,
  onSendMessage,
}) => {
  const userConvs = conversations.filter(c => c.participants.includes(currentUser.id));
  const [selectedConvId, setSelectedConvId] = useState<string>(userConvs[0]?.id || 'conv-1');
  const [inputText, setInputText] = useState('');

  const activeConv = userConvs.find(c => c.id === selectedConvId) || userConvs[0];
  const activeMessages = messages.filter(m => m.conversationId === selectedConvId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;
    const receiverId = activeConv.participants.find(p => p !== currentUser.id) || 'usr-2';
    onSendMessage(activeConv.id, receiverId, inputText.trim());
    setInputText('');
  };

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-4 text-zinc-100">
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[550px]">
        {/* Left: Conversation List (4 cols) */}
        <div className="md:col-span-4 border-r border-zinc-800 flex flex-col font-mono">
          <div className="p-3 border-b border-zinc-800 bg-zinc-950">
            <h2 className="font-semibold text-xs text-zinc-200 flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              Trade Communications
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/80">
            {userConvs.length === 0 ? (
              <p className="p-6 text-xs text-zinc-500 italic text-center">No messages yet</p>
            ) : (
              userConvs.map((conv) => {
                const isSelected = conv.id === selectedConvId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`w-full p-3 text-left transition flex items-start gap-2.5 ${
                      isSelected ? 'bg-zinc-800/80 border-l-2 border-emerald-400' : 'hover:bg-zinc-850/50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-200 font-bold flex items-center justify-center shrink-0 border border-zinc-700 text-xs">
                      {conv.participantNames[1]?.charAt(0) || 'U'}
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-zinc-100 truncate">
                          {conv.participantNames.find(n => !n.includes(currentUser.fullName.split(' ')[0])) || 'Trade Partner'}
                        </h4>
                        <span className="text-[10px] text-zinc-500">
                          {new Date(conv.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate">{conv.lastMessage}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Active Chat Window (8 cols) */}
        <div className="md:col-span-8 flex flex-col h-[550px] bg-zinc-950">
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="p-3 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between font-mono">
                <div>
                  <h3 className="font-semibold text-xs text-zinc-100">
                    {activeConv.participantNames.find(n => !n.includes(currentUser.fullName.split(' ')[0])) || 'African Exporter'}
                  </h3>
                  {activeConv.productName && (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                      <Package className="w-3 h-3" /> Discussing: {activeConv.productName}
                    </span>
                  )}
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono">
                {activeMessages.map((msg) => {
                  const isMe = msg.senderId === currentUser.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-md p-3 rounded-lg text-xs leading-relaxed font-sans ${
                          isMe
                            ? 'bg-zinc-100 text-zinc-950 font-medium'
                            : 'bg-zinc-850 text-zinc-200 border border-zinc-700/60'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-zinc-500 mt-1 px-1 font-mono">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Input bar */}
              <form onSubmit={handleSend} className="p-2.5 border-t border-zinc-800 bg-zinc-900 flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type message, trade questions, or delivery inquiries..."
                  className="flex-1 p-2 rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="p-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold transition"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-zinc-500 font-mono">
              Select a conversation to begin chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
