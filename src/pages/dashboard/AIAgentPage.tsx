import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, User, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useSubscription } from "@/hooks/useSubscription";
import { useProfile } from "@/hooks/useProfile";
import UpgradeDialog from "@/components/UpgradeDialog";

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
  const { canUseFeature, permissions, currentPlan } = useSubscription();
  const { profile, updateProfile } = useProfile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check if AI access is allowed
  if (!canUseFeature("aiAgent")) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center px-4">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-6">
          <Bot className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">AI Agent</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-xs">
          Upgrade to Silver plan or higher to access the AI drafting assistant.
        </p>
        <Button onClick={() => setShowUpgrade(true)}>Upgrade Plan</Button>
        <UpgradeDialog open={showUpgrade} onOpenChange={setShowUpgrade} feature="AI Agent" requiredPlan="Silver" />
      </div>
    );
  }

  const checkAiLimit = (): boolean => {
    if (permissions.unlimitedAi) return true;
    if (!permissions.maxAiPromptsPerDay) return false;

    const today = new Date().toISOString().split("T")[0];
    const resetDate = profile?.ai_prompts_reset_date;

    // Reset if new day
    if (!resetDate || resetDate < today) {
      return true; // Will reset on use
    }

    return (profile?.ai_prompts_used_today || 0) < permissions.maxAiPromptsPerDay;
  };

  const recordAiUsage = async () => {
    if (permissions.unlimitedAi || !profile) return;

    const today = new Date().toISOString().split("T")[0];
    const resetDate = profile.ai_prompts_reset_date;

    if (!resetDate || resetDate < today) {
      // Reset counter for new day
      await updateProfile({
        ai_prompts_used_today: 1,
        ai_prompts_reset_date: today,
      });
    } else {
      await updateProfile({
        ai_prompts_used_today: (profile.ai_prompts_used_today || 0) + 1,
      });
    }
  };

  const send = async (text?: string) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;

    if (!checkAiLimit()) {
      toast({
        title: "Daily AI limit reached",
        description: `You've used all ${permissions.maxAiPromptsPerDay} AI prompts for today. Upgrade to Premium for unlimited AI.`,
        variant: "destructive",
      });
      return;
    }

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
      await recordAiUsage();
    } catch (err: any) {
      toast({ title: "AI Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const hasMessages = messages.length > 0;
  const remainingPrompts = permissions.unlimitedAi
    ? null
    : Math.max(0, (permissions.maxAiPromptsPerDay || 0) - (profile?.ai_prompts_used_today || 0));

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* AI limit indicator for non-unlimited plans */}
      {!permissions.unlimitedAi && (
        <div className="flex items-center justify-between px-1 py-2 text-xs text-muted-foreground border-b border-border mb-2">
          <span>AI Prompts Today: {profile?.ai_prompts_used_today || 0} / {permissions.maxAiPromptsPerDay}</span>
          {remainingPrompts !== null && remainingPrompts <= 1 && (
            <span className="text-amber-500 font-medium">
              {remainingPrompts === 0 ? "Limit reached" : "1 prompt left"}
            </span>
          )}
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {!hasMessages ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="relative mb-6">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 via-violet-500 to-pink-400 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-8">
              Asking with AI Suggestions
            </h3>
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
          <div className="space-y-4 pb-4 pt-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 via-violet-500 to-pink-400 flex items-center justify-center shrink-0 shadow-sm">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
                <div className={`rounded-2xl px-4 py-3 max-w-[80%] text-sm ${
                  msg.role === "user" ? "bg-foreground text-background" : "bg-card border border-border"
                }`}>
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-hr:my-4 prose-strong:text-foreground [&>*:first-child]:mt-0">
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
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-pulse" style={{ animationDelay: "0.2s" }} />
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-pulse" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

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
