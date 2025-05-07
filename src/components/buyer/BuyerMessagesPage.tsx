
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Search, Send, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage, UserRole } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatThread {
  id: string;
  seller_id: string;
  seller_name: string;
  product_id: string | null;
  product_name: string | null;
  updated_at: string;
  unread_count: number;
}

const BuyerMessagesPage = () => {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [isLoadingThreads, setIsLoadingThreads] = useState(true);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'sellers' | 'admins'>('sellers');
  const { user } = useAuth();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Fetch chat threads when component mounts
  useEffect(() => {
    if (!user) return;

    const fetchChatThreads = async () => {
      setIsLoadingThreads(true);
      try {
        if (activeTab === 'sellers') {
          // Get all threads where the user is a buyer
          const { data: threadData, error: threadError } = await supabase
            .from('chat_threads')
            .select('*')
            .eq('buyer_id', user.id)
            .order('updated_at', { ascending: false });

          if (threadError) throw threadError;

          // Fetch additional details for each thread
          const enrichedThreads = await Promise.all((threadData || []).map(async (thread) => {
            // Get seller name
            const { data: sellerData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', thread.seller_id)
              .single();
            
            // Get product name if thread has product_id
            let productName = null;
            if (thread.product_id) {
              const { data: productData } = await supabase
                .from('products')
                .select('name')
                .eq('id', thread.product_id)
                .single();
              
              productName = productData?.name || null;
            }

            // Count unread messages
            const { count: unreadCount } = await supabase
              .from('chat_messages')
              .select('*', { count: 'exact', head: true })
              .eq('thread_id', thread.id)
              .eq('receiver_id', user.id)
              .eq('is_read', false);

            return {
              id: thread.id,
              seller_id: thread.seller_id,
              seller_name: sellerData?.full_name || 'Unknown Seller',
              product_id: thread.product_id,
              product_name: productName,
              updated_at: thread.updated_at,
              unread_count: unreadCount || 0
            };
          }));

          setThreads(enrichedThreads);
        } else {
          // In admin tab, find all chat threads with admins
          const admins = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('role', 'admin');

          if (admins.error) throw admins.error;

          const adminThreads: ChatThread[] = [];
          
          for (const admin of admins.data || []) {
            const threadId = generateChatThreadId(user.id, admin.id);
            
            // Check if there are any messages in this thread
            const { count } = await supabase
              .from('chat_messages')
              .select('*', { count: 'exact', head: true })
              .eq('thread_id', threadId);
              
            if (count && count > 0) {
              // Get the latest message timestamp
              const { data: latestMessage } = await supabase
                .from('chat_messages')
                .select('created_at')
                .eq('thread_id', threadId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
                
              // Count unread messages
              const { count: unreadCount } = await supabase
                .from('chat_messages')
                .select('*', { count: 'exact', head: true })
                .eq('thread_id', threadId)
                .eq('receiver_id', user.id)
                .eq('is_read', false);
                
              adminThreads.push({
                id: threadId,
                seller_id: admin.id,
                seller_name: admin.full_name || 'Admin',
                product_id: null,
                product_name: null,
                updated_at: latestMessage?.created_at || new Date().toISOString(),
                unread_count: unreadCount || 0
              });
            } else {
              // Include admin in the list even if there are no messages yet
              adminThreads.push({
                id: threadId,
                seller_id: admin.id,
                seller_name: admin.full_name || 'Admin',
                product_id: null,
                product_name: null,
                updated_at: new Date().toISOString(),
                unread_count: 0
              });
            }
          }
          
          setThreads(adminThreads);
        }
      } catch (error) {
        console.error('Error fetching chat threads:', error);
      } finally {
        setIsLoadingThreads(false);
      }
    };

    fetchChatThreads();

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('chat-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `receiver_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New message received:', payload);
          // If we're currently viewing this thread, refresh messages
          if (selectedThreadId === payload.new.thread_id) {
            fetchMessages(selectedThreadId);
          }
          // Refresh threads to update unread counts
          fetchChatThreads();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_threads',
          filter: `buyer_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Chat thread updated:', payload);
          fetchChatThreads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedThreadId, activeTab]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load messages when a thread is selected
  useEffect(() => {
    if (selectedThreadId) {
      fetchMessages(selectedThreadId);
      
      // Mark messages as read
      if (user) {
        const markMessagesAsRead = async () => {
          await supabase
            .from('chat_messages')
            .update({ is_read: true })
            .eq('thread_id', selectedThreadId)
            .eq('receiver_id', user.id);
            
          // Update unread count in thread list
          setThreads(currentThreads => 
            currentThreads.map(thread => 
              thread.id === selectedThreadId 
                ? { ...thread, unread_count: 0 } 
                : thread
            )
          );
        };
        
        markMessagesAsRead();
      }
    }
  }, [selectedThreadId, user]);

  const generateChatThreadId = (buyerId: string, sellerId: string): string => {
    const sortedIds = [buyerId, sellerId].sort();
    return `chat_${sortedIds[0]}_${sortedIds[1]}`;
  };

  const fetchMessages = async (threadId: string) => {
    setIsLoadingMessages(true);
    try {
      console.log('Fetching messages for thread ID:', threadId);
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        setMessages([]);
        setIsLoadingMessages(false);
        return;
      }

      const formattedMessages: ChatMessage[] = data.map(msg => ({
        id: msg.id,
        threadId: msg.thread_id || '',
        senderId: msg.sender_id,
        senderName: msg.sender_name || 'Unknown',
        senderRole: (msg.sender_role as UserRole) || 'buyer',
        receiverId: msg.receiver_id,
        receiverName: msg.receiver_name || 'Unknown',
        content: msg.content,
        timestamp: msg.created_at,
        isRead: msg.is_read || false
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedThreadId || !messageInput.trim() || !user) return;
    
    // Find the selected thread to get seller_id
    const selectedThread = threads.find(t => t.id === selectedThreadId);
    if (!selectedThread) return;

    try {
      console.log('Sending message to thread:', selectedThreadId);
      
      const messageRecord = {
        thread_id: selectedThreadId,
        sender_id: user.id,
        sender_name: user.name || 'Buyer',
        sender_role: 'buyer',
        receiver_id: selectedThread.seller_id,
        receiver_name: selectedThread.seller_name,
        receiver_role: activeTab === 'sellers' ? 'seller' : 'admin',
        content: messageInput,
        created_at: new Date().toISOString(),
        is_read: false
      };

      const { error } = await supabase
        .from('chat_messages')
        .insert([messageRecord]);

      if (error) throw error;

      // Update thread's updated_at timestamp
      if (activeTab === 'sellers') {
        await supabase
          .from('chat_threads')
          .upsert([
            {
              id: selectedThreadId,
              buyer_id: user.id,
              seller_id: selectedThread.seller_id,
              product_id: selectedThread.product_id,
              updated_at: new Date().toISOString()
            }
          ]);
      } else {
        // For admin chats, ensure a thread exists
        await supabase
          .from('chat_threads')
          .upsert([
            {
              id: selectedThreadId,
              buyer_id: user.id,
              seller_id: selectedThread.seller_id, // admin ID in this case
              updated_at: new Date().toISOString()
            }
          ]);
      }

      // Add to messages locally for immediate display
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        threadId: selectedThreadId,
        senderId: user.id,
        senderName: user.name || 'Buyer',
        senderRole: 'buyer',
        receiverId: selectedThread.seller_id,
        receiverName: selectedThread.seller_name,
        content: messageInput,
        timestamp: new Date().toISOString(),
        isRead: false
      };

      setMessages(prev => [...prev, newMessage]);
      setMessageInput('');
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const filteredThreads = threads.filter(thread => {
    const query = searchQuery.toLowerCase();
    return (
      thread.seller_name.toLowerCase().includes(query) ||
      (thread.product_name && thread.product_name.toLowerCase().includes(query))
    );
  });

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // If today, show time only
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Otherwise show date
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <MessageCircle className="text-agrigreen-600 mr-2 h-5 w-5" />
        <h1 className="text-2xl font-bold">Your Messages</h1>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'sellers' | 'admins')}>
        <TabsList className="mb-4">
          <TabsTrigger value="sellers">Chat with Sellers</TabsTrigger>
          <TabsTrigger value="admins">Chat with Admins</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left sidebar - threads list */}
            <div className="md:col-span-1">
              <Card className="h-[70vh] flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    {activeTab === 'sellers' ? 'Seller Conversations' : 'Admin Conversations'}
                  </CardTitle>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search conversations..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto p-2">
                  {isLoadingThreads ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="p-2 animate-pulse">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
                            <div className="space-y-2 flex-1">
                              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredThreads.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {searchQuery ? (
                        <p>No conversations matching your search</p>
                      ) : (
                        <p>No conversations yet</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredThreads.map(thread => (
                        <div
                          key={thread.id}
                          className={`p-2 rounded-md cursor-pointer hover:bg-gray-100 ${
                            selectedThreadId === thread.id ? 'bg-gray-100' : ''
                          } ${thread.unread_count > 0 ? 'border-l-4 border-agrigreen-500' : ''}`}
                          onClick={() => setSelectedThreadId(thread.id)}
                        >
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarImage src={`https://avatar.vercel.sh/${thread.seller_name}.png`} />
                              <AvatarFallback>{thread.seller_name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-baseline">
                                <h3 className="font-medium truncate">{thread.seller_name}</h3>
                                <span className="text-xs text-gray-500 flex-shrink-0 ml-1">
                                  {formatTimestamp(thread.updated_at)}
                                </span>
                              </div>
                              {thread.product_name && (
                                <p className="text-sm text-gray-500 truncate">
                                  Product: {thread.product_name}
                                </p>
                              )}
                              {thread.unread_count > 0 && (
                                <div className="mt-1 flex items-center">
                                  <span className="bg-agrigreen-500 text-white text-xs rounded-full px-2 py-0.5">
                                    {thread.unread_count} new
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Right side - messages */}
            <div className="md:col-span-2">
              <Card className="h-[70vh] flex flex-col">
                {selectedThreadId ? (
                  <>
                    <CardHeader className="pb-2 border-b">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage 
                              src={`https://avatar.vercel.sh/${threads.find(t => t.id === selectedThreadId)?.seller_name || 'user'}.png`} 
                              alt={threads.find(t => t.id === selectedThreadId)?.seller_name || 'Chat'} 
                            />
                            <AvatarFallback>
                              {(threads.find(t => t.id === selectedThreadId)?.seller_name || 'C').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {threads.find(t => t.id === selectedThreadId)?.seller_name || 'Chat'}
                        </CardTitle>
                        <Badge>
                          {activeTab === 'sellers' ? 'Seller' : 'Admin'}
                        </Badge>
                      </div>
                      {threads.find(t => t.id === selectedThreadId)?.product_name && (
                        <p className="text-sm text-gray-500">
                          Regarding: {threads.find(t => t.id === selectedThreadId)?.product_name}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="flex-grow overflow-y-auto p-4">
                      {isLoadingMessages ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map(i => (
                            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                              <div className={`rounded-lg p-3 max-w-[80%] animate-pulse ${
                                i % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'
                              }`}>
                                <div className="h-4 w-24 bg-gray-300 rounded mb-2"></div>
                                <div className="h-3 w-32 bg-gray-300 rounded"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <MessageCircle className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                          <p>No messages yet. Start the conversation!</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages.map((msg: ChatMessage) => (
                            <div
                              key={msg.id}
                              className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`rounded-lg px-3 py-2 max-w-[80%] ${
                                  msg.senderId === user?.id
                                    ? 'bg-agrigreen-600 text-white'
                                    : 'bg-gray-100'
                                }`}
                              >
                                <p>{msg.content}</p>
                                <p className="text-xs opacity-70 mt-1">
                                  {formatTimestamp(msg.timestamp)}
                                </p>
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </CardContent>
                    <div className="p-3 border-t">
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Type your message..."
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          className="flex-1 min-h-[60px] max-h-[120px]"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button
                          onClick={handleSendMessage}
                          className="self-end bg-agrigreen-600 hover:bg-agrigreen-700"
                          disabled={!messageInput.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center p-4 text-center">
                    <div>
                      <MessageCircle className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                      <h3 className="text-lg font-medium">Select a conversation</h3>
                      <p className="text-gray-500 mt-1">
                        Choose a conversation from the list to start chatting
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BuyerMessagesPage;
