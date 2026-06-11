"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Lightbulb,
  FileText,
  TrendingUp,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const AI_CHAT_URL = "https://innotrack-graduation-project-v1-2.hf.space/chat";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ProjectContext {
  title?: string;
  category?: string;
  technologies?: string;
  abstract?: string;
  description?: string;
  problemStatement?: string;
  proposedSolution?: string;
  objectives?: string;
}

const getSuggestedPrompts = (projectTitle?: string) => [
  {
    icon: Lightbulb,
    text: "Explore AI Project Ideas",
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
  },
  {
    icon: Sparkles,
    text: `Generate Features For "${projectTitle || "My Project"}"`,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    icon: TrendingUp,
    text: "Enhance My Graduation Project",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
  {
    icon: FileText,
    text: "Recommend a FinTech Tech Stack",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
];

function StaggeredTextFade({ text }: { text: string }) {
  const tokens = text.split(/(\s+)/);
  let wordCount = 0;
  return (
    <span className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90 block">
      {tokens.map((token, i) => {
        if (token.trim() !== "") wordCount++;
        return (
          <span
            key={i}
            className="animate-in fade-in fill-mode-backwards"
            style={{ animationDuration: "500ms", animationDelay: `${wordCount * 30}ms` }}
          >
            {token}
          </span>
        );
      })}
    </span>
  );
}

function MessageContent({
  content,
  onOptionClick,
}: {
  content: string;
  onOptionClick: (text: string) => void;
}) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let textBuffer: string[] = [];
  let optionCount = 0;
  let isInteractiveSection = false;

  const flushText = (key: string) => {
    if (textBuffer.length > 0) {
      // Filter out garbage lines like "_____________________" or "None"
      const cleanedBuffer = textBuffer.filter(line => !line.match(/^_{3,}$/) && line.trim() !== "None");

      while (cleanedBuffer.length > 0 && cleanedBuffer[cleanedBuffer.length - 1].trim() === "") {
        cleanedBuffer.pop();
      }

      if (cleanedBuffer.length > 0) {
        const markdownText = cleanedBuffer.join("\n");
        elements.push(
          <div key={key} className="space-y-1 animate-in fade-in duration-700 fill-mode-backwards">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ node, ...props }) => <p className="text-[15px] leading-relaxed mb-3 last:mb-0 text-foreground/90 whitespace-pre-wrap" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-5 mb-3 space-y-1.5 marker:text-primary" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-5 mb-3 space-y-1.5 marker:text-primary" {...props} />,
                li: ({ node, ...props }) => <li className="text-[15px] leading-relaxed text-foreground/90" {...props} />,
                h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-5 mb-2 text-foreground" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-lg font-semibold mt-4 mb-2 text-foreground" {...props} />,
                h3: ({ node, ...props }) => <h3 className="text-[15px] font-semibold mt-3 mb-1 text-foreground" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-semibold text-foreground" {...props} />,
                a: ({ node, ...props }) => <a className="text-primary hover:underline" {...props} />,
                code: ({ node, inline, ...props }: any) => 
                  inline ? (
                    <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                  ) : (
                    <pre className="bg-muted text-foreground p-3 rounded-xl overflow-x-auto text-sm font-mono border border-border/50 mb-3" {...props} />
                  ),
              }}
            >
              {markdownText}
            </ReactMarkdown>
          </div>
        );
      }
      textBuffer = [];
    }
  };

  lines.forEach((line, idx) => {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes("project idea") || lowerLine.includes("choose what you want") || lowerLine.includes("you can also type")) {
      isInteractiveSection = true;
    } else if (lowerLine.includes("feature") || lowerLine.includes("requirement") || lowerLine.includes("step")) {
      isInteractiveSection = false;
    }

    const emojiMatch = line.match(/^(?:\d️⃣)\s+(.+)$/u);
    const bulletMatch = isInteractiveSection ? line.match(/^[-*•]\s+(.+)$/u) : null;
    const numberMatch = isInteractiveSection ? line.match(/^(?:\d[.):\]]|\[\d\])\s+(.+)$/u) : null;
    
    const match = emojiMatch || bulletMatch || numberMatch;

    if (match) {
      flushText(`text-${idx}`);
      optionCount++;
      const num = optionCount;
      const label = match[1].trim();
      elements.push(
        <button
          key={`opt-${idx}`}
          onClick={() => onOptionClick(label)}
          className="flex items-center gap-2.5 w-full text-left mt-1.5 px-3.5 py-2.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all duration-150 group shadow-sm hover:shadow-md"
        >
          <span className="w-6 h-6 rounded-lg bg-primary text-primary-foreground text-[12px] font-bold flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
            {num}
          </span>
          <span className="text-[15px] font-semibold text-foreground/90">{label}</span>
        </button>
      );
    } else {
      textBuffer.push(line);
    }
  });

  flushText("text-end");

  return <div className="space-y-0.5">{elements}</div>;
}

function InnoChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user: authUser } = useAuth();
  const [userId, setUserId] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const payload = JSON.parse(jsonPayload);
          const id = payload.nameid || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || payload.sub;
          if (id) {
            setUserId(id.toString());
          }
        } catch (e) {
          console.error("Failed to parse token payload:", e);
        }
      }
    }
  }, []);

  const projectContextRaw = searchParams.get("context");
  const projectContext = projectContextRaw
    ? JSON.parse(projectContextRaw)
    : null;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isTypingGreeting, setIsTypingGreeting] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const greetingText = projectContext?.title
      ? `Hello! I'm InnoChat, your AI assistant for graduation projects. I can see you're working on "${projectContext.title}". How can I help you today? I can:\n\n• Provide feedback on your project idea\n• Suggest improvements to increase originality\n• Help refine your problem statement and objectives\n• Recommend relevant technologies\n• Check for similar existing projects\n\nWhat would you like to discuss?`
      : "Hello! I'm InnoChat, your AI assistant for graduation projects. I can help you brainstorm ideas, refine your proposal, check originality, and provide guidance throughout your project journey. How can I assist you today?";

    // Show initial typing indicator
    setIsTyping(true);

    const timer = setTimeout(() => {
      setIsTyping(false);
      
      const greetingId = "1";
      setMessages([
        {
          id: greetingId,
          role: "assistant",
          content: greetingText,
          timestamp: new Date(),
        },
      ]);
      
      setIsTypingGreeting(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [projectContext?.title]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    const isFirstUserMessage = !messages.some((m) => m.role === "user");
    let apiMessage = input;
    if (isFirstUserMessage && projectContext?.title) {
      apiMessage = `[System Context: The student is working on a project titled "${projectContext.title}". Category: "${projectContext.category || ""}". Technologies: "${projectContext.technologies || ""}". Description: "${projectContext.description || ""}". Problem Statement: "${projectContext.problemStatement || ""}". Objectives: "${projectContext.objectives || ""}". Please keep this project details in mind.]\n\nQuestion: ${input}`;
    }

    if (!AI_CHAT_URL) {
      setIsTyping(false);
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Error: AI Chat URL is not configured. Please define NEXT_PUBLIC_AI_CHAT_URL in your environment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      return;
    }

    try {
      const response = await fetch(AI_CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId || authUser?.name || "anonymous",
          message: apiMessage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }

      const data = await response.json();
      let rawContent = data.response || "Sorry, I couldn't generate a response.";
      
      const typeIndex = rawContent.toLowerCase().indexOf("you can also type");
      if (typeIndex !== -1) {
        const beforeType = rawContent.substring(0, typeIndex);
        const lastNewline = beforeType.lastIndexOf("\n");
        if (lastNewline !== -1) {
           rawContent = rawContent.substring(0, lastNewline).trim();
        } else {
           rawContent = beforeType.trim();
        }
        rawContent = rawContent.replace(/👉\s*$/, "").trim();
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: rawContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (err) {
      console.error("InnoChat API Error:", err);
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I am having trouble connecting to InnoChat right now. Please check your connection or try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestedPrompt = (promptText: string) => {
    setInput(promptText);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 top-16 md:left-64 flex flex-col bg-background">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl"></div>
      </div>

      <div className="flex-1 flex flex-col m-4 md:m-6 backdrop-blur-xl bg-card/70 dark:bg-card/40 rounded-2xl border border-border/50 shadow-2xl relative overflow-hidden">
        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-white/30 dark:bg-transparent pointer-events-none"></div>

        {/* Header */}
        <div className="px-6 py-5 border-b border-border/50 backdrop-blur-sm flex items-center gap-3 relative z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mr-2 hover:bg-muted/40 dark:bg-muted/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {projectContext?.title ? `InnoChat - ${projectContext.title}` : "InnoChat"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {projectContext?.title ? "AI Assistant analyzing your draft" : "AI Assistant for Graduation Projects"}
            </p>
          </div>
        </div>

        {/* Draft Context Banner */}
        {projectContext?.title && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 px-6 py-3 flex items-start sm:items-center gap-3 relative z-10">
            <div className="mt-0.5 sm:mt-0 p-1.5 bg-amber-500/20 rounded-lg shrink-0">
              <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Draft Context Loaded
              </p>
              <p className="text-xs text-amber-700/80 dark:text-amber-400/80">
                The AI is currently analyzing your draft for <strong>"{projectContext.title}"</strong>
                {projectContext.originalityScore !== undefined ? ` (Originality: ${projectContext.originalityScore}%)` : ""}. Any advice will be tailored to your work.
              </p>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 relative z-10">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                    message.role === "assistant"
                      ? "bg-primary"
                      : "bg-gray-800"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <Bot className="w-5 h-5 text-white" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Message Content */}
                <div
                  className={`flex-1 ${message.role === "user" ? "flex justify-end" : ""}`}
                >
                  <div
                    className={`inline-block max-w-[85%] backdrop-blur-sm ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-md shadow-lg"
                        : "bg-card/80 dark:bg-card/60 text-foreground rounded-2xl rounded-tl-md border border-border/50 shadow-md"
                    } px-5 py-3.5`}
                  >
                    {message.role === "assistant" ? (
                      message.id === "1" ? (
                        <StaggeredTextFade text={message.content} />
                      ) : (
                        <MessageContent
                          content={message.content}
                          onOptionClick={(text) => {
                            setInput(text);
                            textareaRef.current?.focus();
                          }}
                        />
                      )
                    ) : (
                      <p className="text-[15px] whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-primary shadow-lg">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="bg-card/80 dark:bg-card/60 backdrop-blur-sm rounded-2xl rounded-tl-md px-5 py-3.5 border border-border/50 shadow-md">
                  <div className="flex gap-1.5">
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-primary/70 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Suggested Prompts (shown when no user messages yet) */}
            {messages.length === 1 && messages[0].role === "assistant" && !isTypingGreeting && (
              <div className="mt-8">
                <p className="text-sm font-medium text-muted-foreground mb-4 text-center animate-in fade-in duration-700">
                  Suggested prompts:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getSuggestedPrompts(projectContext?.title).map((prompt, index) => {
                    const Icon = prompt.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => handleSuggestedPrompt(prompt.text)}
                        className="backdrop-blur-sm bg-card/60 dark:bg-card/40 hover:bg-card/80 dark:bg-card/60 border border-border/50 rounded-xl p-4 text-left hover:shadow-lg transition-all animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both"
                        style={{ animationDelay: `${index * 120}ms` }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg ${prompt.bg} flex items-center justify-center`}
                          >
                            <Icon className={`w-4 h-4 ${prompt.color}`} />
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {prompt.text}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="px-6 py-5 border-t border-border/50 backdrop-blur-sm relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative min-w-0">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isTypingGreeting ? "Please wait while InnoChat initializes..." : "Ask me anything about your graduation project..."}
                  className="!h-[60px] overflow-y-auto resize-none py-[18px] pl-6 pr-32 backdrop-blur-sm bg-card/80 dark:bg-card/60 border-border/50 shadow-md"
                  style={{ fieldSizing: "fixed", height: "60px" } as any}
                  rows={1}
                  disabled={isTypingGreeting}
                />
                <div className="absolute bottom-3 right-3 text-xs text-muted-foreground bg-card/60 dark:bg-card/40 px-2 py-1 rounded">
                  Press Enter to send
                </div>
              </div>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isTyping || isTypingGreeting}
                className="bg-blue-600 hover:bg-blue-700 text-white h-[60px] px-6 shadow-lg"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              InnoChat can make mistakes. Please verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InnoChat() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading chat...</div>}>
      <InnoChatContent />
    </Suspense>
  );
}
