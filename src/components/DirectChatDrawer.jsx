import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Send, Search, ArrowLeft, MessageSquare, Circle, User, 
  UserPlus, UserMinus, UserCheck, UserX, Inbox, Clock 
} from 'lucide-react';
import { useDirectChat } from '../context/DirectChatContext';
import { useAuth } from '../hooks/useAuth';

const DirectChatDrawer = () => {
  const { user } = useAuth();
  const {
    isChatDrawerOpen,
    setIsChatDrawerOpen,
    activeChatUser,
    setActiveChatUser,
    messages,
    unreadMsgs,
    onlineUsers,
    allUsers,
    friendRequests,
    sendDirectMessage,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    unfriendUser,
    isFriend,
    getFriendshipStatus
  } = useDirectChat();

  const [activeTab, setActiveTab] = useState('focusers'); // 'focusers' | 'requests'
  const [searchQuery, setSearchQuery] = useState('');
  const [typedMessage, setTypedMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeChatUser]);

  if (!isChatDrawerOpen) return null;

  // Filter users based on query with safe fallbacks
  const filteredUsers = allUsers.filter(u => {
    const userName = u.name || '';
    return userName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Filter incoming requests
  const incomingRequests = friendRequests.filter(r => r.isIncoming);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;
    sendDirectMessage(typedMessage);
    setTypedMessage('');
  };

  const getUnreadCount = (userId) => {
    return unreadMsgs.filter(m => m.senderId === userId).length;
  };

  const isUserOnline = (userId) => {
    return onlineUsers.some(ou => ou.uid === userId);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex justify-end">
        {/* Backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsChatDrawerOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Drawer content */}
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="relative w-full max-w-md h-full bg-[#0a0d14]/95 border-l border-white/10 shadow-2xl flex flex-col z-10"
        >
          {/* Active Chat / Profile Preview View */}
          {activeChatUser ? (
            (() => {
              const friendshipStatus = getFriendshipStatus(activeChatUser.uid);
              const isUserFriend = friendshipStatus === 'friend';
              const displayName = activeChatUser.name || 'User';

              return (
                <div className="flex flex-col h-full">
                  {/* Chat Header */}
                  <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setActiveChatUser(null)}
                        className="p-2 hover:bg-white/5 rounded-xl text-text-muted hover:text-white transition-colors"
                      >
                        <ArrowLeft size={20} />
                      </button>
                      <div className="relative">
                        {activeChatUser.photoURL ? (
                          <img 
                            src={activeChatUser.photoURL} 
                            alt={displayName} 
                            className="w-10 h-10 rounded-full object-cover border border-white/10"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center font-bold text-white uppercase text-sm">
                            {displayName[0].toUpperCase()}
                          </div>
                        )}
                        {isUserOnline(activeChatUser.uid) && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0a0d14]" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white">{displayName}</h3>
                        <p className="text-[10px] text-text-muted">
                          {isUserOnline(activeChatUser.uid) ? (
                            <span className="text-emerald-400 font-bold uppercase tracking-wider">Online</span>
                          ) : (
                            <span className="opacity-60">Offline</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isUserFriend && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Unfriend ${displayName}? You won't be able to chat with them anymore.`)) {
                              unfriendUser(activeChatUser.uid, displayName);
                            }
                          }}
                          className="p-2 hover:bg-red-500/10 rounded-xl text-text-muted hover:text-red-400 transition-colors"
                          title="Unfriend User"
                        >
                          <UserMinus size={18} />
                        </button>
                      )}
                      <button 
                        onClick={() => setIsChatDrawerOpen(false)}
                        className="p-2 hover:bg-white/5 rounded-xl text-text-muted hover:text-white transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Body conditional based on friendship */}
                  {isUserFriend ? (
                    <>
                      {/* Messages Body */}
                      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-white/[0.01]">
                        {messages.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-text-muted">
                            <MessageSquare size={36} className="opacity-20 mb-3" />
                            <p className="text-xs font-semibold">No messages yet</p>
                            <p className="text-[10px] opacity-60 mt-1">Start the conversation by sending a message below!</p>
                          </div>
                        ) : (
                          messages.map(msg => {
                            const isMe = msg.senderId === user.uid;
                            const msgSenderName = msg.senderName || 'User';
                            return (
                              <div 
                                key={msg.id} 
                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                              >
                                <div className="flex items-end gap-2 max-w-[85%]">
                                  {!isMe && (
                                    msg.senderPhoto ? (
                                      <img 
                                        src={msg.senderPhoto} 
                                        alt={msgSenderName} 
                                        className="w-6 h-6 rounded-full object-cover shrink-0 border border-white/5"
                                      />
                                    ) : (
                                      <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center text-[9px] font-bold text-white uppercase shrink-0">
                                        {msgSenderName[0].toUpperCase()}
                                      </div>
                                    )
                                  )}
                                  <div 
                                    className={`p-3 rounded-2xl text-xs font-medium leading-relaxed ${
                                      isMe 
                                        ? 'bg-gradient-to-r from-brand to-purple-600 text-white rounded-br-none shadow-lg shadow-brand/10' 
                                        : 'bg-white/5 border border-white/10 text-white/95 rounded-bl-none'
                                    }`}
                                  >
                                    {msg.text}
                                  </div>
                                </div>
                                <span className="text-[8px] text-text-muted mt-1 px-1 opacity-60">
                                  {msg.timestamp ? (
                                    new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                  ) : (
                                    'Sending...'
                                  )}
                                </span>
                              </div>
                            );
                          })
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Message Input Footer */}
                      <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-white/5 flex gap-2">
                        <input 
                          type="text"
                          placeholder="Type a message..."
                          value={typedMessage}
                          onChange={(e) => setTypedMessage(e.target.value)}
                          className="flex-1 input-premium px-4 py-3 rounded-xl text-xs text-white"
                        />
                        <button 
                          type="submit"
                          disabled={!typedMessage.trim()}
                          className="p-3 bg-brand hover:bg-brand-hover disabled:opacity-50 disabled:hover:bg-brand rounded-xl text-white transition-all shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center"
                        >
                          <Send size={16} />
                        </button>
                      </form>
                    </>
                  ) : (
                    /* Not Friends Screen */
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white/[0.01]">
                      <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-text-muted mb-6 shadow-inner">
                        <UserX size={36} className="opacity-40" />
                      </div>
                      <h3 className="font-black text-base text-white mb-2">Not Friends Yet</h3>
                      <p className="text-xs text-text-muted leading-relaxed max-w-xs mb-8">
                        You can only chat with users once they have accepted your friend request.
                      </p>

                      <div className="w-full max-w-xs">
                        {friendshipStatus === 'none' && (
                          <button
                            onClick={() => sendFriendRequest(activeChatUser.uid, displayName)}
                            className="w-full py-3.5 px-6 bg-brand hover:bg-brand-hover rounded-xl text-white text-xs font-black transition-all shadow-lg shadow-brand/20 flex items-center justify-center gap-2 hover:scale-102 active:scale-98"
                          >
                            <UserPlus size={16} />
                            Send Friend Request
                          </button>
                        )}

                        {friendshipStatus === 'pending_outgoing' && (
                          <div className="w-full py-3.5 px-6 bg-white/5 border border-white/15 rounded-xl text-text-muted text-xs font-bold flex items-center justify-center gap-2 cursor-default">
                            <Clock size={16} className="animate-pulse" />
                            Friend Request Sent...
                          </div>
                        )}

                        {friendshipStatus === 'pending_incoming' && (
                          <div className="space-y-2">
                            <button
                              onClick={() => acceptFriendRequest(activeChatUser.uid, displayName)}
                              className="w-full py-3.5 px-6 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white text-xs font-black transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 hover:scale-102 active:scale-98"
                            >
                              <UserCheck size={16} />
                              Accept Friend Request
                            </button>
                            <button
                              onClick={() => declineFriendRequest(activeChatUser.uid)}
                              className="w-full py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-white/80 text-xs font-bold transition-all flex items-center justify-center"
                            >
                              Decline Request
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()
          ) : (
            /* User Directory List View */
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-brand/10 text-brand rounded-xl">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <h2 className="font-black text-sm text-white">Direct Inbox</h2>
                    <p className="text-[10px] text-text-muted">Chat in real-time with other focusers</p>
                  </div>
                </div>

                <button 
                  onClick={() => setIsChatDrawerOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-xl text-text-muted hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Tab Selector Buttons */}
              <div className="flex border-b border-white/5 p-2 bg-white/[0.01]">
                <button
                  onClick={() => setActiveTab('focusers')}
                  className={`flex-1 py-2 rounded-xl text-xs font-black tracking-wider transition-all uppercase ${
                    activeTab === 'focusers' 
                      ? 'bg-brand/10 text-brand' 
                      : 'text-text-muted hover:text-white'
                  }`}
                >
                  Focusers
                </button>
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`flex-1 py-2 rounded-xl text-xs font-black tracking-wider transition-all uppercase relative ${
                    activeTab === 'requests' 
                      ? 'bg-brand/10 text-brand' 
                      : 'text-text-muted hover:text-white'
                  }`}
                >
                  Requests
                  {incomingRequests.length > 0 && (
                    <span className="absolute top-1.5 right-6 w-2 h-2 bg-brand rounded-full animate-ping" />
                  )}
                </button>
              </div>

              {activeTab === 'focusers' ? (
                <>
                  {/* User Search Input */}
                  <div className="p-4 border-b border-white/5 relative">
                    <Search size={16} className="absolute left-7 top-7 text-text-muted" />
                    <input 
                      type="text"
                      placeholder="Search registered focusers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full input-premium pl-10 pr-4 py-2.5 rounded-xl text-xs text-white"
                    />
                  </div>

                  {/* Users Directory List */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {filteredUsers.length === 0 ? (
                      <div className="p-10 text-center text-text-muted">
                        <User size={32} className="mx-auto mb-2 opacity-20" />
                        <p className="text-xs font-semibold">No focusers found</p>
                      </div>
                    ) : (
                      filteredUsers.map(u => {
                        const online = isUserOnline(u.uid);
                        const unreadCount = getUnreadCount(u.uid);
                        const friendshipStatus = getFriendshipStatus(u.uid);
                        const isFriendUser = friendshipStatus === 'friend';
                        const focuserName = u.name || 'User';

                        return (
                          <button 
                            key={u.uid}
                            onClick={() => setActiveChatUser(u)}
                            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-all text-left group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                {u.photoURL ? (
                                  <img 
                                    src={u.photoURL} 
                                    alt={focuserName} 
                                    className="w-10 h-10 rounded-full object-cover border border-white/10 group-hover:border-brand/30 transition-colors"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center font-bold text-white uppercase text-sm">
                                    {focuserName[0].toUpperCase()}
                                  </div>
                                )}
                                {online && (
                                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0a0d14] animate-pulse" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-xs text-white group-hover:text-brand transition-colors">{focuserName}</span>
                                  {online && (
                                    <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md tracking-wider">
                                      Live
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-text-muted mt-0.5 truncate max-w-[200px] opacity-75">
                                  {isFriendUser ? (
                                    <span className="text-brand font-bold text-[9px] uppercase tracking-wide">Friend</span>
                                  ) : friendshipStatus === 'pending_outgoing' ? (
                                    <span className="text-slate-400 italic">Request Sent</span>
                                  ) : friendshipStatus === 'pending_incoming' ? (
                                    <span className="text-yellow-500 font-bold">Wants to connect</span>
                                  ) : (
                                    u.email === 'Guest' ? 'Guest User' : 'Forest Focuser'
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {unreadCount > 0 && isFriendUser && (
                                <span className="bg-brand text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-brand/35 animate-bounce">
                                  {unreadCount}
                                </span>
                              )}
                              <ArrowLeft size={14} className="rotate-180 text-text-muted group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </>
              ) : (
                /* Pending Friend Requests Tab View */
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                  {incomingRequests.length === 0 ? (
                    <div className="p-10 text-center text-text-muted">
                      <Inbox size={32} className="mx-auto mb-2 opacity-20" />
                      <p className="text-xs font-semibold">No pending friend requests</p>
                      <p className="text-[10px] opacity-60 mt-1">Incoming invites will appear here!</p>
                    </div>
                  ) : (
                    incomingRequests.map(req => {
                      const reqSenderName = req.senderName || 'User';
                      return (
                        <div 
                          key={req.id}
                          className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center font-bold text-white uppercase text-sm">
                              {reqSenderName[0].toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-xs text-white">{reqSenderName}</span>
                              <p className="text-[10px] text-text-muted mt-0.5">Wants to add you as a friend</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => acceptFriendRequest(req.senderId, reqSenderName)}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white text-[10px] font-black transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => declineFriendRequest(req.senderId)}
                              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-text-muted hover:text-white text-[10px] font-bold transition-colors"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DirectChatDrawer;
