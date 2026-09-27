import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  MessageSquare,
  LogOut,
  X,
  Search,
  Crown,
  Zap,
  Loader2,
  UploadCloud,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface ChatItem {
  id: string;
  chatName: string;
}

interface SidebarProps {
  chats: ChatItem[];
  chatsLoading?: boolean;
  activeChatId: string | null;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onOpenPricing?: () => void;
  onOpenUpload?: () => void;
}

function formatChatName(rawName: string): string {
  if (!rawName) return "Untitled Chat";
  let name = rawName.trim();
  // If it's a file name with extension joined like filenamepdf -> filename.pdf
  if (/pdf$/i.test(name) && !/\.pdf$/i.test(name)) {
    name = name.slice(0, -3) + ".pdf";
  }
  // If it has underscores or hyphens, replace with space
  name = name.replace(/[_-]+/g, " ");
  // Capitalize first letter of words
  return name.replace(/\b\w/g, (c) => c.toUpperCase());
}

export const Sidebar: React.FC<SidebarProps> = ({
  chats,
  chatsLoading = false,
  activeChatId,
  isMobileOpen = false,
  onCloseMobile,
  onSelectChat,
  onNewChat,
  onOpenPricing,
  onOpenUpload,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const filteredChats = chats.filter((c) =>
    c.chatName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Real quota from user object
  const usedQueries = user?.queryRequest ?? 0;
  const totalQueries = user?.queryMax ?? 50;
  const quotaPct = Math.round((usedQueries / totalQueries) * 100);

  const content = (
    <aside className="flex flex-col h-full select-none w-64 bg-base border-r border-white/[0.08]">
      {/* ── Brand Header ── */}
      <div className="flex items-center justify-between px-4 h-14 shrink-0 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white bg-brand-600 shadow-sm shadow-brand-500/20">
            DT
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-slate-100 block leading-tight">
              DocTalker
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Document Workspace
            </span>
          </div>
        </div>

        {onCloseMobile && (
          <button onClick={onCloseMobile} className="toolbar-btn lg:hidden">
            <X size={16} />
          </button>
        )}
      </div>

      {/* ── Action Buttons ── */}
      <div className="p-3 shrink-0 flex items-center gap-2">
        <button
          onClick={() => {
            onNewChat();
            onCloseMobile?.();
          }}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm transition"
          id="btn-new-chat"
        >
          <Plus size={14} strokeWidth={2.5} />
          <span>New Chat</span>
        </button>

        {onOpenUpload && (
          <button
            onClick={() => {
              onOpenUpload();
              onCloseMobile?.();
            }}
            className="flex items-center justify-center p-2 rounded-xl bg-surface-1 hover:bg-surface-2 border border-white/10 text-slate-300 hover:text-white transition"
            title="Upload Document"
          >
            <UploadCloud size={15} />
          </button>
        )}
      </div>

      {/* ── Search ── */}
      <div className="px-3 pb-2 shrink-0">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-1/60 border border-white/[0.08] text-xs">
          <Search size={13} className="text-slate-400 shrink-0" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations…"
            className="w-full bg-transparent border-none outline-none text-xs text-slate-200 placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="px-4 pt-2 pb-1.5 shrink-0 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        <span>Recent Chats</span>
        <span className="text-slate-600">{filteredChats.length}</span>
      </div>

      {/* ── Chat List ── */}
      <nav className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
        {chatsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={18} className="animate-spin text-slate-500" />
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <MessageSquare size={22} className="mx-auto mb-2 text-slate-600" />
            <p className="text-xs text-slate-400">
              {searchQuery ? "No matching chats" : "No conversations yet"}
            </p>
            {!searchQuery && (
              <p className="text-[11px] mt-1 text-slate-500">
                Upload a document to get started
              </p>
            )}
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isActive = chat.id === activeChatId;
            return (
              <button
                key={chat.id}
                onClick={() => {
                  onSelectChat(chat.id);
                  onCloseMobile?.();
                }}
                className={`group flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl text-xs transition-all ${
                  isActive
                    ? "bg-surface-2/90 text-white font-medium border border-white/10 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive
                      ? "bg-brand-500/20 text-brand-300"
                      : "bg-surface-1 text-slate-400 group-hover:text-slate-300"
                  }`}
                >
                  <MessageSquare size={12} />
                </div>
                <span className="flex-1 truncate">
                  {formatChatName(chat.chatName)}
                </span>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
                )}
              </button>
            );
          })
        )}
      </nav>

      {/* ── Footer ── */}
      <div className="p-3 shrink-0 space-y-3 border-t border-white/[0.08] bg-base">
        {/* Quota Card */}
        <div className="rounded-xl p-3 space-y-2 bg-surface-1/60 border border-white/[0.08]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Daily Queries</span>
            <span className="font-semibold text-brand-300">
              {usedQueries} / {totalQueries}
            </span>
          </div>

          <div className="h-1.5 rounded-full overflow-hidden bg-surface-3">
            <div
              className="h-full rounded-full transition-all duration-500 bg-brand-500"
              style={{
                width: `${Math.min(quotaPct, 100)}%`,
                background:
                  quotaPct > 80
                    ? "var(--color-danger)"
                    : "var(--color-brand-500)",
              }}
            />
          </div>

          <button
            onClick={onOpenPricing}
            className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-surface-2/60 hover:bg-surface-2 transition"
          >
            <Zap size={11} className="text-amber-400" />
            <span>Upgrade to Pro</span>
          </button>
        </div>

        {/* User Profile Row */}
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-semibold text-xs text-brand-200 bg-brand-500/20 border border-brand-500/30">
            {user?.firstName?.[0]?.toUpperCase() ?? "U"}
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold truncate text-slate-200">
              {user
                ? `${user.firstName} ${user.lastName || ""}`.trim()
                : "DocTalker User"}
            </div>
            <div className="flex items-center gap-1">
              <Crown size={10} className="text-amber-400" />
              <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
                {user?.subscription === "free"
                  ? "Free Tier"
                  : (user?.subscription ?? "Free Tier")}
              </span>
            </div>
          </div>

          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition"
              title="Log out"
              id="btn-logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop persistent */}
      <div className="hidden lg:flex shrink-0 h-full">{content}</div>

      {/* Mobile slide-over drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-modal flex">
          <div
            className="fixed inset-0 animate-fade-in"
            style={{
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(4px)",
            }}
            onClick={onCloseMobile}
          />
          <div
            className="relative flex h-full animate-slide-in-left"
            style={{ boxShadow: "var(--shadow-xl)" }}
          >
            {content}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
