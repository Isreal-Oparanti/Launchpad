'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useUser } from '@/context/AuthContext';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { authService } from '@/utils/auth';
import { messageService } from '@/utils/message';

export default function ChatPage() {
  const { userId } = useParams();
  const router = useRouter();
  const { user: currentUser } = useUser();
  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const [activeTab, setActiveTab] = useState('chat');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userResponse, messagesResponse] = await Promise.all([
          authService.getUserProfile(userId),
          messageService.getMessages(userId)
        ]);
        setOtherUser(userResponse.user);
        setMessages(messagesResponse.messages);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to load conversation');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    
    // Optimistic update
    const tempMessage = {
      id: Date.now(), // temporary ID
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderInitials: currentUser.initials,
      senderProfilePicture: currentUser.profilePicture,
      text: newMessage.trim(),
      timestamp: new Date(),
      read: false,
      isSending: true
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    try {
      const response = await messageService.sendMessage(userId, newMessage.trim());
      
      // Replace temporary message with the one from server
      setMessages(prev => 
        prev.filter(msg => msg.id !== tempMessage.id)
           .concat(response.message)
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove the failed message
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h1>
          <button
            onClick={() => router.back()}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="md:ml-64">
        {/* <Header /> */}
        
        <div className="h-screen flex flex-col">
          {/* Sticky Chat Header */}
          <div className="sticky bg-red-100 top-0 z-10 border-b border-gray-200 bg-white px-4 py-3 md:px-6 md:py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/message')}
                className="p-1 md:p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="w-8 h-8 md:w-10 md:h-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-base overflow-hidden">
                {otherUser.profilePicture ? (
                  <img 
                    src={otherUser.profilePicture} 
                    alt={otherUser.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{otherUser.initials}</span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h1 className="font-semibold text-gray-900 text-sm md:text-base truncate">{otherUser.fullName}</h1>
                {/* <p className="text-xs md:text-sm text-gray-500 truncate">{otherUser.title}</p> */}
              </div>
            </div>
          </div>

          {/* Messages Container - Scrollable Area */}
          <div className="flex-1 overflow-y-auto bg-gray-50 px-3 py-4 md:px-4 md:py-6 pb-16 md:pb-6">
            <div className="max-w-3xl mx-auto space-y-3 md:space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-xs lg:max-w-md px-3 py-2 rounded-2xl text-sm ${
                      message.senderId === currentUser.id
                        ? 'bg-teal-600 text-white rounded-br-none'
                        : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                    } ${message.isSending ? 'opacity-70' : ''}`}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.text}</p>
                    <div className={`text-xs mt-1 ${message.senderId === currentUser.id ? 'text-teal-100' : 'text-gray-500'}`}>
                      {formatTime(message.timestamp)}
                      {message.isSending && ' • Sending...'}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Sticky Message Input - Now positioned properly without bottom nav */}
          <div className="sticky bottom-0 border-t border-gray-200 bg-white px-3 py-3 md:px-4 md:py-4">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSendMessage} className="flex gap-2 md:gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm md:text-base"
                    disabled={sending}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="px-4 py-2 md:px-6 md:py-3 bg-teal-600 text-white rounded-full hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm md:text-base"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span className="sr-only">Sending</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span className="sr-only">Send</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}