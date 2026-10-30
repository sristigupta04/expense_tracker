
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
  CircleCheck,
  Inbox,
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
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Fetch notifications
  const loadNotifications = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError("");

    try {
      const response = await api.get("/notifications");

      const data = response.data;

      const records = Array.isArray(data)
        ? data
        : Array.isArray(data?.notifications)
          ? data.notifications
          : Array.isArray(data?.data?.notifications)
            ? data.data.notifications
            : [];

      setNotifications(records);
    } catch (err) {
      setError(
        err.response?.status === 401
          ? "Your session has expired. Please log in again."
          : err.response?.data?.message ||
              "Unable to load notifications. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch and automatic refresh
  useEffect(() => {
    loadNotifications();

    const intervalId = window.setInterval(() => {
      loadNotifications(false);
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [loadNotifications]);

  // Notification counts
  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  const readCount = notifications.length - unreadCount;

  // Filter notifications
  const visibleNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((item) => !item.isRead);
    }

    if (filter === "read") {
      return notifications.filter((item) => item.isRead);
    }

    return notifications;
  }, [notifications, filter]);

  // Mark one notification as read
  const markRead = async (id) => {
    if (!id || busyId || markingAll) return;

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

      setMessage("Notification marked as read.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to mark notification as read."
      );
    } finally {
      setBusyId(null);
    }
  };

  // Mark all notifications as read
  const markAllRead = async () => {
    if (unreadCount === 0 || markingAll || busyId) return;

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
        err.response?.data?.message ||
          "Unable to update notifications."
      );
    } finally {
      setMarkingAll(false);
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    if (!id || busyId || markingAll) return;

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
        err.response?.data?.message ||
          "Unable to delete notification."
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-800">
                <Bell size={24} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Notifications
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  {unreadCount} unread notification
                  {unreadCount === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            <p className="mt-3 text-sm text-slate-500">
              Stay informed about your account, transactions and budgets.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => loadNotifications()}
              disabled={loading || refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={markAllRead}
              disabled={unreadCount === 0 || markingAll || busyId !== null}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {markingAll ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <CheckCheck size={18} />
              )}

              {markingAll ? "Updating..." : "Mark all read"}
            </button>
          </div>
        </header>

        {/* Summary Cards */}
        <section className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={Inbox}
            label="Total notifications"
            value={notifications.length}
          />

          <SummaryCard
            icon={Bell}
            label="Unread"
            value={unreadCount}
            accent="blue"
          />

          <SummaryCard
            icon={CircleCheck}
            label="Read"
            value={readCount}
            accent="green"
          />
        </section>

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <CircleAlert size={19} className="mt-0.5 shrink-0" />

            <div>
              <p>{error}</p>

              {error.toLowerCase().includes("log in") && (
                <Link
                  to="/login"
                  className="mt-1 inline-block font-semibold underline"
                >
                  Log in again
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div
            role="status"
            className="mt-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-700"
          >
            <CircleCheck size={17} />
            {message}
          </div>
        )}

        {/* Filters */}
        <section className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-bold text-slate-900">
              Recent Activity
            </h2>

            <p className="text-xs text-slate-400">
              Auto-refreshes every 30 seconds
            </p>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto border-b border-slate-200">
            {[
              { id: "all", label: "All", count: notifications.length },
              { id: "unread", label: "Unread", count: unreadCount },
              { id: "read", label: "Read", count: readCount },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                aria-pressed={filter === tab.id}
                className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                  filter === tab.id
                    ? "border-blue-800 text-blue-800"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </section>

        {/* Notification List */}
        <section
          className="mt-5 space-y-3"
          aria-live="polite"
          aria-busy={loading}
        >
          {loading ? (
            <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
              <LoaderCircle
                className="animate-spin text-blue-800"
                size={34}
              />

              <p className="mt-3 text-sm font-medium text-slate-500">
                Loading notifications...
              </p>
            </div>
          ) : visibleNotifications.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Bell size={30} />
              </div>

              <h2 className="mt-4 font-semibold text-slate-800">
                {filter === "unread"
                  ? "You're all caught up!"
                  : filter === "read"
                    ? "No read notifications"
                    : "No notifications yet"}
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                {filter === "unread"
                  ? "You have no unread notifications."
                  : filter === "read"
                    ? "Notifications you have read will appear here."
                    : "Budget alerts and account updates will appear here when generated."}
              </p>
            </div>
          ) : (
            visibleNotifications.map((item) => {
              const Icon = icons[item.type?.toLowerCase()] || Bell;
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
                  {/* Icon */}
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm ${
                      item.isRead
                        ? "bg-slate-50 text-slate-500"
                        : "bg-white text-blue-800"
                    }`}
                  >
                    <Icon size={21} />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="break-words font-semibold text-slate-900">
                        {item.title || "Notification"}
                      </h3>

                      {!item.isRead && (
                        <span
                          className="h-2 w-2 rounded-full bg-blue-600"
                          aria-label="Unread"
                          title="Unread"
                        />
                      )}
                    </div>

                    <p className="mt-1 whitespace-pre-line break-words text-sm leading-6 text-slate-600">
                      {item.message || "No additional details available."}
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                      {formatDate(item.createdAt)}
                    </p>

                    {/* Actions */}
                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-3">
                      {!item.isRead && (
                        <button
                          type="button"
                          onClick={() => markRead(id)}
                          disabled={isBusy || markingAll || busyId !== null}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-800 transition hover:text-blue-950 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isBusy ? (
                            <LoaderCircle
                              size={13}
                              className="animate-spin"
                            />
                          ) : (
                            <CheckCheck size={14} />
                          )}

                          Mark as read
                        </button>
                      )}

                      {item.link && (
                        <Link
                          to={item.link}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-800 transition hover:text-blue-950 hover:underline"
                        >
                          View details
                          <ArrowUpRight size={13} />
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() => deleteNotification(id)}
                        disabled={isBusy || markingAll || busyId !== null}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                        Delete
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

/* Summary Card */
function SummaryCard({ icon: Icon, label, value, accent = "slate" }) {
  const styles = {
    slate: "bg-slate-100 text-slate-700",
    blue: "bg-blue-100 text-blue-800",
    green: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles[accent]}`}
        >
          <Icon size={20} />
        </div>
      </div>

      <p className="mt-3 text-2xl font-bold tabular-nums text-slate-900">
        {value}
      </p>
    </div>
  );
}
