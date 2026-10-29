
import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  CheckCheck,
  Receipt,
  Wallet,
  ShieldCheck,
  Trash2,
  RefreshCw,
  CircleAlert,
  LoaderCircle,
  ArrowUpRight,
} from "lucide-react";
import api from "../services/api";

const icons = {
  info: Bell,
  general: Bell,
  success: CheckCheck,
  warning: CircleAlert,
  transaction: Receipt,
  budget: Wallet,
  saving: Wallet,
  security: ShieldCheck,
  otp: ShieldCheck,
  system: Bell,
};

const formatDate = (date) => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadNotifications = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError("");

    try {
      const response = await api.get("/notifications");
      const data = response.data;

      setNotifications(
        Array.isArray(data.notifications) ? data.notifications : []
      );
    } catch (err) {
      setError(
        err.response?.status === 401
          ? "Your session has expired. Please log in again."
          : err.response?.data?.message ||
              "Unable to load notifications. Please try again."
      );
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();

    // Refresh periodically while the page is open.
    const intervalId = window.setInterval(() => {
      loadNotifications(false);
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [loadNotifications]);

  const unreadCount = notifications.filter(
    (item) => !item.isRead
  ).length;

  const visibleNotifications = notifications.filter((item) => {
    if (filter === "unread") return !item.isRead;
    return true;
  });

  const markRead = async (id) => {
    setBusyId(id);
    setError("");
    setMessage("");

    try {
      await api.patch(`/notifications/${id}/read`);

      setNotifications((items) =>
        items.map((item) =>
          item._id === id ? { ...item, isRead: true } : item
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to mark notification as read."
      );
    } finally {
      setBusyId(null);
    }
  };

  const markAllRead = async () => {
    if (unreadCount === 0 || markingAll) return;

    setMarkingAll(true);
    setError("");
    setMessage("");

    try {
      await api.patch("/notifications/read-all");

      setNotifications((items) =>
        items.map((item) => ({ ...item, isRead: true }))
      );

      setMessage("All notifications marked as read.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update notifications."
      );
    } finally {
      setMarkingAll(false);
    }
  };

  const deleteNotification = async (id) => {
    setBusyId(id);
    setError("");
    setMessage("");

    try {
      await api.delete(`/notifications/${id}`);

      setNotifications((items) =>
        items.filter((item) => item._id !== id)
      );

      setMessage("Notification deleted.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to delete notification."
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
                <Bell size={24} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  Notifications
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  {unreadCount} unread notification
                  {unreadCount === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Stay informed about your account, transactions and budgets.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => loadNotifications()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              <RefreshCw size={17} />
              Refresh
            </button>

            <button
              onClick={markAllRead}
              disabled={unreadCount === 0 || markingAll}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCheck size={18} />
              {markingAll ? "Updating..." : "Mark all read"}
            </button>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
            {error.toLowerCase().includes("log in") && (
              <a href="/login" className="ml-2 font-semibold underline">
                Log in
              </a>
            )}
          </div>
        )}

        {message && (
          <p
            role="status"
            className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700"
          >
            {message}
          </p>
        )}

        <div className="mt-8 flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setFilter("all")}
            className={`border-b-2 px-4 py-3 text-sm font-semibold ${
              filter === "all"
                ? "border-blue-700 text-blue-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            All ({notifications.length})
          </button>

          <button
            onClick={() => setFilter("unread")}
            className={`border-b-2 px-4 py-3 text-sm font-semibold ${
              filter === "unread"
                ? "border-blue-700 text-blue-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        <section className="mt-5 space-y-3" aria-live="polite">
          {loading ? (
            <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
              <LoaderCircle className="animate-spin text-blue-700" size={32} />
              <p className="mt-3 text-sm text-slate-500">
                Loading notifications...
              </p>
            </div>
          ) : visibleNotifications.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
              <Bell className="mx-auto text-slate-300" size={40} />
              <h2 className="mt-4 font-semibold text-slate-800">
                {filter === "unread"
                  ? "You're all caught up"
                  : "No notifications yet"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {filter === "unread"
                  ? "You have no unread notifications."
                  : "Budget alerts and account updates will appear here when generated."}
              </p>
            </div>
          ) : (
            visibleNotifications.map((item) => {
              const Icon = icons[item.type] || Bell;
              const id = item._id;
              const isBusy = busyId === id;

              return (
                <article
                  key={id}
                  className={`flex gap-3 rounded-2xl border p-4 transition sm:gap-4 sm:p-5 ${
                    item.isRead
                      ? "border-slate-200 bg-white"
                      : "border-blue-200 bg-blue-50/60"
                  }`}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                    <Icon size={21} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-slate-900">
                        {item.title}
                      </h2>

                      {!item.isRead && (
                        <span
                          className="h-2 w-2 rounded-full bg-blue-600"
                          aria-label="Unread"
                        />
                      )}
                    </div>

                    <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-600">
                      {item.message}
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                      {formatDate(item.createdAt)}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-4">
                      {!item.isRead && (
                        <button
                          onClick={() => markRead(id)}
                          disabled={isBusy}
                          className="text-xs font-semibold text-blue-700 hover:underline disabled:opacity-50"
                        >
                          Mark as read
                        </button>
                      )}

                      {item.link && (
                        <a
                          href={item.link}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
                        >
                          View details <ArrowUpRight size={13} />
                        </a>
                      )}

                      <button
                        onClick={() => deleteNotification(id)}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-red-600 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                        {isBusy ? "Please wait..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}
