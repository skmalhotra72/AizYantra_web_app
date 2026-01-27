"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  Users,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Shield,
  FileText,
  Sparkles,
  LucideIcon
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  organization_name: string;
  designation: string;
  organization_size: string;
  industry: string;
  organization_description: string; // NEW: 100-word description
  marketing_consent: boolean;
}

interface LeadCaptureFormProps {
  onSubmit: (data: LeadFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  selectedTier?: string;
}

// ═══════════════════════════════════════════════════════════════
// Options Data
// ═══════════════════════════════════════════════════════════════

const organizationSizes = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "501-1000", label: "501-1000 employees" },
  { value: "1000+", label: "1000+ employees" },
];

const industries = [
  "Healthcare & Diagnostics",
  "Pathology & Laboratory",
  "Hospitals & Clinics",
  "Pharmaceutical",
  "Financial Services & Banking",
  "Insurance",
  "Manufacturing",
  "Retail & E-commerce",
  "Technology & IT Services",
  "Education & EdTech",
  "Professional Services",
  "Logistics & Supply Chain",
  "Real Estate",
  "Hospitality & Travel",
  "Media & Entertainment",
  "Agriculture",
  "Government & Public Sector",
  "Non-Profit",
  "Other",
];

// ═══════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════

export function LeadCaptureForm({ 
  onSubmit, 
  isLoading = false, 
  error = null,
}: LeadCaptureFormProps) {
  const [formData, setFormData] = useState<LeadFormData>({
    name: "",
    email: "",
    phone: "",
    organization_name: "",
    designation: "",
    organization_size: "",
    industry: "",
    organization_description: "",
    marketing_consent: false,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [wordCount, setWordCount] = useState(0);

  // ─────────────────────────────────────────────────────────────
  // Validation
  // ─────────────────────────────────────────────────────────────

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Name is required";
        if (value.trim().length < 2) return "Name must be at least 2 characters";
        return "";
      case "email":
        if (!value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email address";
        return "";
      case "phone":
        if (!value.trim()) return "Phone number is required";
        if (!/^[\d\s\-+()]{10,}$/.test(value.replace(/\s/g, ""))) return "Invalid phone number";
        return "";
      case "organization_name":
        if (!value.trim()) return "Organization name is required";
        return "";
      case "designation":
        if (!value.trim()) return "Designation is required";
        return "";
      case "industry":
        if (!value.trim()) return "Please select your industry";
        return "";
      case "organization_description":
        if (!value.trim()) return "Please tell us about your organization";
        if (value.trim().split(/\s+/).length < 10) return "Please provide at least 10 words";
        return "";
      default:
        return "";
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const requiredFields = ["name", "email", "phone", "organization_name", "designation", "industry", "organization_description"];

    requiredFields.forEach((field) => {
      const error = validateField(field, formData[field as keyof LeadFormData] as string);
      if (error) errors[field] = error;
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ─────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    // Update word count for description
    if (name === "organization_description") {
      const words = value.trim().split(/\s+/).filter(w => w.length > 0);
      setWordCount(words.length);
    }

    // Clear error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setFieldErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach(key => { allTouched[key] = true; });
    setTouched(allTouched);
    
    if (!validateForm()) return;
    
    await onSubmit(formData);
  };

  // ─────────────────────────────────────────────────────────────
  // Render Helpers
  // ─────────────────────────────────────────────────────────────

  const renderInputField = (
    name: keyof LeadFormData,
    label: string,
    Icon: LucideIcon,
    placeholder: string,
    type: string = "text",
    required: boolean = false
  ) => {
    const hasError = touched[name] && fieldErrors[name];
    const isValid = touched[name] && !fieldErrors[name] && formData[name];

    return (
      <div className="space-y-1.5">
        <label htmlFor={name} className="block text-sm font-medium text-text">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className={`w-4 h-4 ${hasError ? "text-red-500" : "text-subtext-0"}`} />
          </div>
          <input
            type={type}
            id={name}
            name={name}
            value={formData[name] as string}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            autoComplete={name === "email" ? "email" : name === "phone" ? "tel" : "off"}
            className={`
              w-full pl-10 pr-10 py-2.5 
              bg-crust border rounded-lg
              text-text placeholder:text-subtext-0
              transition-all duration-200
              focus:outline-none focus:ring-2
              ${hasError 
                ? "border-red-500 focus:ring-red-500/20" 
                : isValid
                  ? "border-green-500 focus:ring-green-500/20"
                  : "border-surface-0 focus:ring-sky/20 focus:border-sky"
              }
            `}
          />
          {isValid && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </div>
          )}
        </div>
        {hasError && (
          <motion.p 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-500"
          >
            {fieldErrors[name]}
          </motion.p>
        )}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="bg-mantle border border-surface-0 rounded-2xl p-6 sm:p-8 shadow-xl shadow-black/10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sky/10 mb-4">
            <User className="w-6 h-6 text-sky" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-text mb-2">
            Let's Personalize Your Assessment
          </h2>
          <p className="text-sm text-subtext-1">
            Tell us about your organization so we can tailor the questions to your specific situation
          </p>
        </div>

        {/* AI Personalization Badge */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-sky/10 border border-sky/20 mb-6">
          <Sparkles className="w-5 h-5 text-sky flex-shrink-0" />
          <p className="text-xs text-sky">
            Our AI will analyze your organization and generate questions specifically relevant to your industry and context.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20"
          >
            <p className="text-sm text-red-500">{error}</p>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {renderInputField("name", "Full Name", User, "John Doe", "text", true)}
            {renderInputField("email", "Work Email", Mail, "john@company.com", "email", true)}
          </div>

          {/* Row 2: Phone & Designation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {renderInputField("phone", "Phone Number", Phone, "+91 98765 43210", "tel", true)}
            {renderInputField("designation", "Your Role", Briefcase, "CEO, CTO, Manager, etc.", "text", true)}
          </div>

          {/* Organization Name */}
          {renderInputField("organization_name", "Organization Name", Building2, "Acme Healthcare Pvt Ltd", "text", true)}

          {/* Row 3: Industry & Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Industry (Required) */}
            <div className="space-y-1.5">
              <label htmlFor="industry" className="block text-sm font-medium text-text">
                Industry <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className={`w-4 h-4 ${touched.industry && fieldErrors.industry ? "text-red-500" : "text-subtext-0"}`} />
                </div>
                <select
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`
                    w-full pl-10 pr-4 py-2.5 bg-crust border rounded-lg
                    text-text appearance-none cursor-pointer
                    focus:outline-none focus:ring-2
                    ${touched.industry && fieldErrors.industry
                      ? "border-red-500 focus:ring-red-500/20"
                      : touched.industry && !fieldErrors.industry && formData.industry
                        ? "border-green-500 focus:ring-green-500/20"
                        : "border-surface-0 focus:ring-sky/20 focus:border-sky"
                    }
                  `}
                >
                  <option value="">Select industry...</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>
              {touched.industry && fieldErrors.industry && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-500"
                >
                  {fieldErrors.industry}
                </motion.p>
              )}
            </div>

            {/* Organization Size */}
            <div className="space-y-1.5">
              <label htmlFor="organization_size" className="block text-sm font-medium text-text">
                Organization Size
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="w-4 h-4 text-subtext-0" />
                </div>
                <select
                  id="organization_size"
                  name="organization_size"
                  value={formData.organization_size}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-crust border border-surface-0 rounded-lg
                             text-text appearance-none cursor-pointer
                             focus:outline-none focus:ring-2 focus:ring-sky/20 focus:border-sky"
                >
                  <option value="">Select size...</option>
                  {organizationSizes.map((size) => (
                    <option key={size.value} value={size.value}>
                      {size.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Organization Description (NEW - Key Field) */}
          <div className="space-y-1.5">
            <label htmlFor="organization_description" className="block text-sm font-medium text-text">
              Tell us about your organization <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-subtext-0 mb-2">
              What does your organization do? Any current challenges? Using any tech tools?
            </p>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <FileText className={`w-4 h-4 ${touched.organization_description && fieldErrors.organization_description ? "text-red-500" : "text-subtext-0"}`} />
              </div>
              <textarea
                id="organization_description"
                name="organization_description"
                value={formData.organization_description}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Example: We are a pathology lab chain with 15 centers across Maharashtra. We process around 500 tests daily. Currently, all reports are sent manually via WhatsApp. We use basic billing software but most work is still done in Excel. Looking to streamline operations and improve patient experience."
                rows={4}
                className={`
                  w-full pl-10 pr-4 py-3 
                  bg-crust border rounded-lg
                  text-text placeholder:text-subtext-0 text-sm
                  transition-all duration-200 resize-none
                  focus:outline-none focus:ring-2
                  ${touched.organization_description && fieldErrors.organization_description
                    ? "border-red-500 focus:ring-red-500/20"
                    : touched.organization_description && !fieldErrors.organization_description && formData.organization_description
                      ? "border-green-500 focus:ring-green-500/20"
                      : "border-surface-0 focus:ring-sky/20 focus:border-sky"
                  }
                `}
              />
              <div className="absolute bottom-2 right-2">
                <span className={`text-xs ${wordCount >= 10 ? "text-green-500" : "text-subtext-0"}`}>
                  {wordCount} words {wordCount < 10 && "(min 10)"}
                </span>
              </div>
            </div>
            {touched.organization_description && fieldErrors.organization_description && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500"
              >
                {fieldErrors.organization_description}
              </motion.p>
            )}
          </div>

          {/* Marketing Consent */}
          <div className="flex items-start gap-3 pt-2">
            <input
              type="checkbox"
              id="marketing_consent"
              name="marketing_consent"
              checked={formData.marketing_consent}
              onChange={handleChange}
              className="mt-1 w-4 h-4 rounded border-surface-0 bg-crust
                         text-sky focus:ring-sky/20 cursor-pointer"
            />
            <label htmlFor="marketing_consent" className="text-xs text-subtext-1 cursor-pointer">
              I'd like to receive AI insights and tips relevant to my industry from AIzYantra.
            </label>
          </div>

          {/* Privacy Notice */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-surface-0/30">
            <Shield className="w-4 h-4 text-sky flex-shrink-0" />
            <p className="text-xs text-subtext-0">
              Your information is secure and will only be used to personalize your assessment.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4
                       bg-gradient-to-r from-sky to-teal
                       text-base font-semibold text-white rounded-lg
                       hover:opacity-90 transition-opacity
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>AI is preparing your questions...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate My Personalized Assessment</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-4 text-center text-xs text-subtext-0">
          By continuing, you agree to our{" "}
          <a href="/privacy" className="text-sky hover:underline">Privacy Policy</a>
        </p>
      </div>
    </motion.div>
  );
}

export default LeadCaptureForm;