import {
  Wallet,
  Building2,
  BriefcaseBusiness,
  Banknote,
  CreditCard,
  CircleHelp,
} from "lucide-react";

const accountTypeConfig = {
  Savings: {
    label: "Savings",
    icon: Wallet,
    styles: "bg-blue-50 text-blue-700 ring-blue-200",
    iconStyles: "bg-blue-100 text-blue-700",
  },
  Current: {
    label: "Current",
    icon: Building2,
    styles: "bg-violet-50 text-violet-700 ring-violet-200",
    iconStyles: "bg-violet-100 text-violet-700",
  },
  Salary: {
    label: "Salary",
    icon: BriefcaseBusiness,
    styles: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    iconStyles: "bg-emerald-100 text-emerald-700",
  },
  Business: {
    label: "Business",
    icon: Building2,
    styles: "bg-amber-50 text-amber-700 ring-amber-200",
    iconStyles: "bg-amber-100 text-amber-700",
  },
  Cash: {
    label: "Cash",
    icon: Banknote,
    styles: "bg-orange-50 text-orange-700 ring-orange-200",
    iconStyles: "bg-orange-100 text-orange-700",
  },
  Credit: {
    label: "Credit",
    icon: CreditCard,
    styles: "bg-pink-50 text-pink-700 ring-pink-200",
    iconStyles: "bg-pink-100 text-pink-700",
  },
  Other: {
    label: "Other",
    icon: CircleHelp,
    styles: "bg-slate-100 text-slate-700 ring-slate-200",
    iconStyles: "bg-slate-200 text-slate-600",
  },
};

export default function AccountTypeBadge({
  type = "Other",
  showIcon = true,
  size = "md",
}) {
  const config = accountTypeConfig[type] || {
    ...accountTypeConfig.Other,
    label: type || "Other",
  };

  const Icon = config.icon;

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

  const selectedSize = sizeStyles[size] || sizeStyles.md;

  return (
    <span
      className={`inline-flex w-fit items-center rounded-full font-semibold ring-1 ring-inset ${config.styles} ${selectedSize.badge}`}
    >
      {showIcon && <Icon size={selectedSize.icon} strokeWidth={2} />}
      <span>{config.label}</span>
    </span>
  );
}