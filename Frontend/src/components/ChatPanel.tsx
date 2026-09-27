import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  Send,
  Sparkles,
  ChevronDown,
  FileText,
  Globe,
  Video,
  Loader2,
  Copy,
  Check,
  Paperclip,
  Bot,
  User,
  UploadCloud,
} from "lucide-react";
import { chatApi, type ChatMessage } from "../api/chatApi";

interface ChatPanelProps {
  chatId?: string | null;
  onOpenUploadModal: (
    tab: "file" | "folder" | "web" | "youtube" | "ocr",
  ) => void;
  onJumpToPage: (page: number) => void;
  className?: string;
}

const MODEL_OPTIONS = [
  { id: "openai", label: "OpenAI GPT-4o", badge: "Fast" },
  { id: "gemini-text", label: "Gemini 3.5 Flash", badge: "Multimodal" },
];

interface MessageBubbleProps {
  msg: ChatMessage;
  onCitationClick: (page: number) => void;
}

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(
      /`([^`]+)`/g,
      "<code class='bg-surface-3/80 text-brand-300 px-1.5 py-0.5 rounded text-xs font-mono'>$1</code>",
    )
    .replace(/\n\n/g, "</p><p class='mt-2.5'>")
    .replace(/\n\* /g, "</p><ul class='list-disc pl-5 my-2 space-y-1'><li>")
    .replace(/\n- /g, "</p><ul class='list-disc pl-5 my-2 space-y-1'><li>")
    .replace(/\n/g, "<br/>");
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  msg,
  onCitationClick,
}) => {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";
  const isError =
    !isUser &&
    (msg.content.toLowerCase().includes("fetch failed") ||
      msg.content.toLowerCase().includes("could not be generated"));

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex gap-3 group ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Sender Avatar */}
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-semibold ${
          isUser
            ? "bg-surface-2 border border-white/10 text-slate-300"
            : "bg-brand-500/10 border border-brand-400/20 text-brand-300"
        }`}
      >
        {isUser ? <User size={13} /> : <Bot size={13} />}
      </div>

      {/* Bubble Content */}
      <div
        className={`flex flex-col gap-1.5 max-w-[85%] ${isUser ? "items-end" : "items-start"}`}
      >
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-slate-400">
            {isUser ? "You" : "DocTalker AI"}
          </span>
          {msg.model && !isUser && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-2/80 text-slate-400 border border-white/5">
              {msg.model === "openai" ? "GPT-4o" : "Gemini"}
            </span>
          )}
        </div>

        {/* Text Container */}
        <div
          className={`text-sm leading-relaxed rounded-2xl ${
            isUser
              ? "bg-surface-2/90 border border-white/10 text-slate-100 px-4 py-3 rounded-tr-xs shadow-sm"
              : isError
                ? "bg-red-950/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-tl-xs"
                : "bg-surface-0/90 border border-white/[0.08] text-slate-200 px-4 py-3.5 rounded-tl-xs shadow-sm"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{msg.content}</p>
          ) : isError ? (
            <div className="space-y-1.5">
              <p className="font-semibold text-xs text-red-400 flex items-center gap-1.5">
                <span>Query failed</span>
              </p>
              <p className="text-xs text-red-300/80">{msg.content}</p>
            </div>
          ) : (
            <div
              className="prose prose-invert prose-sm max-w-none text-slate-200 [&>p]:leading-relaxed [&>strong]:text-white [&>strong]:font-semibold"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
            />
          )}
        </div>

        {/* Citations */}
        {msg.citations && msg.citations.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Sources:
            </span>
            {msg.citations.map((c, i) => (
              <button
                key={i}
                onClick={() => onCitationClick(c.page ?? 1)}
                className="citation-chip inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition"
                title={c.snippet}
              >
                <FileText size={10} />
                <span>Page {c.page}</span>
              </button>
            ))}
          </div>
        )}

        {/* Copy button */}
        {!isUser && !isError && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pt-0.5"
          >
            {copied ? (
              <>
                <Check size={11} className="text-emerald-400" /> Copied
              </>
            ) : (
              <>
                <Copy size={11} /> Copy
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export const ChatPanel: React.FC<ChatPanelProps> = ({
  chatId,
  onOpenUploadModal,
  onJumpToPage,
  className = "",
}) => {
  const [chatMessages, setChatMessages] = useState<{
    chatId: string | null;
    items: ChatMessage[];
  }>({ chatId: null, items: [] });
  const messages = useMemo(
    () => (chatMessages.chatId === chatId ? chatMessages.items : []),
    [chatMessages, chatId],
  );
  const loadingHistory = Boolean(chatId && chatMessages.chatId !== chatId);
  const setMessages = useCallback(
    (update: ChatMessage[] | ((current: ChatMessage[]) => ChatMessage[])) => {
      setChatMessages((current) => ({
        chatId: chatId ?? null,
        items:
          typeof update === "function"
            ? update(current.chatId === (chatId ?? null) ? current.items : [])
            : update,
      }));
    },
    [chatId],
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("openai");
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load chat messages when active chatId changes
  useEffect(() => {
    if (!chatId) {
      return;
    }

    let isCurrent = true;
    chatApi
      .getChat(chatId)
      .then((res) => {
        if (!isCurrent) return;
        if (res.chat && res.chat.messages) {
          const formatted: ChatMessage[] = res.chat.messages.map((m: any) => ({
            role: m.role,
            content: m.content,
            model: m.model,
            createdAt: m.createdAt,
            citations: m.citations,
          }));
          setMessages(formatted);
        } else {
          setMessages([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load chat history:", err);
        if (isCurrent) setMessages([]);
      });

    return () => {
      isCurrent = false;
    };
  }, [chatId, setMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendPrompt = (promptText: string) => {
    setInput(promptText);
    inputRef.current?.focus();
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    if (!chatId) {
      onOpenUploadModal("file");
      return;
    }

    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await chatApi.streamQuery(
        chatId,
        text,
        selectedModel as "openai" | "gemini-text",
      );

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      if (!reader) throw new Error("No stream reader available");

      const botMessageId = `assistant-${Date.now()}`;
      let buffer = "";

      // Add a placeholder message for the assistant with unique ID
      setMessages((prev) => [
        ...prev,
        {
          _id: botMessageId,
          role: "assistant",
          model: selectedModel as ChatMessage["model"],
          content: "",
          citations: [],
        },
      ]);

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";

          for (const part of parts) {
            if (part.startsWith("event: metadata")) {
              const dataLine = part
                .split("\n")
                .find((l) => l.startsWith("data: "));
              if (dataLine) {
                try {
                  const data = JSON.parse(dataLine.replace("data: ", ""));
                  if (data.topChunks) {
                    const citations = data.topChunks.map(
                      (c: any, idx: number) => ({
                        documentId: `doc-${idx}`,
                        page: c.pageNumber || 1,
                        snippet: c.rawText,
                      }),
                    );
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg._id === botMessageId ? { ...msg, citations } : msg,
                      ),
                    );
                  }
                } catch {
                  // ignore JSON parse error
                }
              }
            } else if (part.startsWith("event: end")) {
              done = true;
            } else if (part.startsWith("data: ")) {
              const dataStr = part.replace("data: ", "");
              if (dataStr === "[DONE]") {
                done = true;
                continue;
              }
              try {
                const data = JSON.parse(dataStr);
                if (data.chunk) {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg._id === botMessageId
                        ? { ...msg, content: msg.content + data.chunk }
                        : msg,
                    ),
                  );
                }
              } catch {
                // Ignore parse errors on partial chunks
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          model: selectedModel as ChatMessage["model"],
          content:
            err instanceof Error
              ? err.message
              : "The response could not be generated. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const activeModel =
    MODEL_OPTIONS.find((m) => m.id === selectedModel) || MODEL_OPTIONS[0];

  return (
    <div
      className={`flex flex-col h-full select-none bg-surface-0 border-l border-white/[0.08] ${className}`}
    >
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-4 h-14 shrink-0 border-b border-white/[0.08] bg-surface-0/90 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold tracking-tight text-slate-200">
            Assistant Studio
          </span>
        </div>

        {/* Model Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowModelMenu((v) => !v)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-surface-1 border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-all"
            id="btn-model-selector"
          >
            <span>{activeModel.label}</span>
            <ChevronDown
              size={12}
              className={`transition-transform duration-200 text-slate-400 ${showModelMenu ? "rotate-180" : ""}`}
            />
          </button>

          {showModelMenu && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowModelMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1.5 z-40 w-52 rounded-xl bg-surface-1 border border-white/15 p-1 shadow-2xl backdrop-blur-lg">
                {MODEL_OPTIONS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedModel(m.id);
                      setShowModelMenu(false);
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs transition-colors ${
                      m.id === selectedModel
                        ? "bg-brand-500/15 text-brand-200 font-semibold"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span>{m.label}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-slate-400">
                      {m.badge}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Message Feed ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        {chatId && loadingHistory ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
            <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
            <p className="text-xs text-slate-400">
              Loading conversation history…
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8 max-w-sm mx-auto">
            <div className="w-11 h-11 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mb-4 shadow-sm">
              <Sparkles size={20} />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">
              {chatId ? "Explore this document" : "No document active"}
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {chatId
                ? "Ask natural questions. DocTalker cites exact pages and retrieves context using hybrid vector embeddings."
                : "Upload a PDF, link a website or YouTube video, or import notes to begin."}
            </p>

            {chatId ? (
              <div className="w-full mt-6 space-y-2 text-left">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Quick Prompts
                </span>
                {[
                  "Summarize the key points of this document",
                  "What are the main actionable takeaways?",
                  "Extract any metrics, tables, and important dates",
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendPrompt(prompt)}
                    className="w-full text-left p-3 rounded-xl text-xs bg-surface-1/60 hover:bg-surface-1 border border-white/[0.08] hover:border-brand-500/40 text-slate-300 hover:text-white transition-all flex items-center justify-between group"
                  >
                    <span>{prompt}</span>
                    <Send
                      size={12}
                      className="opacity-0 group-hover:opacity-100 text-brand-400 transition-opacity shrink-0 ml-2"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <button
                onClick={() => onOpenUploadModal("file")}
                className="mt-6 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/20 transition-all"
              >
                <UploadCloud size={14} />
                <span>Upload Document</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto">
            {messages.map((msg, i) => (
              <div key={i} className="animate-slide-up">
                <MessageBubble msg={msg} onCitationClick={onJumpToPage} />
              </div>
            ))}

            {/* Streaming / thinking indicator */}
            {loading && (
              <div className="flex items-center gap-3 animate-fade-in pl-1">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-brand-500/10 border border-brand-400/20 text-brand-300">
                  <Bot size={13} />
                </div>
                <div className="rounded-2xl rounded-tl-xs px-4 py-3 bg-surface-0 border border-white/[0.08] flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse [animation-delay:200ms]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse [animation-delay:400ms]" />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Input Area ── */}
      <div className="p-4 shrink-0 border-t border-white/[0.08] bg-surface-0/60 backdrop-blur-sm">
        <div className="relative rounded-2xl border border-white/10 bg-surface-1/80 shadow-lg focus-within:border-brand-500/60 focus-within:ring-1 focus-within:ring-brand-500/20 transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder={
              chatId
                ? "Ask anything about this document… (Enter to send, Shift+Enter for newline)"
                : "Upload or select a document to start asking questions…"
            }
            className="w-full bg-transparent resize-none border-none outline-none px-4 pt-3.5 pb-2 text-xs leading-relaxed text-slate-100 placeholder:text-slate-500"
            style={{ maxHeight: "140px", minHeight: "52px" }}
          />

          {/* Action Toolbar Inside Box */}
          <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
            {/* Attachment popover toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAttachMenu((v) => !v)}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 transition"
                title="Add sources to workspace"
              >
                <Paperclip size={13} />
                <span className="text-[11px]">Attach Source</span>
              </button>

              {showAttachMenu && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowAttachMenu(false)}
                  />
                  <div className="absolute left-0 bottom-full mb-2 z-40 w-48 rounded-xl bg-surface-1 border border-white/15 p-1.5 shadow-2xl backdrop-blur-lg">
                    <button
                      onClick={() => {
                        setShowAttachMenu(false);
                        onOpenUploadModal("file");
                      }}
                      className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-xs text-slate-300 hover:bg-white/5 hover:text-white transition"
                    >
                      <FileText size={13} className="text-brand-400" />
                      <span>Upload PDF</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowAttachMenu(false);
                        onOpenUploadModal("folder");
                      }}
                      className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-xs text-slate-300 hover:bg-white/5 hover:text-white transition"
                    >
                      <FileText size={13} className="text-amber-400" />
                      <span>Folder Chat (Multi-PDF)</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowAttachMenu(false);
                        onOpenUploadModal("web");
                      }}
                      className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-xs text-slate-300 hover:bg-white/5 hover:text-white transition"
                    >
                      <Globe size={13} className="text-emerald-400" />
                      <span>Scrape Web URL</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowAttachMenu(false);
                        onOpenUploadModal("youtube");
                      }}
                      className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-xs text-slate-300 hover:bg-white/5 hover:text-white transition"
                    >
                      <Video size={13} className="text-rose-400" />
                      <span>YouTube Transcript</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Model indicator & Send Button */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                {activeModel.label}
              </span>
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="flex items-center justify-center h-7 w-7 rounded-lg bg-brand-600 hover:bg-brand-500 text-white disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition"
                id="btn-send-message"
                title="Send query"
              >
                {loading ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Send size={12} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
