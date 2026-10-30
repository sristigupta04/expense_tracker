
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  MessageCircle,
  Headphones,
  Send,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  ChevronDown,
  Trash2,
} from "lucide-react";

const STORAGE_KEY = "expenseTrackerContactRequests";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-50";

function readRequests() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export default function ContactSupport() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    category: "General question",
    message: "",
  });

  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [requests, setRequests] = useState(readRequests);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setStatus(null);

    const cleanForm = {
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      category: form.category,
      message: form.message.trim(),
    };

    if (
      !cleanForm.name ||
      !cleanForm.email ||
      !cleanForm.subject ||
      cleanForm.message.length < 10
    ) {
      setStatus({
        type: "error",
        text: "Please complete all required fields. Message must contain at least 10 characters.",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanForm.email)) {
      setStatus({
        type: "error",
        text: "Please enter a valid email address.",
      });
      return;
    }

    if (cleanForm.name.length > 100 || cleanForm.subject.length > 120) {
      setStatus({
        type: "error",
        text: "Please check the name and subject length.",
      });
      return;
    }

    if (cleanForm.message.length > 3000) {
      setStatus({
        type: "error",
        text: "Message cannot exceed 3000 characters.",
      });
      return;
    }

    setSaving(true);

    try {
      const existing = readRequests();

      const request = {
        ...cleanForm,
        id: `contact-${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: "pending",
      };

      const updated = [request, ...existing];

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      setRequests(updated);

      setStatus({
        type: "success",
        text: "Your message has been saved in this browser. It has not been sent to a support team.",
      });

      setForm({
        name: "",
        email: "",
        subject: "",
        category: "General question",
        message: "",
      });
    } catch {
      setStatus({
        type: "error",
        text: "Unable to save your message. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  }

  function deleteRequest(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this contact request?"
    );

    if (!confirmed) return;

    try {
      const updated = requests.filter((request) => request.id !== id);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setRequests(updated);

      setStatus({
        type: "success",
        text: "Contact request deleted successfully.",
      });
    } catch {
      setStatus({
        type: "error",
        text: "Unable to delete this request.",
      });
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => navigate("/settings/help")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-800"
        >
          <ArrowLeft size={18} />
          Back to Help & Support
        </button>

        {/* Header */}
        <header className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-800">
            <MessageCircle size={15} />
            Contact us
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Get in touch
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Have a question or facing an issue with your Expense Tracker?
            Tell us what happened.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.5fr]">
          {/* Sidebar */}
          <aside className="space-y-4">
            <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#03045E] to-[#2563EB] p-6 text-white">
              <div className="mb-5 inline-flex rounded-xl bg-white/15 p-3">
                <Headphones size={27} />
              </div>

              <h2 className="text-xl font-bold">We're here to help</h2>

              <p className="mt-2 text-sm leading-6 text-blue-100">
                Share your question, report a problem or suggest a feature
                that would improve your experience.
              </p>

              <button
                type="button"
                onClick={() => navigate("/settings/help")}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-900 transition hover:bg-blue-50"
              >
                <HelpCircle size={17} />
                Visit Help Centre
              </button>
            </section>

            <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-blue-50 p-3 text-blue-800">
                  <Mail size={20} />
                </div>

                <div>
                  <h3 className="font-semibold">Email support</h3>
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Submit your query using the contact form.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-800">
                  <Clock size={20} />
                </div>

                <div>
                  <h3 className="font-semibold">Response time</h3>
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Response times depend on the support service configured
                    for this application.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-sky-50 p-3 text-sky-800">
                  <ShieldCheck size={20} />
                </div>

                <div>
                  <h3 className="font-semibold">Protect your information</h3>
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Never include your password, PIN, card number or sensitive
                    financial information in a support message.
                  </p>
                </div>
              </div>
            </section>
          </aside>

          {/* Contact form */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold">Send us a message</h2>

              <p className="mt-1 text-sm text-slate-500">
                Fields marked with * are required.
              </p>
            </div>

            {status && (
              <div
                role="status"
                aria-live="polite"
                className={`mb-5 flex items-start gap-2.5 rounded-xl border p-4 text-sm ${
                  status.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                {status.type === "success" ? (
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                )}

                <span>{status.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Full name *
                  </label>

                  <input
                    id="contact-name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    autoComplete="name"
                    placeholder="Enter your name"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email address *
                  </label>

                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    maxLength={254}
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-category"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  What do you need help with? *
                </label>

                <select
                  id="contact-category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option>General question</option>
                  <option>Account issue</option>
                  <option>Transaction issue</option>
                  <option>Budget issue</option>
                  <option>Technical problem</option>
                  <option>Feature request</option>
                  <option>Bug report</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Subject *
                </label>

                <input
                  id="contact-subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  maxLength={120}
                  placeholder="Briefly describe your issue"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Message *
                </label>

                <textarea
                  id="contact-message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  minLength={10}
                  maxLength={3000}
                  rows={6}
                  placeholder="Describe your question or issue in detail..."
                  className={`${inputClass} resize-y leading-6`}
                />

                <p className="mt-1 text-right text-xs text-slate-400">
                  {form.message.length}/3000 characters
                </p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0D21A1] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#03045E] focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <Send size={17} />
                {saving ? "Saving..." : "Submit message"}
              </button>

              <p className="text-xs leading-5 text-slate-400">
                Current demo version: messages are saved in this browser only.
                To send them to a real support team, connect a backend API.
              </p>
            </form>
          </section>
        </div>

        {/* Saved contact requests */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setShowRequests((current) => !current)}
            aria-expanded={showRequests}
            className="flex w-full items-center justify-between gap-3 p-5 text-left sm:p-6"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-800">
                <FileText size={21} />
              </div>

              <div>
                <h2 className="font-bold text-slate-800">
                  My contact requests
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {requests.length} request(s) saved in this browser
                </p>
              </div>
            </div>

            <ChevronDown
              size={20}
              className={`shrink-0 text-slate-500 transition-transform ${
                showRequests ? "rotate-180" : ""
              }`}
            />
          </button>

          {showRequests && (
            <div className="border-t border-slate-100 p-5 sm:p-6">
              {requests.length === 0 ? (
                <p className="py-5 text-center text-sm text-slate-500">
                  No contact requests found.
                </p>
              ) : (
                <div className="space-y-3">
                  {requests.map((request) => (
                    <div
                      key={request.id}
                      className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div className="min-w-0">
                        <h3 className="break-words font-semibold text-slate-800">
                          {request.subject}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          {request.category} ·{" "}
                          {request.createdAt
                            ? new Date(request.createdAt).toLocaleString()
                            : "Date unavailable"}
                        </p>

                        <p className="mt-2 break-words text-sm text-slate-600">
                          {request.message}
                        </p>

                        <span className="mt-3 inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                          Saved locally · Pending
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteRequest(request.id)}
                        aria-label="Delete contact request"
                        className="inline-flex shrink-0 items-center gap-1.5 self-start text-xs font-semibold text-red-600 hover:underline"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
