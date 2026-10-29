
/**
 * Transaction category utilities.
 */

export const EXPENSE_CATEGORIES = [
  "Food",
  "Shopping",
  "Transport",
  "Bills",
  "Health",
  "Education",
  "Entertainment",
  "Travel",
  "Rent",
  "Groceries",
  "Personal Care",
  "Other",
];

export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Business",
  "Investment",
  "Gift",
  "Refund",
  "Other",
];

// Get categories based on transaction type.
export const getCategoriesByType = (type = "expense") => {
  return String(type).toLowerCase() === "income"
    ? [...INCOME_CATEGORIES]
    : [...EXPENSE_CATEGORIES];
};

// Check whether a category is valid for the selected type.
export const isValidCategory = (category, type = "expense") => {
  if (!category || typeof category !== "string") {
    return false;
  }

  return getCategoriesByType(type).some(
    (item) => item.toLowerCase() === category.trim().toLowerCase()
  );
};

// Normalize category text.
export const normalizeCategory = (category) => {
  if (typeof category !== "string" || !category.trim()) {
    return "Other";
  }

  const cleaned = category.trim();

  const allCategories = [
    ...EXPENSE_CATEGORIES,
    ...INCOME_CATEGORIES,
  ];

  return (
    allCategories.find(
      (item) => item.toLowerCase() === cleaned.toLowerCase()
    ) || cleaned
  );
};

// Get an icon-friendly category label.
export const getCategoryLabel = (category) => {
  const normalized = normalizeCategory(category);

  const labels = {
    Food: "Food & Dining",
    Shopping: "Shopping",
    Transport: "Transport",
    Bills: "Bills & Utilities",
    Health: "Health",
    Education: "Education",
    Entertainment: "Entertainment",
    Travel: "Travel",
    Rent: "Rent",
    Groceries: "Groceries",
    "Personal Care": "Personal Care",
    Salary: "Salary",
    Freelance: "Freelance",
    Business: "Business",
    Investment: "Investment",
    Gift: "Gift",
    Refund: "Refund",
    Other: "Other",
  };

  return labels[normalized] || normalized;
};

// Return a category color class for Tailwind UI.
export const getCategoryColor = (category) => {
  const normalized = normalizeCategory(category);

  const colors = {
    Food: "bg-orange-50 text-orange-700",
    Shopping: "bg-purple-50 text-purple-700",
    Transport: "bg-sky-50 text-sky-700",
    Bills: "bg-amber-50 text-amber-700",
    Health: "bg-rose-50 text-rose-700",
    Education: "bg-indigo-50 text-indigo-700",
    Entertainment: "bg-pink-50 text-pink-700",
    Travel: "bg-cyan-50 text-cyan-700",
    Rent: "bg-violet-50 text-violet-700",
    Groceries: "bg-lime-50 text-lime-700",
    "Personal Care": "bg-fuchsia-50 text-fuchsia-700",
    Salary: "bg-emerald-50 text-emerald-700",
    Freelance: "bg-teal-50 text-teal-700",
    Business: "bg-blue-50 text-blue-700",
    Investment: "bg-green-50 text-green-700",
    Gift: "bg-pink-50 text-pink-700",
    Refund: "bg-cyan-50 text-cyan-700",
    Other: "bg-slate-100 text-slate-700",
  };

  return colors[normalized] || colors.Other;
};

export default {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  getCategoriesByType,
  isValidCategory,
  normalizeCategory,
  getCategoryLabel,
  getCategoryColor,
};
