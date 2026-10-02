"use client";

import { useState, useEffect } from "react";
import { 
  Ticket, 
  Save, 
  RefreshCw, 
  ExternalLink, 
  Check, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sparkles,
  Link as LinkIcon,
  Tag,
  DollarSign
} from "lucide-react";
import TicketButton, { DEFAULT_TICKET_FORM_URL } from "@/components/TicketButton";

interface TicketData {
  isActive: boolean;
  formUrl: string;
  title: string;
  eventTag: string;
  admitText: string;
  serialNumber: string;
  priceText?: string;
}

export default function TicketManager() {
  const [isActive, setIsActive] = useState(false);
  const [formUrl, setFormUrl] = useState(DEFAULT_TICKET_FORM_URL);
  const [title, setTitle] = useState("BUY TICKETS");
  const [eventTag, setEventTag] = useState("HBC 2026");
  const [admitText, setAdmitText] = useState("ADMIT ONE");
  const [serialNumber, setSerialNumber] = useState("№ 270926");
  const [priceText, setPriceText] = useState("");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTicketSettings();
  }, []);

  const fetchTicketSettings = async () => {
    try {
      setFetching(true);
      setError("");
      const res = await fetch("/api/ticket");
      const data = await res.json();
      if (data) {
        setIsActive(!!data.isActive);
        setFormUrl(data.formUrl || DEFAULT_TICKET_FORM_URL);
        setTitle(data.title || "BUY TICKETS");
        setEventTag(data.eventTag || "HBC 2026");
        setAdmitText(data.admitText || "ADMIT ONE");
        setSerialNumber(data.serialNumber || "№ 270926");
        setPriceText(data.priceText || "");
      }
    } catch (err: any) {
      console.error("Error fetching ticket settings:", err);
      setError("Failed to load ticket settings from database.");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaveSuccess(false);

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isActive,
          formUrl,
          title,
          eventTag,
          admitText,
          serialNumber,
          priceText,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save ticket settings");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to update ticket settings.");
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset: "championship2026" | "championship2027" | "jam") => {
    if (preset === "championship2026") {
      setTitle("BUY TICKETS");
      setEventTag("HBC 2026");
      setAdmitText("ADMIT ONE");
      setSerialNumber("№ 270926");
      setPriceText("");
    } else if (preset === "championship2027") {
      setTitle("BUY TICKETS");
      setEventTag("HBC 2027");
      setAdmitText("ADMIT ONE");
      setSerialNumber("№ 202701");
      setPriceText("₹350");
    } else if (preset === "jam") {
      setTitle("REGISTER FOR JAM");
      setEventTag("HYD BBX JAM");
      setAdmitText("ENTRY PASS");
      setSerialNumber("№ HYD001");
      setPriceText("FREE");
    }
  };

  return (
    <div className="glass-effect p-6 md:p-8 rounded-xl max-w-5xl mx-auto shadow-2xl border border-white/10 text-white font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-[#EAFF00] text-xs font-bold uppercase tracking-wider mb-1">
            <Ticket className="w-4 h-4" /> Homepage Ticket Control
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Manage Championship & Event Tickets
          </h2>
          <p className="text-white/60 text-sm mt-1">
            Turn the vintage ticket button ON or OFF on the homepage hero, customize the link, title, and date stamps.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchTicketSettings}
          disabled={fetching}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-colors self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${fetching ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Alerts */}
      {saveSuccess && (
        <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-xl flex items-center gap-3 text-emerald-300">
          <Check className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-semibold">
            Ticket configurations saved successfully! Changes are immediately live on the homepage.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-rose-500/20 border border-rose-500/40 rounded-xl flex items-center gap-3 text-rose-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Toggle Switch Spotlight Card */}
        <div className={`p-6 rounded-2xl border transition-all duration-300 ${
          isActive 
            ? "bg-[#EAFF00]/10 border-[#EAFF00]/40 shadow-[0_0_30px_rgba(234,255,0,0.15)]" 
            : "bg-white/[0.03] border-white/10"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${isActive ? "bg-[#EAFF00] animate-pulse" : "bg-neutral-600"}`} />
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Homepage Ticket Button Status:
                  <span className={isActive ? "text-[#EAFF00]" : "text-white/50"}>
                    {isActive ? "ACTIVE & VISIBLE" : "HIDDEN / INACTIVE"}
                  </span>
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-white/60">
                {isActive 
                  ? "The ticket button is currently active and rendered on the homepage hero slider above the fold."
                  : "The ticket button is completely hidden from the homepage. Turn ON whenever tickets go on sale."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#EAFF00] focus:ring-offset-2 focus:ring-offset-black ${
                isActive ? "bg-[#EAFF00]" : "bg-neutral-700"
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-black transition-transform ${
                  isActive ? "translate-x-9" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Live Visual Interactive Preview */}
        <div className="p-6 rounded-2xl bg-black/60 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#EAFF00] uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> Live Interactive Preview
            </div>
            <span className="text-xs text-white/40 italic">
              Hover over ticket to test fan-out animation
            </span>
          </div>

          <div className="py-6 flex flex-col items-center justify-center bg-radial from-purple-950/20 via-black to-black rounded-xl border border-white/5 overflow-hidden">
            <TicketButton
              formUrl={formUrl}
              title={title}
              eventTag={eventTag}
              admitText={admitText}
              serialNumber={serialNumber}
              priceText={priceText}
            />
            {!isActive && (
              <p className="text-xs text-amber-400 mt-4 flex items-center gap-1 font-mono">
                <EyeOff className="w-3.5 h-3.5" /> Note: This preview is interactive, but the button is currently marked Inactive for visitors.
              </p>
            )}
          </div>
        </div>

        {/* Configuration Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Form URL */}
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-white/90 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-[#EAFF00]" /> Ticket Purchase / Registration URL
              </label>
              {formUrl && (
                <a
                  href={formUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#EAFF00] hover:underline flex items-center gap-1"
                >
                  Test Link <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <input
              type="url"
              required
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
              placeholder="https://docs.google.com/forms/d/e/... or https://insider.in/..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#EAFF00] transition-colors"
            />
            <p className="text-xs text-white/40">
              Paste your Google Form, BookMyShow, PayTM Insider, or custom checkout link.
            </p>
          </div>

          {/* Button Title */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white/90 flex items-center gap-2">
              <Tag className="w-4 h-4 text-violet-400" /> Button Headline
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="BUY TICKETS"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#EAFF00] transition-colors font-bold uppercase tracking-wider"
            />
            <p className="text-xs text-white/40">
              Primary bold text (e.g., BUY TICKETS, REGISTER NOW, BOOK PASSES).
            </p>
          </div>

          {/* Event Tag */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white/90 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Event Tag / Edition
            </label>
            <input
              type="text"
              required
              value={eventTag}
              onChange={(e) => setEventTag(e.target.value)}
              placeholder="HBC 2026"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#EAFF00] transition-colors font-mono uppercase"
            />
            <p className="text-xs text-white/40">
              Shown on ticket badge (e.g., HBC 2026, HBC 2027, HYD BBX JAM).
            </p>
          </div>

          {/* Admit Text */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white/90">
              Admission Tag
            </label>
            <input
              type="text"
              required
              value={admitText}
              onChange={(e) => setAdmitText(e.target.value)}
              placeholder="ADMIT ONE"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#EAFF00] transition-colors font-mono uppercase"
            />
            <p className="text-xs text-white/40">
              Default: &ldquo;ADMIT ONE&rdquo; or &ldquo;VIP PASS&rdquo; or &ldquo;ENTRY PASS&rdquo;.
            </p>
          </div>

          {/* Serial Number / Date Code */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white/90">
              Serial Stamp / Date Stamp
            </label>
            <input
              type="text"
              required
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="№ 270926"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#EAFF00] transition-colors font-mono"
            />
            <p className="text-xs text-white/40">
              Vintage serial code printed vertically (e.g., № 270926).
            </p>
          </div>

          {/* Price / Stub text (Optional) */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-semibold text-white/90 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Right Stub Badge (Optional Price or Text)
            </label>
            <input
              type="text"
              value={priceText}
              onChange={(e) => setPriceText(e.target.value)}
              placeholder="ENTRY (or ₹350, FREE, VIP)"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#EAFF00] transition-colors font-mono"
            />
            <p className="text-xs text-white/40">
              Leave blank to display &ldquo;ENTRY&rdquo;, or provide a price like &ldquo;₹350&rdquo; or &ldquo;FREE&rdquo;.
            </p>
          </div>

        </div>

        {/* Quick Presets */}
        <div className="pt-2">
          <label className="text-xs font-bold text-white/50 uppercase tracking-wider block mb-2">
            Quick 1-Click Presets:
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset("championship2026")}
              className="text-xs px-3 py-1.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 text-purple-300 transition-colors"
            >
              HBC 2026 Preset
            </button>
            <button
              type="button"
              onClick={() => applyPreset("championship2027")}
              className="text-xs px-3 py-1.5 rounded-lg bg-yellow-950/40 hover:bg-yellow-900/50 border border-yellow-500/30 text-yellow-300 transition-colors"
            >
              HBC 2027 Preset
            </button>
            <button
              type="button"
              onClick={() => applyPreset("jam")}
              className="text-xs px-3 py-1.5 rounded-lg bg-blue-950/40 hover:bg-blue-900/50 border border-blue-500/30 text-blue-300 transition-colors"
            >
              Community Jam Preset
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-end gap-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#EAFF00] to-yellow-400 text-black font-extrabold text-sm rounded-xl hover:shadow-[0_0_25px_rgba(234,255,0,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Ticket Settings
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
