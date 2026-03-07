import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Paperclip,
  Smile,
  Search,
  MoreVertical,
  Phone,
  Video,
  Check,
  CheckCheck,
  Image as ImageIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useChatStore } from "@/stores/chatStore";

// Mock conversations
const mockConversations = [
  {
    id: "1",
    name: "Dr. Angela Yu",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    lastMessage: "Great question! Let me explain...",
    timestamp: "2 min ago",
    unread: 2,
    online: true,
  },
  {
    id: "2",
    name: "Maximilian Schwarzmüller",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    lastMessage: "The project looks good!",
    timestamp: "1 hour ago",
    unread: 0,
    online: true,
  },
  {
    id: "3",
    name: "Jose Portilla",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
    lastMessage: "Check out the resources I shared",
    timestamp: "3 hours ago",
    unread: 0,
    online: false,
  },
  {
    id: "4",
    name: "Study Group - Web Dev",
    avatar: "",
    lastMessage: "Sarah: Anyone working on the assignment?",
    timestamp: "Yesterday",
    unread: 5,
    online: false,
    isGroup: true,
  },
];

// Mock messages
const mockMessages = [
  {
    id: "m1",
    senderId: "other",
    content: "Hi! I saw your question about React hooks. Happy to help!",
    timestamp: "10:30 AM",
    read: true,
  },
  {
    id: "m2",
    senderId: "me",
    content:
      "Thank you! I'm confused about when to use useEffect vs useLayoutEffect.",
    timestamp: "10:32 AM",
    read: true,
  },
  {
    id: "m3",
    senderId: "other",
    content:
      "Great question! The main difference is timing. useEffect runs asynchronously after the render is painted to the screen, while useLayoutEffect runs synchronously after render but before paint.",
    timestamp: "10:35 AM",
    read: true,
  },
  {
    id: "m4",
    senderId: "other",
    content:
      "In most cases, you'll want useEffect. Only use useLayoutEffect when you need to measure DOM elements or prevent visual flickers.",
    timestamp: "10:35 AM",
    read: true,
  },
  {
    id: "m5",
    senderId: "me",
    content:
      "That makes sense! So useLayoutEffect is for when I need to read layout from the DOM?",
    timestamp: "10:38 AM",
    read: true,
  },
  {
    id: "m6",
    senderId: "other",
    content:
      "Exactly! For example, if you need to measure an element's size or position before the user sees it.",
    timestamp: "10:40 AM",
    read: true,
  },
];

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] = useState(
    mockConversations[0],
  );
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: `m${Date.now()}`,
      senderId: "me",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      read: false,
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");

    // Simulate typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const reply = {
        id: `m${Date.now() + 1}`,
        senderId: "other",
        content: "Thanks for your message! I'll get back to you shortly.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        read: true,
      };
      setMessages((prev) => [...prev, reply]);
    }, 2000);
  };

  const filteredConversations = mockConversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-8rem)] border rounded-xl overflow-hidden">
        {/* Conversations Sidebar */}
        <div className="w-80 border-r flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-lg font-bold mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left ${
                  selectedConversation.id === conversation.id ? "bg-muted" : ""
                }`}
              >
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={conversation.avatar} />
                    <AvatarFallback>
                      {conversation.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className="font-semibold truncate">
                      {conversation.name}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {conversation.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.lastMessage}
                  </p>
                </div>
                {conversation.unread > 0 && (
                  <span className="bg-accent text-accent-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                    {conversation.unread}
                  </span>
                )}
              </button>
            ))}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar>
                  <AvatarImage src={selectedConversation.avatar} />
                  <AvatarFallback>
                    {selectedConversation.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                {selectedConversation.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-background" />
                )}
              </div>
              <div>
                <p className="font-semibold">{selectedConversation.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedConversation.online ? "Online" : "Offline"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.senderId === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      message.senderId === "me"
                        ? "bg-accent text-accent-foreground rounded-br-none"
                        : "bg-muted rounded-bl-none"
                    }`}
                  >
                    <p>{message.content}</p>
                    <div
                      className={`flex items-center gap-1 mt-1 text-xs ${
                        message.senderId === "me" ? "justify-end" : ""
                      }`}
                    >
                      <span className="opacity-70">{message.timestamp}</span>
                      {message.senderId === "me" &&
                        (message.read ? (
                          <CheckCheck className="h-3 w-3 text-success" />
                        ) : (
                          <Check className="h-3 w-3" />
                        ))}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedConversation.avatar} />
                    <AvatarFallback>
                      {selectedConversation.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-2xl px-4 py-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Paperclip className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <ImageIcon className="h-5 w-5" />
              </Button>
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1"
              />
              <Button variant="ghost" size="icon">
                <Smile className="h-5 w-5" />
              </Button>
              <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
