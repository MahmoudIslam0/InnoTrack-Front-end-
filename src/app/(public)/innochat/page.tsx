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
import { useSearchParams } from "next/navigation";

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

const suggestedPrompts = [
  {
    icon: Lightbulb,
    text: "Help me improve my project idea",
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
  },
  {
    icon: FileText,
    text: "Suggest similar existing projects",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: TrendingUp,
    text: "How can I increase originality?",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
  {
    icon: Sparkles,
    text: "Review my problem statement",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
];

function InnoChatContent() {
  const searchParams = useSearchParams();

  const projectContextRaw = searchParams.get("context");
  const projectContext = projectContextRaw
    ? JSON.parse(projectContextRaw)
    : null;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: projectContext?.title
        ? `Hello! I'm InnoChat, your AI assistant for graduation projects. I can see you're working on "${projectContext.title}". How can I help you today? I can:\n\n• Provide feedback on your project idea\n• Suggest improvements to increase originality\n• Help refine your problem statement and objectives\n• Recommend relevant technologies\n• Check for similar existing projects\n\nWhat would you like to discuss?`
        : "Hello! I'm InnoChat, your AI assistant for graduation projects. I can help you brainstorm ideas, refine your proposal, check originality, and provide guidance throughout your project journey. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Context-aware responses based on project data
    if (
      projectContext?.title &&
      (lowerMessage.includes("project") || lowerMessage.includes("idea"))
    ) {
      return `Based on your project "${projectContext.title}" in the ${projectContext.category || "selected"} category, here are my thoughts:\n\n✓ Your project addresses an important need in this domain\n✓ The use of ${projectContext.technologies || "modern technologies"} is appropriate\n✓ Consider adding more specific metrics to measure success\n\nWould you like me to suggest ways to make your project more original or help you refine specific sections?`;
    }

    if (
      lowerMessage.includes("originality") ||
      lowerMessage.includes("original")
    ) {
      return `To increase your project's originality score:\n\n1. **Add Unique Features**: Look for gaps in existing solutions and fill them with innovative features\n2. **Novel Technology Combinations**: Try combining technologies in new ways\n3. **Specific Target Audience**: Focus on an underserved or niche user group\n4. **Measurable Innovation**: Define clear metrics that show improvement over existing solutions\n5. **Implementation Approach**: Use a unique methodology or framework\n\nWould you like me to analyze any specific aspect of your project?`;
    }

    if (
      lowerMessage.includes("problem") ||
      lowerMessage.includes("statement")
    ) {
      return `A strong problem statement should:\n\n✓ Clearly define the issue you're addressing\n✓ Explain why current solutions are inadequate\n✓ Show the impact of the problem with data/statistics\n✓ Identify who is affected by this problem\n✓ Be specific and measurable\n\n${projectContext?.problemStatement ? `Looking at your current problem statement, consider making it more specific by adding concrete examples or statistics.` : "Would you like help drafting your problem statement?"}`;
    }

    if (lowerMessage.includes("similar") || lowerMessage.includes("existing")) {
      return `I can help you find similar projects and differentiate yours. Here's what to focus on:\n\n1. **Search Strategy**: Look for projects in academic databases, GitHub, and research papers\n2. **Key Differences**: Document what makes your approach unique\n3. **Technology Stack**: Modern/different tech can increase originality\n4. **Scope & Scale**: Different target users or use cases\n5. **Innovation Points**: Novel algorithms, methods, or integrations\n\nWould you like specific suggestions for your project category?`;
    }

    if (lowerMessage.includes("improve") || lowerMessage.includes("better")) {
      return `Here are some ways to improve your project:\n\n��� **Scope Enhancement**: Add advanced features like analytics, AI integration, or real-time capabilities\n🎯 **User Experience**: Focus on intuitive design and accessibility\n🔧 **Technical Depth**: Implement complex algorithms or architectures\n📱 **Platform Expansion**: Consider web + mobile, or cross-platform solutions\n🔐 **Security & Privacy**: Add robust security features\n⚡ **Performance**: Optimize for speed and scalability\n\nWhich area would you like to focus on?`;
    }

    if (
      lowerMessage.includes("supervisor") ||
      lowerMessage.includes("professor")
    ) {
      return `When choosing a supervisor:\n\n1. **Match Expertise**: Look for professors specializing in your project domain\n2. **Review Their Work**: Check their recent publications and projects\n3. **Availability**: Ensure they have slots available\n4. **Communication Style**: Consider their mentoring approach\n5. **Project Alignment**: Their research interests should align with your goals\n\nIn your proposal, clearly explain why their expertise is valuable for your project. Would you like help drafting your supervisor proposal?`;
    }

    if (
      lowerMessage.includes("technologies") ||
      lowerMessage.includes("tech stack")
    ) {
      return `Choosing the right technologies:\n\n**Frontend**: React, Vue, Angular (web) | React Native, Flutter (mobile)\n**Backend**: Node.js, Python (Django/Flask), Java (Spring)\n**Database**: PostgreSQL, MongoDB, Firebase\n**AI/ML**: TensorFlow, PyTorch, scikit-learn\n**Cloud**: AWS, Google Cloud, Azure\n**DevOps**: Docker, Kubernetes, CI/CD pipelines\n\n${projectContext?.technologies ? `Your current stack (${projectContext.technologies}) is solid.` : ""} Consider adding technologies that differentiate your project or solve specific challenges. What's your project focus?`;
    }

    // Default responses
    const defaultResponses = [
      "That's a great question! Could you provide more details about which aspect of your project you'd like to focus on?",
      "I'd be happy to help with that. Let me know more about your specific needs or concerns.",
      "Interesting point! To give you the best advice, could you share more context about your project requirements?",
    ];

    return defaultResponses[
      Math.floor(Math.random() * defaultResponses.length)
    ];
  };

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

    // Simulate AI thinking time
    setTimeout(
      () => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: generateAIResponse(input),
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiResponse]);
        setIsTyping(false);
      },
      1000 + Math.random() * 1000,
    );
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
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-400/15 rounded-full blur-3xl"></div>
      </div>

      <div className="flex-1 flex flex-col m-4 md:m-6 backdrop-blur-xl bg-card/70 dark:bg-card/40 rounded-2xl border border-border/50 shadow-2xl relative overflow-hidden">
        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-white/30 dark:bg-transparent pointer-events-none"></div>

        {/* Header */}
        <div className="px-6 py-5 border-b border-border/50 backdrop-blur-sm flex items-center gap-3 relative z-10">
          <Button
            variant="ghost"
            size="sm"
            // onClick={() => router(-1)}
            className="mr-2 hover:bg-muted/40 dark:bg-muted/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
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
                      ? "bg-indigo-600"
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
                        ? "bg-indigo-600 text-primary-foreground rounded-2xl rounded-tr-md shadow-lg"
                        : "bg-card/80 dark:bg-card/60 text-foreground rounded-2xl rounded-tl-md border border-border/50 shadow-md"
                    } px-5 py-3.5`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-indigo-600 shadow-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-card/80 dark:bg-card/60 backdrop-blur-sm rounded-2xl rounded-tl-md px-5 py-3.5 border border-border/50 shadow-md">
                  <div className="flex gap-1.5">
                    <div
                      className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-purple-500/100 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Suggested Prompts (shown when no user messages yet) */}
            {messages.length === 1 && messages[0].role === "assistant" && (
              <div className="mt-8">
                <p className="text-sm font-medium text-muted-foreground mb-4 text-center">
                  Suggested prompts:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suggestedPrompts.map((prompt, index) => {
                    const Icon = prompt.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => handleSuggestedPrompt(prompt.text)}
                        className="backdrop-blur-sm bg-card/60 dark:bg-card/40 hover:bg-card/80 dark:bg-card/60 border border-border/50 rounded-xl p-4 text-left hover:shadow-lg transition-all"
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
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about your graduation project..."
                  className="min-h-15 max-h-50 resize-none pr-24 backdrop-blur-sm bg-card/80 dark:bg-card/60 border-border/50 shadow-md"
                  rows={1}
                />
                <div className="absolute bottom-3 right-3 text-xs text-muted-foreground bg-card/60 dark:bg-card/40 px-2 py-1 rounded">
                  Press Enter to send
                </div>
              </div>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="bg-indigo-600 hover:bg-indigo-700 text-white h-[60px] px-6 shadow-lg"
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
