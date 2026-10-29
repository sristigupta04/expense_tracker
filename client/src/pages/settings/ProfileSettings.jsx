
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  UserRound,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Save,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  Trash2,
} from "lucide-react";

import { useAuth } from "../../context/Authcontext";
import api from "../../services/api";

const PROFILE_UPDATE_ENDPOINT = "/auth/profile";
const AVATAR_STORAGE_KEY = "expenseTrackerProfileAvatar";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50";

function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "U"
  );
}

function getProfileFromUser(user) {
  return {
    name: user?.name || user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || user?.phoneNumber || "",
    location: user?.location || "",
    dateOfBirth: user?.dateOfBirth
      ? String(user.dateOfBirth).slice(0, 10)
      : "",
  };
}

function Field({
  label,
  icon: Icon,
  error,
  hint,
  className = "",
  ...inputProps
}) {
  return (
    <div className={className}>
      <label
        htmlFor={inputProps.id}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}

        <input
          {...inputProps}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error
              ? `${inputProps.id}-error`
              : hint
                ? `${inputProps.id}-hint`
                : undefined
          }
          className={`${inputClass} ${Icon ? "pl-11" : ""} ${
            error ? "border-red-400 focus:border-red-500 focus:ring-red-50" : ""
          }`}
        />
      </div>

      {error && (
        <p
          id={`${inputProps.id}-error`}
          className="mt-1.5 text-xs text-red-600"
        >
          {error}
        </p>
      )}

      {!error && hint && (
        <p
          id={`${inputProps.id}-hint`}
          className="mt-1.5 text-xs text-slate-500"
        >
          {hint}
        </p>
      )}
    </div>
  );
}

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const objectUrlRef = useRef(null);

  const [form, setForm] = useState(() => getProfileFromUser(user));
  const [originalForm, setOriginalForm] = useState(() =>
    getProfileFromUser(user)
  );

  const [avatar, setAvatar] = useState(() => {
    try {
      return localStorage.getItem(AVATAR_STORAGE_KEY) || "";
    } catch {
      return "";
    }
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);
  const [photoError, setPhotoError] = useState("");

  useEffect(() => {
    const profile = getProfileFromUser(user);
    setForm(profile);
    setOriginalForm(profile);
  }, [user]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const isDirty =
    JSON.stringify(form) !== JSON.stringify(originalForm);

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setStatus({ type: "", text: "" });
  }

  function validateForm() {
    const nextErrors = {};
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();

    if (!trimmedName) {
      nextErrors.name = "Please enter your full name.";
    } else if (trimmedName.length < 2) {
      nextErrors.name = "Name must contain at least 2 characters.";
    } else if (trimmedName.length > 80) {
      nextErrors.name = "Name cannot exceed 80 characters.";
    }

    if (!trimmedEmail) {
      nextErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }

    const digits = form.phone.replace(/\D/g, "");
    if (form.phone.trim() && (digits.length < 10 || digits.length > 15)) {
      nextErrors.phone = "Enter a valid phone number.";
    }

    if (form.dateOfBirth) {
      const selectedDate = new Date(`${form.dateOfBirth}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (
        Number.isNaN(selectedDate.getTime()) ||
        selectedDate > today
      ) {
        nextErrors.dateOfBirth = "Date of birth cannot be in the future.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoError("Please select an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("Image must be smaller than 2 MB.");
      return;
    }

    setPhotoError("");

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    objectUrlRef.current = URL.createObjectURL(file);
    setAvatar(objectUrlRef.current);
    setStatus({
      type: "info",
      text: "Photo preview updated. Save it to keep the photo in this browser.",
    });
  }

  function removePhoto() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setAvatar("");
    setPhotoError("");
    setStatus({
      type: "info",
      text: "Photo removed from the preview. Save changes to apply it.",
    });
  }

  function handleCancel() {
    setForm(originalForm);
    setErrors({});
    setStatus({ type: "", text: "" });

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    try {
      setAvatar(localStorage.getItem(AVATAR_STORAGE_KEY) || "");
    } catch {
      setAvatar("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ type: "", text: "" });

    if (!validateForm()) {
      setStatus({
        type: "error",
        text: "Please fix the highlighted fields.",
      });
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      location: form.location.trim(),
      dateOfBirth: form.dateOfBirth || null,
    };

    setSaving(true);

    try {
      // This endpoint must exist in your backend auth routes.
      const response = await api.patch(
        PROFILE_UPDATE_ENDPOINT,
        payload
      );

      const updatedUser =
        response?.data?.user ||
        response?.data?.data?.user ||
        response?.data?.data ||
        payload;

      const nextProfile = {
        ...payload,
        name: updatedUser.name ?? updatedUser.fullName ?? payload.name,
        email: updatedUser.email ?? payload.email,
        phone:
          updatedUser.phone ??
          updatedUser.phoneNumber ??
          payload.phone,
        location: updatedUser.location ?? payload.location,
        dateOfBirth: updatedUser.dateOfBirth
          ? String(updatedUser.dateOfBirth).slice(0, 10)
          : payload.dateOfBirth || "",
      };

      if (typeof updateUser === "function") {
        updateUser(updatedUser);
      }

      try {
        if (avatar && objectUrlRef.current) {
          const file = fileInputRef.current?.files?.[0];

          if (file) {
            const dataUrl = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.onerror = () => reject(new Error("Photo could not be read."));
              reader.readAsDataURL(file);
            });

            localStorage.setItem(AVATAR_STORAGE_KEY, dataUrl);
            setAvatar(dataUrl);
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
          }
        } else if (!avatar) {
          localStorage.removeItem(AVATAR_STORAGE_KEY);
        }
      } catch {
        setStatus({
          type: "error",
          text: "Profile was saved, but the photo could not be saved in this browser.",
        });
        setForm(nextProfile);
        setOriginalForm(nextProfile);
        return;
      }

      setForm(nextProfile);
      setOriginalForm(nextProfile);
      setStatus({
        type: "success",
        text: "Your profile has been updated successfully.",
      });
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        (error?.response?.status === 404
          ? "Profile update API was not found. Check your backend auth routes."
          : error?.response?.status === 401
            ? "Your session has expired. Please sign in again."
            : error?.message ||
              "Unable to update your profile. Please try again.");

      setStatus({ type: "error", text: message });
    } finally {
      setSaving(false);
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

        <header className="mb-7">
          <p className="mb-2 text-sm font-medium text-blue-700">
            Settings / Profile
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Profile settings
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Manage your personal information and keep your account details up
            to date.
          </p>
        </header>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Profile summary */}
          <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="h-24 bg-gradient-to-r from-[#03045E] via-[#0D21A1] to-[#2563EB]" />

            <div className="px-5 pb-5">
              <div className="-mt-10 flex items-end justify-between">
                <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-blue-100 text-2xl font-bold text-blue-900 shadow-sm">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getInitials(form.name)
                  )}
                </div>

                <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  <ShieldCheck size={14} />
                  Account
                </span>
              </div>

              <h2 className="mt-4 break-words text-lg font-bold">
                {form.name || "Your name"}
              </h2>
              <p className="mt-1 break-all text-sm text-slate-500">
                {form.email || "Add your email address"}
              </p>

              <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Mail size={16} className="shrink-0 text-slate-400" />
                  <span className="break-all">
                    {form.email || "Email not added"}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone size={16} className="shrink-0 text-slate-400" />
                  <span>{form.phone || "Phone not added"}</span>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-blue-50 p-3.5">
                <p className="text-sm font-semibold text-blue-900">
                  Keep your profile updated
                </p>
                <p className="mt-1 text-xs leading-5 text-blue-800">
                  Accurate details help you manage your account more easily.
                </p>
              </div>
            </div>
          </aside>

          {/* Editable form */}
          <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
              <h2 className="text-lg font-bold">Personal information</h2>
              <p className="mt-1 text-sm text-slate-500">
                Update the details associated with your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="space-y-5 px-5 py-6 sm:px-7">
                {status.text && (
                  <div
                    role="status"
                    aria-live="polite"
                    className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-sm ${
                      status.type === "success"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : status.type === "error"
                          ? "border-red-200 bg-red-50 text-red-800"
                          : "border-blue-200 bg-blue-50 text-blue-800"
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

                <div className="flex flex-col gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-100 text-xl font-bold text-blue-900">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="Selected profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      getInitials(form.name)
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">
                      Profile photo
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      JPG, PNG, or another image format. Maximum size 2 MB.
                    </p>

                    {photoError && (
                      <p className="mt-2 text-xs text-red-600">
                        {photoError}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      id="profile-photo"
                    />

                    <label
                      htmlFor="profile-photo"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
                    >
                      <Camera size={16} />
                      Upload
                    </label>

                    {avatar && (
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-100 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 size={15} />
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field
                    id="profile-name"
                    name="name"
                    label="Full name *"
                    icon={UserRound}
                    value={form.name}
                    onChange={updateField}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    maxLength={80}
                    error={errors.name}
                    required
                  />

                  <Field
                    id="profile-email"
                    name="email"
                    label="Email address *"
                    icon={Mail}
                    type="email"
                    value={form.email}
                    onChange={updateField}
                    placeholder="you@example.com"
                    autoComplete="email"
                    error={errors.email}
                    required
                  />

                  <Field
                    id="profile-phone"
                    name="phone"
                    label="Phone number"
                    icon={Phone}
                    type="tel"
                    value={form.phone}
                    onChange={updateField}
                    placeholder="Enter phone number"
                    autoComplete="tel"
                    error={errors.phone}
                  />

                  <Field
                    id="profile-location"
                    name="location"
                    label="Location"
                    icon={MapPin}
                    value={form.location}
                    onChange={updateField}
                    placeholder="City, country"
                    autoComplete="address-level2"
                  />

                  <Field
                    id="profile-date-of-birth"
                    name="dateOfBirth"
                    label="Date of birth"
                    icon={CalendarDays}
                    type="date"
                    value={form.dateOfBirth}
                    onChange={updateField}
                    error={errors.dateOfBirth}
                  />
                </div>

                <p className="text-xs leading-5 text-slate-500">
                  Fields marked with * are required. Your profile is updated
                  on the server only when the API request succeeds.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving || !isDirty}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RotateCcw size={16} />
                  Cancel changes
                </button>

                <button
                  type="submit"
                  disabled={saving || (!isDirty && !objectUrlRef.current)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0D21A1] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#03045E] focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <Save size={17} />
                  )}
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
