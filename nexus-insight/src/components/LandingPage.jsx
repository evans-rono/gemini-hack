import { motion } from 'framer-motion'
import {
  Brain, Zap, ArrowRight, Globe, FileSearch, Shield, BarChart3, Sparkles,
  BookOpen, Clock, Database, Cpu, Lock, FileText, CheckCircle, ChevronRight,
  Search, Layers, Users, Award, ArrowDown, ExternalLink, Mail, Github, Twitter,
} from 'lucide-react'

/* ── Static Data ── */

const STATS = [
  { value: '2.4M+', label: 'Papers Indexed' },
  { value: '<12s', label: 'Avg. Report Time' },
  { value: '99.2%', label: 'Accuracy Rate' },
  { value: '47', label: 'Data Sources' },
]

const FEATURES = [
  {
    icon: Search,
    title: 'Multi-Source Search',
    description: 'Simultaneously query Google Scholar, PubMed, arXiv, Semantic Scholar, and 43 other academic databases with a single prompt.',
  },
  {
    icon: Brain,
    title: 'AI Fact-Checking',
    description: 'Every claim is cross-referenced against our vector database of 2.4M verified papers. Hallucinations are flagged and removed automatically.',
  },
  {
    icon: FileText,
    title: 'Publication-Ready Reports',
    description: 'Generate structured, properly cited reports in APA, MLA, or Chicago format — ready for submission to journals or internal review.',
  },
  {
    icon: BarChart3,
    title: 'Statistical Analysis',
    description: 'Automatically extract and compare statistical data across papers. Visualize trends, detect methodological issues, and highlight outliers.',
  },
  {
    icon: Shield,
    title: 'Verified Citations',
    description: 'Every reference is traced back to its original source with DOI links. No fabricated citations, ever. Full bibliography included.',
  },
  {
    icon: Layers,
    title: 'Deep Cross-Referencing',
    description: 'Follow citation chains up to 3 levels deep. Discover foundational papers and emerging research that manual searches would miss.',
  },
]

const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Ask a Question',
    description: 'Type your research question in natural language. Nexus understands context, specificity, and domain nuance.',
  },
  {
    step: '02',
    title: 'AI Searches & Analyzes',
    description: 'Our agent searches 47 databases, downloads relevant PDFs, extracts key claims, and ranks them by relevance and reliability.',
  },
  {
    step: '03',
    title: 'Watch It Think',
    description: 'See the AI\'s reasoning process in real-time — every search query, every paper found, every fact-check — streamed live to your screen.',
  },
  {
    step: '04',
    title: 'Download Your Report',
    description: 'Get a publication-ready report with proper citations, statistical summaries, and methodology analysis in PDF, Word, or Markdown.',
  },
]

const TECH_STACK = [
  { name: 'GPT-4o', detail: 'Language backbone' },
  { name: 'Vector DB', detail: '2.4M documents' },
  { name: 'AES-256', detail: 'End-to-end encryption' },
  { name: 'PRISMA', detail: 'Review methodology' },
  { name: 'RAG Pipeline', detail: 'Retrieval-augmented' },
  { name: 'GPU Cluster', detail: 'A100 inference' },
]

const TESTIMONIALS = [
  {
    quote: 'Nexus cut my literature review time from 3 weeks to 20 minutes. The citations are flawless.',
    author: 'Dr. Sarah Chen',
    role: 'Stanford AI Lab',
  },
  {
    quote: 'We use it for every grant proposal now. The quality of synthesis is remarkable.',
    author: 'Prof. James Wright',
    role: 'MIT CSAIL',
  },
  {
    quote: 'Finally, an AI tool that doesn\'t hallucinate references. Every single citation checks out.',
    author: 'Dr. Aisha Patel',
    role: 'Oxford Biomedical Sciences',
  },
]

const FAQ_ITEMS = [
  {
    q: 'How accurate are the generated reports?',
    a: 'Nexus achieves 99.2% citation accuracy by cross-referencing every claim against our vector database and verifying DOI links. All sources are peer-reviewed.',
  },
  {
    q: 'What databases does Nexus search?',
    a: 'We query 47 sources including Google Scholar, PubMed, arXiv, Semantic Scholar, IEEE Xplore, Springer, Nature, and discipline-specific databases.',
  },
  {
    q: 'Can I export reports in different formats?',
    a: 'Yes — PDF, Microsoft Word, and Markdown are all supported. You can also choose citation styles: APA 7th, MLA, Chicago, or IEEE.',
  },
  {
    q: 'Is my research data secure?',
    a: 'All data is encrypted end-to-end with AES-256. We do not store your queries or generated reports after your session ends. SOC 2 Type II compliant.',
  },
  {
    q: 'How fast is the report generation?',
    a: 'Average time is under 12 seconds for a comprehensive report analyzing 10–20 papers. Complex queries with deep citation tracing may take up to 30 seconds.',
  },
]

/* ── Reusable Animation Variants ── */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.4, 0, 0.2, 1] },
  }),
}

/* ── Section Wrapper ── */

function Section({ children, className = '', id }) {
  return (
    <motion.section
      id={id}
      className={`relative px-6 sm:px-10 lg:px-20 ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
    >
      {children}
    </motion.section>
  )
}

function SectionLabel({ children }) {
  return (
    <motion.div variants={fadeUp} className="flex items-center gap-2 mb-4">
      <div className="h-px w-8 bg-electric/30" />
      <span className="text-[11px] font-bold text-electric/60 uppercase tracking-[0.18em]">
        {children}
      </span>
      <div className="h-px w-8 bg-electric/30" />
    </motion.div>
  )
}

function SectionTitle({ children }) {
  return (
    <motion.h2
      variants={fadeUp}
      custom={1}
      className="text-3xl sm:text-4xl font-serif font-bold text-paper tracking-tight mb-4"
    >
      {children}
    </motion.h2>
  )
}

function SectionSubtitle({ children }) {
  return (
    <motion.p
      variants={fadeUp}
      custom={2}
      className="text-base text-slate-500 max-w-xl leading-relaxed mb-12"
    >
      {children}
    </motion.p>
  )
}

/* ── Main Component ── */

export default function LandingPage({ onStart }) {
  return (
    <motion.div
      className="w-full h-full overflow-y-auto overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
    >
      {/* ━━ Fixed Navigation ━━ */}
      <nav className="sticky top-0 z-50 glass-strong border-b border-slate-800/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 sm:px-10 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-electric/10 border border-electric/20 flex items-center justify-center">
              <Brain className="w-4.5 h-4.5 text-electric" />
            </div>
            <span className="text-sm font-bold tracking-wider text-slate-300 uppercase">
              Nexus Insight
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-8">
            <a href="#features" className="text-xs text-slate-500 hover:text-paper transition-colors">Features</a>
            <a href="#how-it-works" className="text-xs text-slate-500 hover:text-paper transition-colors">How It Works</a>
            <a href="#tech" className="text-xs text-slate-500 hover:text-paper transition-colors">Technology</a>
            <a href="#faq" className="text-xs text-slate-500 hover:text-paper transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-light">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-emerald-400/80 font-medium">All Systems Online</span>
            </div>
            <button
              onClick={onStart}
              className="flex items-center gap-2 px-4 py-2 bg-electric hover:bg-electric-light rounded-xl text-paper text-xs font-semibold transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              Launch App
            </button>
          </div>
        </div>
      </nav>

      {/* ━━ Hero Section ━━ */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 noise-overlay">
        {/* Background effects */}
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.08)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(96,165,250,0.05)_0%,transparent_50%)]" />

        {/* Badge */}
        <motion.div
          className="relative z-10 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full glass shimmer border border-electric/10">
            <Sparkles className="w-3.5 h-3.5 text-electric-glow" />
            <span className="text-[11px] font-semibold text-slate-400 tracking-widest uppercase">
              AI-Powered Research Engine — v3.2
            </span>
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h1
          className="relative z-10 max-w-5xl"
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.8 }}
        >
          <span className="block font-serif text-5xl sm:text-6xl md:text-[5.2rem] font-bold leading-[1.05] bg-linear-to-b from-paper via-paper/95 to-slate-500 bg-clip-text text-transparent tracking-tight">
            Research at the
          </span>
          <span className="block font-serif text-5xl sm:text-6xl md:text-[5.2rem] font-bold leading-[1.05] bg-linear-to-r from-electric-dark via-electric-glow to-electric bg-clip-text text-transparent mt-1 tracking-tight">
            Speed of Thought.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="relative z-10 mt-7 text-base sm:text-lg text-slate-500 max-w-lg leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.6 }}
        >
          Synthesize thousands of academic sources, analyze data, and generate
          publication-ready reports — in seconds, not weeks.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="relative z-10 mt-10 flex items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <motion.button
            className="group flex items-center gap-3 px-8 py-4 bg-electric hover:bg-electric-light rounded-2xl text-paper font-semibold text-base transition-all duration-300 cursor-pointer relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStart}
          >
            <Zap className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Start Research</span>
            <ArrowRight className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1" />
            <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <div className="absolute -inset-1 rounded-2xl bg-electric/20 blur-xl -z-10 group-hover:bg-electric/30 transition-all" />
          </motion.button>
          <motion.button
            className="flex items-center gap-2 px-6 py-4 rounded-2xl border border-slate-800 text-slate-400 hover:text-paper hover:border-slate-700 font-medium text-base transition-all cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Globe className="w-4 h-4" />
            View Demo
          </motion.button>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          className="relative z-10 mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          {STATS.map((stat, i) => (
            <div key={stat.label} className="flex flex-col items-center">
              <span className="text-2xl font-bold text-paper tabular-nums tracking-tight">{stat.value}</span>
              <span className="text-[11px] text-slate-600 mt-1 font-medium">{stat.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 z-10"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ArrowDown className="w-5 h-5 text-slate-700" />
        </motion.div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-linear-to-t from-slate-950 to-transparent" />
      </section>

      {/* ━━ Features Grid ━━ */}
      <Section id="features" className="py-24 max-w-7xl mx-auto">
        <SectionLabel>Capabilities</SectionLabel>
        <SectionTitle>Everything you need for research</SectionTitle>
        <SectionSubtitle>
          From initial query to publication-ready report, Nexus handles every step
          of the research pipeline with precision and transparency.
        </SectionSubtitle>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              custom={i + 3}
              className="group p-6 rounded-2xl border border-slate-800/50 bg-slate-900/30 hover:bg-slate-900/50 hover:border-slate-700/50 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-electric/8 border border-electric/15 flex items-center justify-center mb-4 group-hover:bg-electric/12 transition-colors">
                <feature.icon className="w-5 h-5 text-electric-glow/70" />
              </div>
              <h3 className="text-[15px] font-semibold text-paper mb-2">{feature.title}</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ━━ How It Works ━━ */}
      <Section id="how-it-works" className="py-24 max-w-5xl mx-auto">
        <SectionLabel>Process</SectionLabel>
        <SectionTitle>How Nexus works</SectionTitle>
        <SectionSubtitle>
          Four simple steps from question to comprehensive research report.
          Watch the AI think in real-time.
        </SectionSubtitle>

        <div className="space-y-6">
          {WORKFLOW_STEPS.map((step, i) => (
            <motion.div
              key={step.step}
              variants={fadeUp}
              custom={i + 3}
              className="flex items-start gap-6 p-6 rounded-2xl border border-slate-800/40 bg-slate-900/20 hover:border-slate-700/50 transition-all group"
            >
              <div className="shrink-0 w-12 h-12 rounded-xl bg-electric/8 border border-electric/15 flex items-center justify-center text-electric font-mono font-bold text-sm group-hover:bg-electric/15 transition-colors">
                {step.step}
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-paper mb-1.5">{step.title}</h3>
                <p className="text-[13px] text-slate-500 leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ━━ Technology Stack ━━ */}
      <Section id="tech" className="py-24 max-w-5xl mx-auto">
        <SectionLabel>Under the Hood</SectionLabel>
        <SectionTitle>Built with cutting-edge technology</SectionTitle>
        <SectionSubtitle>
          Enterprise-grade infrastructure designed for speed, accuracy, and security.
        </SectionSubtitle>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {TECH_STACK.map((tech, i) => (
            <motion.div
              key={tech.name}
              variants={fadeUp}
              custom={i + 3}
              className="flex flex-col items-center p-5 rounded-2xl border border-slate-800/40 bg-slate-900/20 hover:border-electric/15 transition-all"
            >
              <span className="text-sm font-bold text-paper font-mono">{tech.name}</span>
              <span className="text-[11px] text-slate-600 mt-1">{tech.detail}</span>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ━━ Testimonials ━━ */}
      <Section className="py-24 max-w-6xl mx-auto">
        <SectionLabel>Trusted By Researchers</SectionLabel>
        <SectionTitle>What researchers are saying</SectionTitle>
        <SectionSubtitle>
          Used by teams at leading universities and research institutions worldwide.
        </SectionSubtitle>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.author}
              variants={fadeUp}
              custom={i + 3}
              className="p-6 rounded-2xl border border-slate-800/40 bg-slate-900/20"
            >
              <p className="text-[13px] text-slate-400 leading-relaxed mb-5 italic">
                "{t.quote}"
              </p>
              <div>
                <p className="text-[13px] font-semibold text-paper">{t.author}</p>
                <p className="text-[11px] text-slate-600 mt-0.5">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ━━ FAQ ━━ */}
      <Section id="faq" className="py-24 max-w-3xl mx-auto">
        <SectionLabel>Questions</SectionLabel>
        <SectionTitle>Frequently asked questions</SectionTitle>
        <SectionSubtitle>
          Everything you need to know about Nexus Insight.
        </SectionSubtitle>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item, i) => (
            <motion.details
              key={i}
              variants={fadeUp}
              custom={i + 3}
              className="group p-5 rounded-2xl border border-slate-800/40 bg-slate-900/20 hover:border-slate-700/50 transition-all cursor-pointer"
            >
              <summary className="flex items-center justify-between list-none text-[14px] font-semibold text-paper">
                {item.q}
                <ChevronRight className="w-4 h-4 text-slate-600 transition-transform group-open:rotate-90 shrink-0 ml-4" />
              </summary>
              <p className="text-[13px] text-slate-500 leading-relaxed mt-3 pt-3 border-t border-slate-800/30">
                {item.a}
              </p>
            </motion.details>
          ))}
        </div>
      </Section>

      {/* ━━ CTA Banner ━━ */}
      <Section className="py-24 max-w-4xl mx-auto text-center">
        <motion.div
          variants={fadeUp}
          className="p-10 sm:p-14 rounded-3xl border border-slate-800/50 bg-linear-to-b from-slate-900/50 to-slate-950/50 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.06)_0%,transparent_70%)]" />
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-paper mb-4 tracking-tight">
              Ready to accelerate your research?
            </h2>
            <p className="text-base text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">
              Join thousands of researchers using Nexus to produce better work, faster.
            </p>
            <motion.button
              className="inline-flex items-center gap-3 px-8 py-4 bg-electric hover:bg-electric-light rounded-2xl text-paper font-semibold text-base transition-colors cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStart}
            >
              <Zap className="w-5 h-5" />
              Start Free Research
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </Section>

      {/* ━━ Footer ━━ */}
      <footer className="border-t border-slate-800/30 mt-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="sm:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-electric" />
                <span className="text-sm font-bold text-paper tracking-wide">Nexus Insight</span>
              </div>
              <p className="text-[12px] text-slate-600 leading-relaxed">
                AI-powered research engine for academics, scientists, and professionals.
              </p>
            </div>

            {/* Product */}
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-3">Product</p>
              <ul className="space-y-2">
                {['Features', 'Pricing', 'API Access', 'Changelog'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-[12px] text-slate-600 hover:text-paper transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-3">Company</p>
              <ul className="space-y-2">
                {['About', 'Blog', 'Careers', 'Contact'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-[12px] text-slate-600 hover:text-paper transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-3">Legal</p>
              <ul className="space-y-2">
                {['Privacy Policy', 'Terms of Service', 'Security', 'GDPR'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-[12px] text-slate-600 hover:text-paper transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-800/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-slate-700">
              © 2026 Nexus Insight. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-slate-700 hover:text-paper transition-colors"><Github className="w-4 h-4" /></a>
              <a href="#" className="text-slate-700 hover:text-paper transition-colors"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="text-slate-700 hover:text-paper transition-colors"><Mail className="w-4 h-4" /></a>
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  )
}
