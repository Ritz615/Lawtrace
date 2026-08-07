"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { Check, ChevronRight, Download, Copy, Loader2 } from "lucide-react";

const CONTRACT_TYPES = [
  { id: "employment",       label: "Employment Agreement",   icon: "👔", desc: "Hire employees with defined terms" },
  { id: "nda",              label: "NDA",                    icon: "🤫", desc: "Protect confidential information" },
  { id: "rental",           label: "Rental Agreement",       icon: "🏠", desc: "Property lease contracts" },
  { id: "partnership",      label: "Partnership Agreement",  icon: "🤝", desc: "Business partnership terms" },
  { id: "service",          label: "Service Agreement",      icon: "🛠️", desc: "Define service deliverables" },
  { id: "freelance",        label: "Freelance Contract",     icon: "💻", desc: "Project-based engagements" },
  { id: "internship",       label: "Internship Agreement",   icon: "🎓", desc: "Structured internship programs" },
  { id: "privacy_policy",   label: "Privacy Policy",         icon: "🔒", desc: "GDPR/CCPA compliant policies" },
  { id: "terms_conditions", label: "Terms & Conditions",     icon: "📋", desc: "Website/app usage terms" },
];

const FORMS: Record<string, { label: string; placeholder: string; key: string }[]> = {
  employment: [
    { key: "employer",    label: "Employer Name",       placeholder: "Acme Corporation" },
    { key: "employee",    label: "Employee Full Name",   placeholder: "Jane Smith" },
    { key: "role",        label: "Job Title",            placeholder: "Senior Software Engineer" },
    { key: "salary",      label: "Annual Salary",        placeholder: "$120,000" },
    { key: "start_date",  label: "Start Date",           placeholder: "2026-09-01" },
  ],
  nda: [
    { key: "party_a",      label: "Party A (Disclosing)", placeholder: "Acme Corp" },
    { key: "party_b",      label: "Party B (Receiving)",  placeholder: "TechVentures Inc" },
    { key: "effective_date", label: "Effective Date",     placeholder: "2026-08-15" },
    { key: "period",       label: "Confidentiality Period (years)", placeholder: "3" },
  ],
  service: [
    { key: "client",        label: "Client Name",        placeholder: "Acme Corporation" },
    { key: "provider",      label: "Service Provider",   placeholder: "TechVentures Inc" },
    { key: "service_description", label: "Service Description", placeholder: "Software Development" },
    { key: "rate",          label: "Rate",               placeholder: "15000" },
    { key: "rate_unit",     label: "Rate Unit",          placeholder: "month" },
  ],
  rental: [
    { key: "landlord",          label: "Landlord Name",       placeholder: "John Doe" },
    { key: "tenant",            label: "Tenant Name",         placeholder: "Jane Smith" },
    { key: "property_address",  label: "Property Address",    placeholder: "123 Main St, San Francisco, CA" },
    { key: "rent",              label: "Monthly Rent ($)",     placeholder: "3500" },
    { key: "start_date",        label: "Lease Start",          placeholder: "2026-09-01" },
    { key: "end_date",          label: "Lease End",            placeholder: "2027-08-31" },
  ],
  freelance: [
    { key: "client",     label: "Client Name",        placeholder: "Acme Corp" },
    { key: "freelancer", label: "Freelancer Name",     placeholder: "Jane Smith" },
    { key: "project_description", label: "Project Description", placeholder: "Website redesign" },
    { key: "amount",     label: "Project Fee ($)",     placeholder: "8000" },
  ],
  privacy_policy: [
    { key: "company_name", label: "Company Name",   placeholder: "Acme Inc" },
    { key: "website_url",  label: "Website URL",    placeholder: "https://acme.com" },
  ],
  terms_conditions: [
    { key: "company_name",        label: "Company Name",       placeholder: "Acme Inc" },
    { key: "website_url",         label: "Website URL",        placeholder: "https://acme.com" },
    { key: "services_description", label: "Services Description", placeholder: "SaaS contract management platform" },
  ],
  partnership: [
    { key: "partner_a",   label: "Partner A Name",     placeholder: "John Doe" },
    { key: "partner_b",   label: "Partner B Name",     placeholder: "Jane Smith" },
    { key: "business_name", label: "Business Name",    placeholder: "Acme Partners LLC" },
    { key: "split_a",     label: "Partner A Share %",  placeholder: "51" },
    { key: "split_b",     label: "Partner B Share %",  placeholder: "49" },
  ],
  internship: [
    { key: "company",     label: "Company Name",        placeholder: "Acme Corp" },
    { key: "intern_name", label: "Intern Full Name",    placeholder: "Alex Johnson" },
    { key: "duration",    label: "Duration",            placeholder: "3 months" },
    { key: "start_date",  label: "Start Date",          placeholder: "2026-09-01" },
    { key: "stipend",     label: "Monthly Stipend ($)", placeholder: "2000" },
  ],
};

const STEP_LABELS = ["Choose Type", "Fill Details", "Review & Download"];

const MOCK_DRAFT = `EMPLOYMENT AGREEMENT

This Employment Agreement ("Agreement") is entered into as of September 1, 2026, between:

EMPLOYER: Acme Corporation, a Delaware corporation ("Employer")
EMPLOYEE: Jane Smith ("Employee")

1. POSITION AND DUTIES
Employee is hired for the position of Senior Software Engineer. Employee agrees to perform duties as reasonably assigned by Employer.

2. COMPENSATION
Employer shall pay Employee an annual salary of $120,000, paid bi-weekly, subject to applicable tax withholdings.

3. BENEFITS
Employee shall be entitled to standard company benefits including health insurance, 401(k) matching up to 4%, and 15 days PTO annually.

4. CONFIDENTIALITY
Employee agrees to maintain confidentiality of all proprietary information during and after employment.

5. INTELLECTUAL PROPERTY
All work product created during employment shall be the sole property of Employer.

6. TERMINATION
Either party may terminate this agreement with 30 days written notice.

7. GOVERNING LAW
This Agreement shall be governed by the laws of the State of California.

___________________________          ___________________________
[EMPLOYER SIGNATURE]                  [EMPLOYEE SIGNATURE]
Acme Corporation                      Jane Smith
Date: ___________                     Date: ___________`;

export default function GeneratePage() {
  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const currentFields = selectedType ? (FORMS[selectedType] ?? []) : [];

  const handleTypeSelect = (id: string) => {
    setSelectedType(id);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 2500));
    setDraft(MOCK_DRAFT);
    setIsGenerating(false);
    setStep(2);
  };

  const handleCopy = () => {
    if (draft) {
      navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AppShell title="Contract Generator">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Stepper */}
        <div className="flex items-center justify-center gap-0">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex items-center">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${i < step ? "bg-primary text-white" : i === step ? "bg-primary/20 text-primary border-2 border-primary" : "bg-secondary text-muted-foreground"}`}>
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${i === step ? "text-primary" : "text-muted-foreground"}`}>{label}</span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className={`h-0.5 w-12 sm:w-24 mx-2 transition-all ${i < step ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 0: Choose type */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-semibold text-lg mb-1">Choose Contract Type</h2>
                <p className="text-sm text-muted-foreground mb-5">Select the type of contract you want to generate</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {CONTRACT_TYPES.map((ct) => (
                    <button
                      key={ct.id}
                      onClick={() => handleTypeSelect(ct.id)}
                      className={`p-4 rounded-2xl border text-left transition-all group
                        ${selectedType === ct.id ? "border-primary bg-primary/10 shadow-lg shadow-primary/10" : "border-border hover:border-primary/40 hover:bg-secondary"}`}
                    >
                      <div className="text-3xl mb-2">{ct.icon}</div>
                      <p className="text-sm font-semibold">{ct.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{ct.desc}</p>
                      {selectedType === ct.id && (
                        <div className="mt-2 flex items-center gap-1 text-primary text-xs font-medium">
                          <Check className="h-3 w-3" /> Selected
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <div className="mt-5 flex justify-end">
                  <button
                    onClick={() => selectedType && setStep(1)}
                    disabled={!selectedType}
                    className="btn-primary flex items-center gap-2 disabled:opacity-40"
                  >
                    Fill Details <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 1: Fill form */}
          {step === 1 && selectedType && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-3xl">{CONTRACT_TYPES.find((c) => c.id === selectedType)?.icon}</span>
                  <div>
                    <h2 className="font-semibold">{CONTRACT_TYPES.find((c) => c.id === selectedType)?.label}</h2>
                    <p className="text-sm text-muted-foreground">Fill in the contract details below</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {currentFields.map((field) => (
                    <div key={field.key} className="space-y-1.5">
                      <label className="text-sm font-medium">{field.label}</label>
                      <input
                        id={`field-${field.key}`}
                        type="text"
                        placeholder={field.placeholder}
                        value={formData[field.key] ?? ""}
                        onChange={(e) => setFormData((p) => ({ ...p, [field.key]: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-secondary/50 border border-input rounded-xl text-sm
                                   focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-between">
                  <button onClick={() => setStep(0)} className="px-4 py-2 rounded-xl border border-border text-sm hover:bg-secondary transition-colors">
                    ← Back
                  </button>
                  <button
                    id="generate-btn"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="btn-primary flex items-center gap-2 disabled:opacity-60"
                  >
                    {isGenerating ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
                    ) : (
                      <>Generate Contract <ChevronRight className="h-4 w-4" /></>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Draft */}
          {step === 2 && draft && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-emerald-500/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-sm font-semibold text-emerald-600">Contract Generated Successfully</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-sm hover:bg-secondary transition-colors">
                      {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                    <button className="btn-primary flex items-center gap-2 py-1.5">
                      <Download className="h-4 w-4" /> Download DOCX
                    </button>
                  </div>
                </div>
                <pre className="p-6 text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed max-h-[60vh] overflow-y-auto">
                  {draft}
                </pre>
              </div>
              <button onClick={() => { setStep(0); setSelectedType(null); setDraft(null); setFormData({}); }}
                className="mt-3 text-sm text-primary hover:underline">
                ← Generate another contract
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
