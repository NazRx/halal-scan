import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, CheckCheck, ExternalLink, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useNotifications, type Notification } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";

function NotificationItem({
  n,
  onRead,
}: {
  n: Notification;
  onRead: (id: string, link: string | null) => void;
}) {
  return (
    <button
      onClick={() => onRead(n.id, n.link)}
      className={cn(
        "w-full text-left px-4 py-3 border-b border-border/50 last:border-0 transition-colors",
        "hover:bg-muted/40",
        !n.is_read && "bg-primary/5"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-1 w-2 h-2 rounded-full shrink-0",
            n.is_read ? "bg-transparent" : "bg-primary"
          )}
        />
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm", !n.is_read ? "font-semibold text-foreground" : "font-medium text-foreground/80")}>
            {n.title}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{n.message}</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-muted-foreground/70">
              {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
            </p>
            {n.link && (
              <span className="text-xs text-primary flex items-center gap-0.5">
                <ExternalLink className="h-2.5 w-2.5" />
                View
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

export function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead, loading } = useNotifications();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleRead = async (id: string, link: string | null) => {
    await markRead(id);
    if (link) {
      setOpen(false);
      navigate(link);
    }
  };

  const filtered = filter === "unread"
    ? notifications.filter((n) => !n.is_read)
    : notifications;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-xl hover:bg-muted/50 transition-colors focus:outline-none" aria-label="Notifications">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 p-0 rounded-2xl shadow-xl border border-border/50"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs px-2 rounded-lg"
                onClick={() => markAllRead()}
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex border-b border-border/50">
          {(["all", "unread"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "flex-1 py-2 text-xs font-medium capitalize transition-colors",
                filter === f
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center">
              <Inbox className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                {filter === "unread" ? "No unread notifications." : "No notifications yet."}
              </p>
            </div>
          ) : (
            filtered.map((n) => (
              <NotificationItem key={n.id} n={n} onRead={handleRead} />
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-4 py-2 border-t border-border/50">
            <button
              onClick={() => { setOpen(false); navigate("/my-requests"); }}
              className="text-xs text-primary hover:underline"
            >
              View my requests →
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
