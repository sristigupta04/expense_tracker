
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CreditCard,
  Plus,
  Search,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  Pencil,
  Eye,
} from "lucide-react";

const STORAGE_KEY = "expenseTrackerCreditCards";

function readCards() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

const formatCurrency = (amount, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

export default function CreditCards() {
  const [cards, setCards] = useState(readCards);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const refreshCards = () => setCards(readCards());

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const query = search.toLowerCase();

      const matchesSearch = [
        card.cardName,
        card.bankName,
        card.lastFourDigits,
        card.cardType,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      const matchesStatus =
        statusFilter === "All" || card.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [cards, search, statusFilter]);

  const totals = useMemo(() => {
    return cards.reduce(
      (result, card) => {
        result.limit += Number(card.creditLimit) || 0;
        result.outstanding += Number(card.outstandingAmount) || 0;
        result.available += Number(card.availableLimit) || 0;
        return result;
      },
      { limit: 0, outstanding: 0, available: 0 }
    );
  }, [cards]);

  const utilization =
    totals.limit > 0
      ? Math.min((totals.outstanding / totals.limit) * 100, 100)
      : 0;

  const deleteCard = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this credit card?"
    );

    if (!confirmed) return;

    const updatedCards = cards.filter(
      (card) => String(card.id) !== String(id)
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCards));
    setCards(updatedCards);
  };

  return (
    <div className="min-h-screen space-y-6 bg-slate-50 p-4 text-slate-900 sm:p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Banking / Credit Cards
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Credit Cards
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage your cards, credit limits and outstanding balances.
          </p>
        </div>

        <Link
          to="/credit-cards/add"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
        >
          <Plus size={18} />
          Add Credit Card
        </Link>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Credit Limit"
          value={formatCurrency(totals.limit)}
          icon={<CreditCard size={20} />}
          color="blue"
        />

        <SummaryCard
          title="Outstanding Balance"
          value={formatCurrency(totals.outstanding)}
          icon={<Wallet size={20} />}
          color="rose"
        />

        <SummaryCard
          title="Available Credit"
          value={formatCurrency(totals.available)}
          icon={<TrendingUp size={20} />}
          color="emerald"
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Credit Utilization</p>
            <ArrowUpRight size={19} className="text-slate-400" />
          </div>

          <p className="mt-3 text-2xl font-bold">
            {utilization.toFixed(1)}%
          </p>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${
                utilization >= 70
                  ? "bg-rose-500"
                  : utilization >= 30
                    ? "bg-amber-500"
                    : "bg-emerald-500"
              }`}
              style={{ width: `${utilization}%` }}
            />
          </div>

          <p className="mt-2 text-xs text-slate-500">
            Across all saved cards
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search card, bank or last 4 digits..."
            className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
        >
          <option value="All">All statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Blocked">Blocked</option>
        </select>
      </div>

      {/* Cards */}
      {filteredCards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <CreditCard size={27} />
          </div>

          <h2 className="mt-4 text-lg font-semibold">
            {cards.length === 0
              ? "No credit cards added yet"
              : "No matching cards found"}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            {cards.length === 0
              ? "Add your first credit card to track its limit, available credit and outstanding balance."
              : "Try changing your search or selecting another status."}
          </p>

          {cards.length === 0 && (
            <Link
              to="/credit-cards/add"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
            >
              <Plus size={17} />
              Add Your First Card
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredCards.map((card) => {
            const limit = Number(card.creditLimit) || 0;
            const outstanding = Number(card.outstandingAmount) || 0;
            const available =
              card.availableLimit != null
                ? Number(card.availableLimit)
                : Math.max(limit - outstanding, 0);

            const cardUtilization =
              limit > 0
                ? Math.min((outstanding / limit) * 100, 100)
                : 0;

            return (
              <article
                key={card.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Card visual */}
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700 p-5 text-white">
                  <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full border border-white/10" />
                  <div className="absolute -right-2 -top-2 h-24 w-24 rounded-full border border-white/10" />

                  <div className="relative flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-blue-100">
                        {card.bankName || "Bank"}
                      </p>
                      <h2 className="mt-1 text-lg font-semibold">
                        {card.cardName || "Credit Card"}
                      </h2>
                    </div>

                    <CreditCard size={27} className="text-blue-100" />
                  </div>

                  <p className="relative mt-7 font-mono tracking-[0.2em]">
                    •••• •••• •••• {card.lastFourDigits || "••••"}
                  </p>

                  <div className="relative mt-5 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs text-blue-100">Credit limit</p>
                      <p className="mt-1 font-semibold">
                        {formatCurrency(limit, card.currency || "INR")}
                      </p>
                    </div>

                    <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs">
                      {card.cardType || "Credit"}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Outstanding</p>
                      <p className="mt-1 font-semibold text-rose-600">
                        {formatCurrency(
                          outstanding,
                          card.currency || "INR"
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">Available</p>
                      <p className="mt-1 font-semibold text-emerald-600">
                        {formatCurrency(
                          available,
                          card.currency || "INR"
                        )}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex justify-between text-xs">
                      <span className="text-slate-500">Limit used</span>
                      <span className="font-semibold">
                        {cardUtilization.toFixed(1)}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${
                          cardUtilization >= 70
                            ? "bg-rose-500"
                            : "bg-blue-600"
                        }`}
                        style={{ width: `${cardUtilization}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-xs">
                    <div>
                      <p className="text-slate-500">Statement date</p>
                      <p className="mt-1 font-medium text-slate-800">
                        {card.statementDate || "Not set"}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500">Payment due</p>
                      <p className="mt-1 font-medium text-slate-800">
                        {card.dueDate || "Not set"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        card.status === "Active"
                          ? "bg-emerald-50 text-emerald-700"
                          : card.status === "Blocked"
                            ? "bg-rose-50 text-rose-700"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {card.status || "Active"}
                    </span>

                    <div className="flex gap-2">
                      <Link
                        to={`/credit-cards/${card.id}`}
                        title="View card"
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                      >
                        <Eye size={17} />
                      </Link>

                      <Link
                        to={`/credit-cards/${card.id}/edit`}
                        title="Edit card"
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                      >
                        <Pencil size={17} />
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          deleteCard(card.id);
                          refreshCards();
                        }}
                        title="Delete card"
                        className="rounded-lg border border-rose-100 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value, icon, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    rose: "bg-rose-50 text-rose-600",
    emerald: "bg-emerald-50 text-emerald-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>
        <div className={`rounded-xl p-2.5 ${colors[color]}`}>{icon}</div>
      </div>
      <p className="mt-4 break-words text-2xl font-bold">{value}</p>
    </div>
  );
}
