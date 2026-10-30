
import {
  Wallet,
  Building2,
  BriefcaseBusiness,
  Banknote,
  CreditCard,
  CircleHelp,
} from "lucide-react";

const accountTypeConfig = {
  savings: {
    label: "Savings",
    icon: Wallet,
    styles: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  current: {
    label: "Current",
    icon: Building2,
    styles: "bg-violet-50 text-violet-700 ring-violet-200",
  },
  salary: {
    label: "Salary",
    icon: BriefcaseBusiness,
    styles: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  business: {
    label: "Business",
    icon: Building2,
    styles: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  cash: {
    label: "Cash",
    icon: Banknote,
    styles: "bg-orange-50 text-orange-700 ring-orange-200",
  },
  credit: {
    label: "Credit",
    icon: CreditCard,
    styles: "bg-pink-50 text-pink-700 ring-pink-200",
  },
  other: {
    label: "Other",
    icon: CircleHelp,
    styles: "bg-slate-100 text-slate-700 ring-slate-200",
  },
};

const sizeStyles = {
  sm: {
    badge: "gap-1 px-2 py-1 text-xs",
    icon: 12,
  },
  md: {
    badge: "gap-1.5 px-2.5 py-1.5 text-xs",
    icon: 14,
  },
  lg: {
    badge: "gap-2 px-3 py-2 text-sm",
    icon: 16,
  },
};

export default function AccountTypeBadge({
  type = "Other",
  showIcon = true,
  size = "md",
  className = "",
}) {
  const normalizedType = String(type || "Other")
    .trim()
    .toLowerCase();

  const config =
    accountTypeConfig[normalizedType] || {
      ...accountTypeConfig.other,
      label: String(type || "Other").trim() || "Other",
    };

  const Icon = config.icon;
  const selectedSize = sizeStyles[size] || sizeStyles.md;

  return (
    <span
      className={`inline-flex w-fit items-center rounded-full font-semibold ring-1 ring-inset ${config.styles} ${selectedSize.badge} ${className}`}
    >
      {showIcon && (
        <Icon
          size={selectedSize.icon}
          strokeWidth={2}
          aria-hidden="true"
        />
      )}

      <span>{config.label}</span>
    </span>
  );
}
