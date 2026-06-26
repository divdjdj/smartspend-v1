"use client";
 
import { useState } from "react";
import { Send, Loader2, AlertCircle, User, Phone, MessageSquare, ChevronDown, Tag, Check } from "lucide-react";
import { ALL_TOOLS } from "@/data/tools";
import { ToolLogo } from "@/components/marketing/layout/tool-logo";
import { toast } from "sonner";
 
// Deduplicate tool names and filter out invalid values
const uniqueTools = Array.from(
  new Map(ALL_TOOLS.filter(t => t.name).map(t => [t.name, t])).values()
);
 
const CATEGORY_LABELS: Record<string, string> = {
  Developer: "Developer Tools",
  Creative: "Design & Creative Tools",
  "Product/Marketing": "Product, Marketing & Growth",
  "Business/Operations": "Business & Operations",
  OTT: "OTT Platforms",
  Credits: "Platform Credits",
};

const CATEGORY_ORDER = [
  "Developer Tools",
  "Design & Creative Tools",
  "Product, Marketing & Growth",
  "Business & Operations",
  "OTT Platforms",
  "Platform Credits",
];
 
// Group tools by categories
const rawGrouped = uniqueTools.reduce((acc, tool) => {
  const label = CATEGORY_LABELS[tool.category] || "Other Tools";
  if (!acc[label]) acc[label] = [];
  acc[label].push(tool);
  return acc;
}, {} as Record<string, typeof uniqueTools>);
 
// Sort tools within each category group
Object.keys(rawGrouped).forEach(cat => {
  rawGrouped[cat].sort((a, b) => a.name.localeCompare(b.name));
});

// Sort categories by the defined order
const groupedTools = Object.entries(rawGrouped).sort((a, b) => {
  const idxA = CATEGORY_ORDER.indexOf(a[0]);
  const idxB = CATEGORY_ORDER.indexOf(b[0]);
  return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
});
 
// Robust phone validator that returns validation status, clean form for WhatsApp link, and visual display formatting
function cleanAndValidatePhone(phone: string) {
  const rawClean = phone.trim().replace(/[\s\-()]/g, "");
  
  if (rawClean.startsWith("+")) {
    const digits = rawClean.slice(1);
    const isValid = /^\d{7,15}$/.test(digits);
    return { isValid, cleaned: rawClean.replace("+", ""), formatted: rawClean };
  }
  
  const isAllDigits = /^\d+$/.test(rawClean);
  if (!isAllDigits) {
    return { isValid: false, cleaned: rawClean, formatted: phone };
  }
  
  // Indian 10 digits
  if (rawClean.length === 10) {
    const isValid = /[5-9]/.test(rawClean[0]);
    return {
      isValid,
      cleaned: `91${rawClean}`,
      formatted: `+91 ${rawClean.slice(0, 5)} ${rawClean.slice(5)}`
    };
  }
  
  // Indian 12 digits (with 91 prefix)
  if (rawClean.length === 12 && rawClean.startsWith("91")) {
    const isValid = /[5-9]/.test(rawClean[2]);
    return {
      isValid,
      cleaned: rawClean,
      formatted: `+91 ${rawClean.slice(2, 7)} ${rawClean.slice(7)}`
    };
  }
  
  // Indian 11 digits (with leading 0)
  if (rawClean.length === 11 && rawClean.startsWith("0")) {
    const isValid = /[5-9]/.test(rawClean[1]);
    const mainNum = rawClean.slice(1);
    return {
      isValid,
      cleaned: `91${mainNum}`,
      formatted: `+91 ${mainNum.slice(0, 5)} ${mainNum.slice(5)}`
    };
  }
  
  const isValidGeneral = rawClean.length >= 7 && rawClean.length <= 15;
  return {
    isValid: isValidGeneral,
    cleaned: rawClean,
    formatted: phone
  };
}
 
interface InquiryFormProps {
  onSuccess?: () => void;
}

export function InquiryForm({ onSuccess }: InquiryFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    message: "",
  });
 
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileError, setMobileError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
 
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
 
    if (name === "mobile") {
      if (value.trim() === "") {
        setMobileError("Mobile number is required.");
      } else {
        const { isValid } = cleanAndValidatePhone(value);
        if (!isValid) {
          setMobileError("Please enter a valid mobile number (e.g. 10 digits).");
        } else {
          setMobileError("");
        }
      }
    }
  };
 
  const handleAllToggle = () => {
    setSelectedSubs(prev =>
      prev.includes("Interested in All Subscriptions")
        ? []
        : ["Interested in All Subscriptions"]
    );
  };
 
  const handleToolToggle = (toolName: string) => {
    setSelectedSubs(prev =>
      prev.includes(toolName)
        ? prev.filter(t => t !== toolName)
        : [...prev.filter(t => t !== "Interested in All Subscriptions"), toolName]
    );
  };
 
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMobileError("");
 
    const name = formData.name.trim();
    const mobile = formData.mobile.trim();
    const message = formData.message.trim();
    const subscriptionList = selectedSubs.join(", ");
 
    if (!name) {
      toast.error("Please enter your name.");
      return;
    }
 
    const phoneValidation = cleanAndValidatePhone(mobile);
    if (!mobile || !phoneValidation.isValid) {
      setMobileError("Please enter a valid mobile number.");
      toast.error("Invalid mobile number provided.");
      return;
    }
 
    if (selectedSubs.length === 0) {
      toast.error("Please select at least one subscription.");
      return;
    }
 
    setSubmitting(true);
 
    try {
      // Submit to MongoDB database
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          mobile: phoneValidation.formatted,
          subscription: subscriptionList || undefined,
          message: message || undefined,
        }),
      });
 
      const data = await res.json();
 
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit enquiry.");
      }
 
      toast.success("Enquiry saved successfully!");
      setSubmitted(true);
      if (onSuccess) {
        onSuccess();
      }
 
      // Reset form
      setFormData({
        name: "",
        mobile: "",
        message: "",
      });
      setSelectedSubs([]);
      
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
 
  if (submitted) {
    return (
      <div className="border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-md rounded-2xl p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="inline-flex h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 items-center justify-center shadow-soft">
          <Check className="h-6 w-6" />
        </div>
        <h3 className="font-display font-extrabold text-lg text-foreground">Submitted Successfully!</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Thank you for reaching out. Our team will contact you shortly.
        </p>
      </div>
    );
  }
 
  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="group">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 transition-colors group-focus-within:text-brand">
            Name <span className="text-brand font-bold">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
              <User className="h-4 w-4 text-muted-foreground/50 transition-colors group-focus-within:text-brand" />
            </span>
            <input
              name="name"
              required
              type="text"
              placeholder="Your name"
              maxLength={100}
              value={formData.name}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border/10 bg-soft/20 text-sm text-foreground placeholder:text-muted-foreground/45 focus:border-brand/40 focus:ring-1 focus:ring-brand/40 focus:outline-none transition-all duration-200 shadow-sm"
            />
          </div>
        </div>
 
        <div className="group">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 transition-colors group-focus-within:text-brand">
            Mobile Number <span className="text-brand font-bold">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
              <Phone className="h-4 w-4 text-muted-foreground/50 transition-colors group-focus-within:text-brand" />
            </span>
            <input
              name="mobile"
              required
              type="tel"
              placeholder="e.g. 9876543210"
              maxLength={18}
              value={formData.mobile}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-soft/20 text-sm text-foreground placeholder:text-muted-foreground/45 focus:ring-1 focus:outline-none transition-all duration-200 shadow-sm ${
                mobileError
                  ? "border-destructive focus:border-destructive focus:ring-destructive"
                  : "border-border/10 focus:border-brand/40 focus:ring-brand/40"
              }`}
            />
          </div>
          {mobileError && (
            <div className="mt-1.5 flex items-center gap-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{mobileError}</span>
            </div>
          )}
        </div>
      </div>
 
      <div className="group relative">
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 transition-colors group-focus-within:text-brand">
          Select Subscription <span className="text-brand font-bold">*</span>
        </label>
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full text-left pl-10 pr-10 py-3 rounded-xl border border-border/10 bg-soft/20 text-sm text-foreground focus:border-brand/40 focus:ring-1 focus:ring-brand/40 focus:outline-none transition-all duration-200 cursor-pointer shadow-sm relative h-12"
        >
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
            <Tag className="h-4 w-4 text-muted-foreground/50" />
          </span>
          <span className="block truncate">
            {selectedSubs.length === 0
              ? "Select Subscription(s)"
              : selectedSubs.includes("Interested in All Subscriptions")
              ? "Interested in All Subscriptions"
              : selectedSubs.map(s => s === "Other" ? "Others" : s).join(", ")}
          </span>
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
            <ChevronDown className={`h-4 w-4 text-muted-foreground/50 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </span>
        </button>
 
        {dropdownOpen && (
          <div 
            className="absolute z-20 mt-1.5 w-full max-h-60 overflow-y-auto rounded-xl border border-border bg-card p-3 shadow-xl animate-in slide-in-from-top-1 duration-200"
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <label className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-secondary/40 rounded-lg cursor-pointer text-sm font-semibold mb-2 text-primary border-b border-border/10 pb-2">
              <input
                type="checkbox"
                checked={selectedSubs.includes("Interested in All Subscriptions")}
                onChange={handleAllToggle}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
              <span>Interested in All Subscriptions</span>
            </label>
            
            {groupedTools.map(([category, tools]) => (
              <div key={category} className="space-y-1 mt-2">
                <div className="text-[10px] uppercase font-bold text-muted-foreground/60 px-2 py-0.5 tracking-wider">
                  {category}
                </div>
                {tools.map(tool => {
                  const checked = selectedSubs.includes(tool.name);
                  const isDisabled = selectedSubs.includes("Interested in All Subscriptions");
                  return (
                    <label
                      key={tool.name}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 hover:bg-secondary/30 rounded-lg cursor-pointer text-xs ${
                        isDisabled ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked && !isDisabled}
                        disabled={isDisabled}
                        onChange={() => handleToolToggle(tool.name)}
                        className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                      />
                      <ToolLogo tool={tool} className="h-5 w-5" />
                      <span className="text-foreground/90 font-medium">{tool.name}</span>
                    </label>
                  );
                })}
              </div>
            ))}

            {/* Other Option */}
            <div className="space-y-1 mt-2 border-t border-border/10 pt-2">
              <label
                className={`flex items-center gap-2.5 px-2.5 py-1.5 hover:bg-secondary/30 rounded-lg cursor-pointer text-xs ${
                  selectedSubs.includes("Interested in All Subscriptions") ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedSubs.includes("Other") && !selectedSubs.includes("Interested in All Subscriptions")}
                  disabled={selectedSubs.includes("Interested in All Subscriptions")}
                  onChange={() => handleToolToggle("Other")}
                  className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                />
                <span className="text-foreground/90 font-medium">Others</span>
              </label>
            </div>
          </div>
        )}
      </div>
 
      <div className="group">
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 transition-colors group-focus-within:text-brand">
          What exactly are you looking for?
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-[14px] flex items-center justify-center pointer-events-none">
            <MessageSquare className="h-4 w-4 text-muted-foreground/50 transition-colors group-focus-within:text-brand" />
          </span>
          <textarea
            name="message"
            rows={3}
            maxLength={500}
            placeholder="Tell us what you need..."
            value={formData.message}
            onChange={handleInputChange}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border/10 bg-soft/20 text-sm text-foreground placeholder:text-muted-foreground/45 focus:border-brand/40 focus:ring-1 focus:ring-brand/40 focus:outline-none transition-all duration-200 resize-none shadow-sm"
          />
        </div>
      </div>
 
      <button
        type="submit"
        disabled={submitting || !!mobileError}
        className="w-full h-12 bg-gradient-brand hover:brightness-110 active:scale-[0.99] text-primary-foreground font-bold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-card cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="h-4 w-4 text-primary-foreground" />
            Submit
          </>
        )}
      </button>
    </form>
  );
}
