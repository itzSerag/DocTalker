import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  FileText,
  Globe,
  Video,
  PenTool,
  Check,
  Sparkles,
  ChevronRight,
  Menu,
  X,
  Layers,
} from "lucide-react";
import HeroScene from "../components/3d/HeroScene";

interface ModalityDemo {
  id: "pdf" | "youtube" | "handwritten" | "web";
  title: string;
  icon: React.ElementType;
  color: string;
  badge: string;
  sourceTitle: string;
  sourcePreview: string;
  sampleQuestion: string;
  sampleAnswer: string;
  citations: Array<{ page: string; text: string }>;
}

const DEMOS: ModalityDemo[] = [
  {
    id: "pdf",
    title: "PDF & Research Papers",
    icon: FileText,
    color: "#60A5FA",
    badge: "Vector Cosine Search",
    sourceTitle: "Quarterly_Financial_Report_Q3.pdf",
    sourcePreview:
      "Section 4.2: Operating margins expanded by 14.8% YoY driven by enterprise adoption and automated procurement workflows across APAC regions...",
    sampleQuestion: "What drove the operating margin expansion in APAC?",
    sampleAnswer:
      "Operating margins expanded by 14.8% year-over-year primarily due to increased enterprise customer adoption and streamlined automated procurement workflows across Asia-Pacific.",
    citations: [
      { page: "p. 14", text: "APAC Procurement Workflow Analysis" },
      { page: "p. 18", text: "Consolidated Balance Sheets" },
    ],
  },
  {
    id: "youtube",
    title: "YouTube Video Lectures",
    icon: Video,
    color: "#F59E0B",
    badge: "Timestamped Transcripts",
    sourceTitle: "Stanford_CS229_Lecture_04.mp4",
    sourcePreview:
      "[04:12] Today we're deriving the gradient of logistic loss...\n[12:45] Notice how the sigmoid saturation curve affects backprop gradients...",
    sampleQuestion:
      "At what point does the lecturer explain sigmoid saturation?",
    sampleAnswer:
      "The lecturer explains sigmoid saturation at [12:45], demonstrating how extreme input values shrink gradients during backpropagation and slow down gradient descent.",
    citations: [
      { page: "12:45", text: "Sigmoid saturation & backprop mechanics" },
      { page: "18:20", text: "Comparison with ReLU activations" },
    ],
  },
  {
    id: "handwritten",
    title: "Handwritten Notes & OCR",
    icon: PenTool,
    color: "#34D399",
    badge: "Multimodal Vision OCR",
    sourceTitle: "Meeting_Whiteboard_Synthesis.png",
    sourcePreview:
      "Sprint Goal: Transition embeddings to OpenAI text-embedding-3-small.\n- Action Item: Serag to verify S3 bucket key permissions\n- Target deployment: Friday 18:00 UTC",
    sampleQuestion: "Who is responsible for the S3 bucket key verification?",
    sampleAnswer:
      "According to the whiteboard notes, Serag is assigned to verify the S3 bucket key permissions before the target deployment scheduled for Friday at 18:00 UTC.",
    citations: [
      { page: "Whiteboard #1", text: "Action items & owner assignments" },
    ],
  },
  {
    id: "web",
    title: "Live Web Articles",
    icon: Globe,
    color: "#A78BFA",
    badge: "Cheerio DOM Scraper",
    sourceTitle: "https://stripe.com/docs/payments/api",
    sourcePreview:
      "Payment Intents encapsulate the complete lifecycle of customer checkout, handling SCA 3D Secure challenges automatically...",
    sampleQuestion: "How do Payment Intents handle 3D Secure authentication?",
    sampleAnswer:
      "Payment Intents automatically trigger dynamic Strong Customer Authentication (SCA) and 3D Secure modal flows when required by European banking regulations.",
    citations: [{ page: "API Doc", text: "Authentication & SCA Flows" }],
  },
];

const PRICING_PLANS = [
  {
    name: "Free Starter",
    price: "$0",
    desc: "Essential document chat for students and occasional readers.",
    features: [
      "50 monthly queries",
      "5 document slots",
      "PDF, DOCX & Web Ingestion",
      "Exact page citations",
      "Community support",
    ],
    highlight: false,
    cta: "Start Free",
    link: "/signup",
  },
  {
    name: "Pro Researcher",
    price: "$12",
    period: "/ month",
    badge: "Most Popular",
    desc: "Built for researchers, analysts, and students handling heavy workloads.",
    features: [
      "1,000 monthly queries",
      "Unlimited document slots",
      "All 4 modalities: PDF, YouTube, Web & OCR",
      "OpenAI & Gemini dual-model engine",
      "Priority embedding indexing",
      "Export chat & citations to Markdown",
    ],
    highlight: true,
    cta: "Upgrade to Pro",
    link: "/signup",
  },
  {
    name: "Team & Enterprise",
    price: "$49",
    period: "/ month",
    desc: "Collaborative workspaces with dedicated infrastructure and security.",
    features: [
      "Unlimited queries",
      "Shared team folders & workspaces",
      "Dedicated high-speed embedding throughput",
      "Custom S3 bucket connection",
      "SOC2-compliant storage",
      "Priority 24/7 engineering support",
    ],
    highlight: false,
    cta: "Contact Sales",
    link: "/signup",
  },
];

export const LandingPage: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<ModalityDemo>(DEMOS[0]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas text-slate-100 selection:bg-brand-500/30 selection:text-white">
      {/* ─── Top Navigation ──────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-canvas/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-brand-sm">
              <Layers size={18} />
            </div>
            <span className="text-base font-bold tracking-tight text-white">
              Doc<span className="text-brand-400">Talker</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#capabilities"
              className="text-sm font-medium text-slate-400 transition hover:text-slate-200"
            >
              Capabilities
            </a>
            <a
              href="#interactive-demo"
              className="text-sm font-medium text-slate-400 transition hover:text-slate-200"
            >
              Live Demo
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-400 transition hover:text-slate-200"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-slate-400 transition hover:text-slate-200"
            >
              Pricing
            </a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="btn btn-primary btn-md shadow-brand-sm"
            >
              <span>Get Started</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 md:hidden hover:text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="border-b border-white/[0.08] bg-base px-6 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              <a
                href="#capabilities"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 text-sm text-slate-300"
              >
                Capabilities
              </a>
              <a
                href="#interactive-demo"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 text-sm text-slate-300"
              >
                Live Demo
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 text-sm text-slate-300"
              >
                Pricing
              </a>
              <div className="mt-2 flex flex-col gap-2 pt-2 border-t border-white/[0.08]">
                <Link
                  to="/login"
                  className="w-full py-2 text-center text-sm font-medium text-slate-300"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="btn btn-primary btn-md w-full justify-center"
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ─── Hero Section with 3D Canvas ─────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-36">
        <HeroScene />

        {/* Ambient atmospheric glows */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-brand-600/15 blur-[120px]" />
        <div className="pointer-events-none absolute top-48 right-10 -z-10 h-72 w-72 rounded-full bg-amber-500/10 blur-[100px]" />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-400/25 bg-brand-500/10 px-3.5 py-1 text-xs font-semibold text-brand-300 backdrop-blur-sm">
            <Sparkles size={12} className="text-amber-400" />
            <span>Next-Gen Multimodal Document Intelligence</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
            Your Documents. <br />
            <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-amber-300 bg-clip-text text-transparent">
              Now They Talk Back.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg sm:leading-8">
            Upload dense PDFs, paste YouTube lecture URLs, import web articles,
            or snap handwritten meeting notes. Chat with pinpoint footnotes that
            jump straight to source lines.
          </p>

          {/* CTA Group */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/signup"
              className="btn btn-primary btn-lg shadow-brand-md px-7 py-3 text-sm font-semibold"
            >
              <span>Launch Workspace Free</span>
              <ArrowRight size={16} />
            </Link>
            <a
              href="#interactive-demo"
              className="btn btn-secondary btn-lg border-white/10 bg-surface-1/60 px-6 py-3 text-sm font-medium backdrop-blur-sm hover:bg-surface-2"
            >
              <span>Explore Interactive Demo</span>
            </a>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            No credit card required · 50 complimentary vector queries included
          </p>
        </div>
      </section>

      {/* ─── Capabilities Overview (The 4 Modalities) ─────────── */}
      <section
        id="capabilities"
        className="py-20 border-t border-white/[0.06] bg-base/50"
      >
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
              Unrivaled Versatility
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-4xl">
              Four Superpowers in a Single Workspace
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              DocTalker breaks the limits of standard PDF readers by accepting
              virtually any knowledge source.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {DEMOS.map((demo) => {
              const Icon = demo.icon;
              return (
                <div
                  key={demo.id}
                  onClick={() => {
                    setActiveDemo(demo);
                    document
                      .getElementById("interactive-demo")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="group relative cursor-pointer rounded-2xl border border-white/[0.08] bg-surface-0/60 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-brand-400/40 hover:bg-surface-1/80 hover:shadow-lg"
                >
                  <div
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition group-hover:scale-105"
                    style={{ background: `${demo.color}18`, color: demo.color }}
                  >
                    <Icon size={24} />
                  </div>
                  <span className="inline-block mb-2 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {demo.badge}
                  </span>
                  <h3 className="text-base font-semibold text-white group-hover:text-brand-300">
                    {demo.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    {demo.id === "pdf" &&
                      "Index multi-hundred page documents with vector embeddings and instant page footnotes."}
                    {demo.id === "youtube" &&
                      "Automated transcript extraction with jump-to-second video timestamps."}
                    {demo.id === "handwritten" &&
                      "Vision AI reads whiteboards, handwritten meeting notes, and formulas."}
                    {demo.id === "web" &&
                      "Paste URLs to scrape clean article text, bypassing ads and cookie banners."}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand-400 opacity-0 transition group-hover:opacity-100">
                    <span>Try demo</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Interactive Live Demo Stage ─────────────────────── */}
      <section
        id="interactive-demo"
        className="py-24 border-t border-white/[0.06]"
      >
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Interactive Showcase
              </span>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                See How DocTalker Understands Knowledge
              </h2>
            </div>

            {/* Modality switcher tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 rounded-xl border border-white/10 bg-surface-0/80">
              {DEMOS.map((demo) => (
                <button
                  key={demo.id}
                  onClick={() => setActiveDemo(demo)}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                    activeDemo.id === demo.id
                      ? "bg-brand-600 text-white shadow-brand-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <demo.icon size={14} />
                  <span>{demo.title.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Stage Canvas */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-base shadow-2xl">
            {/* Window chrome header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] bg-canvas px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 text-xs font-mono text-slate-500">
                  doctalker.ai/workspace/live-session
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xs font-semibold uppercase tracking-wider text-slate-400 bg-surface-1 px-2 py-0.5 rounded border border-white/5">
                  Dual-Engine: OpenAI + Gemini
                </span>
              </div>
            </div>

            {/* Split Pane Demo Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
              {/* Left Pane: Document Source Preview */}
              <div className="p-6 sm:p-8 bg-surface-0/40">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="p-2 rounded-lg"
                      style={{
                        background: `${activeDemo.color}20`,
                        color: activeDemo.color,
                      }}
                    >
                      <activeDemo.icon size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white truncate max-w-[200px]">
                        {activeDemo.sourceTitle}
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        {activeDemo.badge}
                      </span>
                    </div>
                  </div>
                  <span className="text-2xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    ● Processed
                  </span>
                </div>

                <div className="rounded-xl border border-white/5 bg-canvas/70 p-5 font-mono text-xs leading-relaxed text-slate-300 whitespace-pre-wrap min-h-[220px]">
                  {activeDemo.sourcePreview}
                </div>
              </div>

              {/* Right Pane: Conversation & Grounded Footnotes */}
              <div className="p-6 sm:p-8 flex flex-col justify-between bg-surface-0/70">
                <div className="space-y-4">
                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-brand-600 px-4 py-2.5 text-xs text-white shadow-sm">
                      {activeDemo.sampleQuestion}
                    </div>
                  </div>

                  {/* Assistant response */}
                  <div className="flex justify-start">
                    <div className="max-w-[95%] rounded-2xl rounded-tl-xs border border-white/[0.08] bg-surface-1 p-4 text-xs leading-relaxed text-slate-200">
                      <p>{activeDemo.sampleAnswer}</p>

                      {/* Footnote citations */}
                      <div className="mt-4 pt-3 border-t border-white/[0.08]">
                        <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                          Verified Sources & Footnotes
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {activeDemo.citations.map((c, i) => (
                            <span
                              key={i}
                              className="citation-chip cursor-pointer"
                              title={c.text}
                            >
                              <FileText size={10} />
                              <span>{c.page}</span>
                              <span className="text-slate-400 font-normal">
                                · {c.text}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulated prompt box */}
                <div className="mt-6 flex items-center justify-between rounded-xl border border-white/10 bg-canvas px-3.5 py-2.5 text-xs text-slate-500">
                  <span>Ask anything about this {activeDemo.id}...</span>
                  <div className="flex items-center gap-1.5 text-2xs font-mono text-brand-400">
                    <span>Return ↵</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works Workflow ───────────────────────────── */}
      <section
        id="how-it-works"
        className="py-24 border-t border-white/[0.06] bg-base/40"
      >
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
              Architectural Rigor
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-4xl">
              Zero Hallucinations. Pure Grounding.
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Unified Ingestion",
                desc: "Documents, YouTube videos, and photos are cleaned, tokenized, and split into overlapping semantic chunks.",
              },
              {
                step: "02",
                title: "Vector Embedding Matrix",
                desc: "High-dimensional embeddings index every sentence into cosine similarity vectors for ultra-fast retrieval.",
              },
              {
                step: "03",
                title: "Grounded Synthesis",
                desc: "State-of-the-art LLMs synthesize answers strictly constrained to top matching chunks, citing exact page numbers.",
              },
            ].map((st) => (
              <div
                key={st.step}
                className="relative rounded-2xl border border-white/[0.08] bg-surface-0/50 p-8 transition hover:border-white/20 hover:bg-surface-0"
              >
                <span className="font-mono text-4xl font-extrabold text-brand-500/30">
                  {st.step}
                </span>
                <h3 className="mt-4 text-base font-bold text-white">
                  {st.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing Section ─────────────────────────────────── */}
      <section id="pricing" className="py-24 border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Transparent Investment
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-4xl">
              Simple, Predictable Plans
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Start free today and upgrade as your document library grows.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col justify-between rounded-3xl border p-8 transition-all ${
                  plan.highlight
                    ? "border-brand-500/50 bg-gradient-to-b from-brand-950/40 via-surface-0 to-surface-0 shadow-brand-md"
                    : "border-white/[0.08] bg-surface-0/50 hover:border-white/20"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-brand-500 px-3.5 py-1 text-2xs font-bold uppercase tracking-wider text-white shadow-sm">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tight text-white">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-xs text-slate-400">
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                    {plan.desc}
                  </p>

                  <ul className="mt-8 space-y-3.5 border-t border-white/[0.08] pt-6">
                    {plan.features.map((feat, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2.5 text-xs text-slate-300"
                      >
                        <Check
                          size={14}
                          className="shrink-0 text-emerald-400"
                        />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4">
                  <Link
                    to={plan.link}
                    className={`btn w-full justify-center text-xs font-semibold py-2.5 ${
                      plan.highlight
                        ? "btn-primary shadow-brand-sm"
                        : "btn-secondary border-white/10 hover:bg-surface-2"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.08] bg-canvas py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 sm:flex-row sm:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Layers size={14} />
            </div>
            <span className="text-sm font-bold text-white">DocTalker</span>
            <span className="text-xs text-slate-500">
              © {new Date().getFullYear()} DocTalker Systems. All rights
              reserved.
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link to="/login" className="hover:text-white transition">
              Sign In
            </Link>
            <Link to="/signup" className="hover:text-white transition">
              Create Account
            </Link>
            <a href="#capabilities" className="hover:text-white transition">
              Modalities
            </a>
            <a href="#pricing" className="hover:text-white transition">
              Pricing
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
