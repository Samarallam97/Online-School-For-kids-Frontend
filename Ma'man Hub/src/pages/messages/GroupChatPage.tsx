import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Paperclip,
  Smile,
  Search,
  Users,
  Settings,
  Plus,
  AtSign,
  ThumbsUp,
  Heart,
  Laugh,
  MoreHorizontal,
  Edit2,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Mock groups
const mockGroups = [
  {
    id: "g1",
    name: "Web Development Cohort",
    avatar: "",
    membersCount: 45,
    lastMessage: "Sarah: Anyone working on the assignment?",
    timestamp: "2 min ago",
    unread: 12,
  },
  {
    id: "g2",
    name: "React Study Group",
    avatar: "",
    membersCount: 28,
    lastMessage: "John: Check out this hook pattern!",
    timestamp: "1 hour ago",
    unread: 0,
  },
  {
    id: "g3",
    name: "Python Beginners",
    avatar: "",
    membersCount: 156,
    lastMessage: "Emma: Thanks for the help everyone!",
    timestamp: "3 hours ago",
    unread: 5,
  },
];

// Mock group messages
const mockGroupMessages = [
  {
    id: "gm1",
    senderId: "user1",
    senderName: "Sarah Chen",
    senderAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    content: "Hey everyone! Anyone working on the final project?",
    timestamp: "10:30 AM",
    reactions: [
      { emoji: "👍", count: 3 },
      { emoji: "🎉", count: 1 },
    ],
  },
  {
    id: "gm2",
    senderId: "user2",
    senderName: "John Smith",
    senderAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    content: "Yes! I'm stuck on the authentication part. @Sarah any tips?",
    timestamp: "10:32 AM",
    reactions: [],
  },
  {
    id: "gm3",
    senderId: "me",
    senderName: "You",
    senderAvatar: "",
    content: "I can help with that! Let me share my implementation.",
    timestamp: "10:35 AM",
    reactions: [{ emoji: "❤️", count: 2 }],
  },
  {
    id: "gm4",
    senderId: "user3",
    senderName: "Emma Wilson",
    senderAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
    content:
      "That would be super helpful! I'm also curious about the approach.",
    timestamp: "10:36 AM",
    reactions: [],
  },
  {
    id: "gm5",
    senderId: "user1",
    senderName: "Sarah Chen",
    senderAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    content:
      "@John I used Supabase Auth, it's really straightforward. Here's the docs: https://supabase.com/docs/guides/auth",
    timestamp: "10:38 AM",
    reactions: [
      { emoji: "👍", count: 5 },
      { emoji: "🙏", count: 2 },
    ],
  },
];

// Mock members
const mockMembers = [
  {
    id: "user1",
    name: "Sarah Chen",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    role: "admin",
    online: true,
  },
  {
    id: "user2",
    name: "John Smith",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    role: "member",
    online: true,
  },
  {
    id: "user3",
    name: "Emma Wilson",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
    role: "member",
    online: false,
  },
  { id: "me", name: "You", avatar: "", role: "member", online: true },
];

export default function GroupChatPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(mockGroups[0]);
  const [messages, setMessages] = useState(mockGroupMessages);
  const [newMessage, setNewMessage] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
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
      id: `gm${Date.now()}`,
      senderId: "me",
      senderName: "You",
      senderAvatar: "",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      reactions: [],
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");
  };

  const handleInputChange = (value: string) => {
    setNewMessage(value);

    // Check for @ mention
    const lastAtIndex = value.lastIndexOf("@");
    if (lastAtIndex !== -1 && lastAtIndex === value.length - 1) {
      setMentionQuery("");
    } else if (
      lastAtIndex !== -1 &&
      !value.substring(lastAtIndex).includes(" ")
    ) {
      setMentionQuery(value.substring(lastAtIndex + 1));
    } else {
      setMentionQuery(null);
    }
  };

  const handleMention = (memberName: string) => {
    const lastAtIndex = newMessage.lastIndexOf("@");
    setNewMessage(newMessage.substring(0, lastAtIndex) + `@${memberName} `);
    setMentionQuery(null);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const existingReaction = msg.reactions.find((r) => r.emoji === emoji);
          if (existingReaction) {
            return {
              ...msg,
              reactions: msg.reactions.map((r) =>
                r.emoji === emoji ? { ...r, count: r.count + 1 } : r,
              ),
            };
          }
          return {
            ...msg,
            reactions: [...msg.reactions, { emoji, count: 1 }],
          };
        }
        return msg;
      }),
    );
  };

  const filteredGroups = mockGroups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredMembers =
    mentionQuery !== null
      ? mockMembers.filter(
          (m) =>
            m.name.toLowerCase().includes(mentionQuery.toLowerCase()) &&
            m.id !== "me",
        )
      : [];

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-8rem)] border rounded-xl overflow-hidden">
        {/* Groups Sidebar */}
        <div className="w-80 border-r flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Group Chats</h2>
              <Button variant="ghost" size="icon">
                <Plus className="h-5 w-5" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            {filteredGroups.map((group) => (
              <button
                key={group.id}
                onClick={() => setSelectedGroup(group)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left ${
                  selectedGroup.id === group.id ? "bg-muted" : ""
                }`}
              >
                <Avatar>
                  <AvatarFallback className="bg-accent/20 text-accent">
                    {group.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className="font-semibold truncate">{group.name}</p>
                    <span className="text-xs text-muted-foreground">
                      {group.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {group.lastMessage}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    <Users className="h-3 w-3 inline mr-1" />
                    {group.membersCount} members
                  </p>
                </div>
                {group.unread > 0 && (
                  <span className="bg-accent text-accent-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                    {group.unread}
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
              <Avatar>
                <AvatarFallback className="bg-accent/20 text-accent">
                  {selectedGroup.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{selectedGroup.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedGroup.membersCount} members
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={showMembers ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setShowMembers(!showMembers)}
              >
                <Users className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`group flex gap-3 ${message.senderId === "me" ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.senderAvatar} />
                      <AvatarFallback>{message.senderName[0]}</AvatarFallback>
                    </Avatar>
                    <div
                      className={`max-w-[70%] ${message.senderId === "me" ? "text-right" : ""}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {message.senderName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp}
                        </span>
                      </div>
                      <div
                        className={`relative rounded-2xl px-4 py-2 ${
                          message.senderId === "me"
                            ? "bg-accent text-accent-foreground rounded-br-none"
                            : "bg-muted rounded-bl-none"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>

                        {/* Quick reactions on hover */}
                        <div
                          className={`absolute -bottom-3 ${message.senderId === "me" ? "left-0" : "right-0"} opacity-0 group-hover:opacity-100 transition-opacity`}
                        >
                          <div className="flex gap-1 bg-background border rounded-full p-1 shadow-sm">
                            <button
                              onClick={() => handleReaction(message.id, "👍")}
                              className="p-1 hover:bg-muted rounded-full"
                            >
                              👍
                            </button>
                            <button
                              onClick={() => handleReaction(message.id, "❤️")}
                              className="p-1 hover:bg-muted rounded-full"
                            >
                              ❤️
                            </button>
                            <button
                              onClick={() => handleReaction(message.id, "😂")}
                              className="p-1 hover:bg-muted rounded-full"
                            >
                              😂
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Reactions */}
                      {message.reactions.length > 0 && (
                        <div
                          className={`flex gap-1 mt-2 ${message.senderId === "me" ? "justify-end" : ""}`}
                        >
                          {message.reactions.map((reaction, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 bg-muted px-2 py-0.5 rounded-full text-xs"
                            >
                              {reaction.emoji} {reaction.count}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Message actions */}
                    {message.senderId === "me" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Members Sidebar */}
            {showMembers && (
              <div className="w-64 border-l p-4">
                <h3 className="font-semibold mb-4">
                  Members ({mockMembers.length})
                </h3>
                <div className="space-y-3">
                  {mockMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{member.name[0]}</AvatarFallback>
                        </Avatar>
                        {member.online && (
                          <span className="absolute bottom-0 right-0 w-2 h-2 bg-success rounded-full border border-background" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {member.name}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {member.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t relative">
            {/* Mention suggestions */}
            {mentionQuery !== null && filteredMembers.length > 0 && (
              <div className="absolute bottom-full left-4 right-4 mb-2 bg-background border rounded-lg shadow-lg p-2">
                {filteredMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => handleMention(member.name)}
                    className="w-full flex items-center gap-2 p-2 hover:bg-muted rounded-lg text-left"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{member.name}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Paperclip className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <AtSign className="h-5 w-5" />
              </Button>
              <Input
                placeholder="Type a message... (use @ to mention)"
                value={newMessage}
                onChange={(e) => handleInputChange(e.target.value)}
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
