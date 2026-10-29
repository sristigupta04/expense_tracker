
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  HelpCircle,
  Search,
  MessageCircle,
  Mail,
  Bug,
  BookOpen,
  ChevronDown,
  Send,
  CircleHelp,
  Wallet,
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

const faqs = [
  {
    question: "How do I add a new transaction?",
    answer:
      "Open Transactions, select Add Transaction, enter the amount, category, date and transaction type, then save. Your transaction should appear in the transactions list.",
  },
  {
    question: "How can I create a budget?",
    answer:
      "Open Budgets, create a budget for a category, set your spending limit and select the period. Your budget progress depends on the transactions recorded in your account.",
  },
  {
    question: "Why is my dashboard balance incorrect?",
    answer:
      "Check that your income and expense transactions are recorded correctly, including their amounts and types. Refresh the dashboard and confirm that your transactions have been saved.",
  },
  {
    question: "How do I change my account details?",
    answer:
      "Open Settings and select Profile to edit the details supported by your account. Some changes may require a backend profile-update endpoint.",
  },
  {
    question: "How do I manage notifications?",
    answer:
      "Go to Settings → Notifications to change your notification preferences. Browser notifications also require permission from your browser.",
  },
  {
    question: "Is my financial data secure?",
    answer:
      "Use a strong password and sign out on shared devices. Actual data security depends on your application's authentication, backend authorization and database configuration.",
  },
];

const quickLinks = [
  {
    title: "Getting started",
    description: "Learn the basics of tracking income and expenses.",
    icon: BookOpen,
    target: "/dashboard",
  },
  {
    title: "Transactions",
    description: "Review and manage your financial activity.",
    icon: Wallet,
    target: "/transactions",
  },
  {
    title: "Privacy & security",
    description: "Review your account security settings.",
    icon: ShieldCheck,
    target: "/settings/privacy",
  },
];

export default function HelpSupport() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState(0);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("General question");
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState(null);

  const filteredFaqs = faqs.filter((faq) =>
    `${faq.question} ${faq.answer}`
      .toLowerCase()
      .includes(search.toLowerCase().trim())
  );

  function submitSupportRequest(event) {
    event.preventDefault();
    setStatus(null);

    if (!subject.trim() || !email.trim() || !details.trim()) {
      setStatus({
        type: "error",
        text: "Please fill in your subject, email and message.",
      });
      return;
    }

    const request = {
      id: `support-${Date.now()}`,
      subject: subject.trim(),
      category,
      email: email.trim(),
      details: details.trim(),
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    try {
      const existing = JSON.parse(
        localStorage.getItem("expenseTrackerSupportRequests") || "[]"
      );

      localStorage.setItem(
        "expenseTrackerSupportRequests",
        JSON.stringify([request, ...existing])
      );

      setStatus({
        type: "success",
        text: "Your support request has been saved in this browser. It has not been sent to a support team yet.",
      });

      setSubject("");
      setCategory("General question");
      setEmail("");
      setDetails("");
    } catch {
      setStatus({
        type: "error",
        text: "Could not save your request. Please try again.",
      });
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => navigate("/settings")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-800"
        >
          <ArrowLeft size={18} />
          Back to Settings
        </button>

        <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#03045E] via-[#0D21A1] to-[#2563EB] p-6 text-white sm:p-9">
          <div className="pointer-events-none absolute -right-10 -top-12 h-48 w-48 rounded-full border-[28px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-20 right-24 h-44 w-44 rounded-full bg-white/5" />

          <div className="relative max-w-2xl">
            <div className="mb-4 inline-flex rounded-2xl bg-white/15 p-3">
              <HelpCircle size={28} />
            </div>

            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-100">
              Help centre
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How can we help?
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
              Find answers to common questions or describe the issue you're
              facing with your Expense Tracker.
            </p>

            <div className="mt-6 flex max-w-xl items-center gap-3 rounded-xl bg-white px-4 py-3 text-slate-500 shadow-lg">
              <Search size={20} className="shrink-0" />
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setOpenFaq(-1);
                }}
                placeholder="Search help articles..."
                aria-label="Search frequently asked questions"
                className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <button
            type="button"
            onClick={() =>
              document
                .getElementById("faq-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
          >
            <div className="mb-4 inline-flex rounded-xl bg-blue-50 p-3 text-blue-800">
              <CircleHelp size={22} />
            </div>
            <h2 className="font-bold">FAQs</h2>
            <p className="mt-1 text-sm leading-5 text-slate-500">
              Find quick answers to common questions.
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              document
                .getElementById("contact-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
          >
            <div className="mb-4 inline-flex rounded-xl bg-indigo-50 p-3 text-indigo-800">
              <MessageCircle size={22} />
            </div>
            <h2 className="font-bold">Contact support</h2>
            <p className="mt-1 text-sm leading-5 text-slate-500">
              Describe your issue using the support form.
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setCategory("Bug report");
              document
                .getElementById("contact-section")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
          >
            <div className="mb-4 inline-flex rounded-xl bg-amber-50 p-3 text-amber-700">
              <Bug size={22} />
            </div>
            <h2 className="font-bold">Report a bug</h2>
            <p className="mt-1 text-sm leading-5 text-slate-500">
              Tell us about an error or unexpected behaviour.
            </p>
          </button>
        </section>

        <section
          id="faq-section"
          className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        >
          <div className="mb-5">
            <h2 className="text-xl font-bold">Frequently asked questions</h2>
            <p className="mt-1 text-sm text-slate-500">
              Answers to help you use the application.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredFaqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div key={faq.question} className="py-1">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 py-4 text-left"
                  >
                    <span className="text-sm font-semibold leading-6 text-slate-800 sm:text-base">
                      {faq.question}
                    </span>
                    <ChevronDown
                      size={19}
                      className={`shrink-0 text-slate-500 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <p className="max-w-3xl pb-4 pr-5 text-sm leading-6 text-slate-500">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}

            {filteredFaqs.length === 0 && (
              <div className="py-8 text-center">
                <Search className="mx-auto mb-3 text-slate-300" size={28} />
                <p className="font-semibold text-slate-700">
                  No matching questions
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Try another search term or use the support form.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-bold">Quick links</h2>
          <p className="mt-1 text-sm text-slate-500">
            Jump directly to useful areas of your application.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {quickLinks.map((link) => {
              const Icon = link.icon;

              return (
                <button
                  key={link.title}
                  type="button"
                  onClick={() => navigate(link.target)}
                  className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/50"
                >
                  <Icon size={20} className="mt-0.5 shrink-0 text-blue-800" />
                  <div>
                    <p className="font-semibold text-slate-800">
                      {link.title}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {link.description}
                    </p>
                  </div>
                  <ExternalLink
                    size={14}
                    className="ml-auto shrink-0 text-slate-400"
                  />
                </button>
              );
            })}
          </div>
        </section>

        <section
          id="contact-section"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        >
          <div className="mb-6 flex items-start gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-800">
              <Mail size={23} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Contact support</h2>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                Fill in the details below to record your support request.
              </p>
            </div>
          </div>

          {status && (
            <div
              role="status"
              className={`mb-5 flex items-start gap-2 rounded-xl border p-4 text-sm ${
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

          <form onSubmit={submitSupportRequest} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="support-subject"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Subject
                </label>
                <input
                  id="support-subject"
                  required
                  maxLength={120}
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="What do you need help with?"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <div>
                <label
                  htmlFor="support-category"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Request type
                </label>
                <select
                  id="support-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                >
                  <option>General question</option>
                  <option>Bug report</option>
                  <option>Account issue</option>
                  <option>Transaction issue</option>
                  <option>Budget issue</option>
                  <option>Feature request</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="support-email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email address
              </label>
              <input
                id="support-email"
                type="email"
                required
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div>
              <label
                htmlFor="support-details"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Describe your issue
              </label>
              <textarea
                id="support-details"
                required
                minLength={10}
                maxLength={3000}
                rows={5}
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                placeholder="Explain what happened and what you expected..."
                className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
              />
              <p className="mt-1 text-right text-xs text-slate-400">
                {details.length}/3000
              </p>
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0D21A1] px-5 py-3 font-semibold text-white transition hover:bg-[#03045E] focus:outline-none focus:ring-4 focus:ring-blue-100 sm:w-auto"
            >
              <Send size={17} />
              Save support request
            </button>

            <p className="text-xs leading-5 text-slate-400">
              This version saves requests in your current browser only. It does
              not email a support team or store requests on the server.
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
