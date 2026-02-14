import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, User, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Write an email to the marketing team",
  "Summarize key points",
  "Create a follow-up checklist",
];

const AIAgentPage = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text?: string) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;
    const userMsg: Message = { role: "user", content: msg };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setLoading(true);

    try {
      const resp = await supabase.functions.invoke("ai-draft", {
        body: { messages: allMessages, type: "chat" },
      });
      if (resp.error) throw new Error(resp.error.message);
      const responseText =
        resp.data?.text || resp.data?.content || "I couldn't generate a response.";
      setMessages((prev) => [...prev, { role: "assistant", content: responseText }]);
    } catch (err: any) {
      toast({ title: "AI Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {!hasMessages ? (
          /* Empty state – centered like the reference */
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            {/* Sparkle icon with gradient background */}
            <div className="relative mb-6">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 via-violet-500 to-pink-400 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-8">
              Asking with AI Suggestions
            </h3>

            {/* Suggestions card */}
            <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-lg p-2 space-y-1">
              {SUGGESTIONS.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => send(suggestion)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                    i === 1
                      ? "bg-gradient-to-r from-blue-500/80 via-violet-500/80 to-pink-400/80 text-white font-medium shadow-md"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {suggestion}
                </button>
              ))}

              {/* Input bar inside the card */}
              <div className="relative mt-1">
                <Input
                  placeholder="Ask, write or search for anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  className="bg-muted/50 border-0 rounded-xl pr-12 h-12 text-sm placeholder:text-muted-foreground/60"
                />
                <Button
                  size="icon"
                  onClick={() => send()}
                  disabled={loading || !input.trim()}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-foreground text-background hover:bg-foreground/80"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Chat messages */
          <div className="space-y-4 pb-4 pt-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
              >
                {msg.role === "assistant" && (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 via-violet-500 to-pink-400 flex items-center justify-center shrink-0 shadow-sm">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-3 max-w-[80%] text-sm ${
                    msg.role === "user"
                      ? "bg-foreground text-background"
                      : "bg-card border border-border"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="h-8 w-8 rounded-full bg-foreground flex items-center justify-center shrink-0">
                    <User className="h-3.5 w-3.5 text-background" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 via-violet-500 to-pink-400 flex items-center justify-center shrink-0">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="rounded-2xl px-4 py-3 bg-card border border-border">
                  <div className="flex gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-pulse" />
                    <div
                      className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-pulse"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <div
                      className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-pulse"
                      style={{ animationDelay: "0.4s" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Bottom input bar – only shown when there are messages */}
      {hasMessages && (
        <div className="pt-4 border-t border-border">
          <div className="relative">
            <Input
              placeholder="Ask, write or search for anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              className="bg-muted/50 border border-border rounded-xl pr-12 h-12 text-sm"
            />
            <Button
              size="icon"
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-foreground text-background hover:bg-foreground/80"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAgentPage;
