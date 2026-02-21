import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  shortTermBackends, longTermBackends, getMemoryCommonSteps,
  type MemoryBackend
} from "@/data/memoryData";
import { platforms, type Platform } from "@/data/installData";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CodeBlock from "@/components/CodeBlock";
import StepNavigator from "@/components/StepNavigator";
import {
  ArrowLeft, CheckCircle, AlertTriangle, Lightbulb, Database,
  HardDrive, ExternalLink, Info
} from "lucide-react";
import { cn } from "@/lib/utils";

type WizardPhase = "intro" | "short-term" | "long-term" | "platform" | "install";

export default function MemoryWizard() {
  const [phase, setPhase] = useState<WizardPhase>("intro");
  const [shortTerm, setShortTerm] = useState<string | null>(null);
  const [longTerm, setLongTerm] = useState<string | null>(null);
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [step, setStep] = useState(0);

  const selectedShort = shortTermBackends.find(b => b.id === shortTerm);
  const selectedLong = longTermBackends.find(b => b.id === longTerm);

  function goBack() {
    if (phase === "install") setPhase("platform");
    else if (phase === "platform") setPhase("long-term");
    else if (phase === "long-term") setPhase("short-term");
    else if (phase === "short-term") setPhase("intro");
  }

  // Build installation steps
  function getInstallSteps() {
    if (!selectedShort || !selectedLong || !platform) return [];

    const steps: { title: string; description: string; commands: { label: string; code: string; note?: string }[]; tips?: string[]; notes?: string[] }[] = [];

    // Step 1: Short-term backend
    const shortInstall = selectedShort.platformInstall[platform];
    steps.push({
      title: `Install ${selectedShort.name} (Short-Term Memory)`,
      description: selectedShort.description,
      commands: [
        ...shortInstall.commands,
        { label: "Docker alternative", code: selectedShort.dockerCommand, note: "Use Docker if native install isn't available." },
      ],
      tips: selectedShort.notes,
    });

    // Step 2: Long-term backend
    const longInstall = selectedLong.platformInstall[platform];
    steps.push({
      title: `Install ${selectedLong.name} (Long-Term Vector Memory)`,
      description: selectedLong.description,
      commands: [
        ...longInstall.commands,
        ...(selectedLong.defaultPort > 0 ? [{ label: "Docker alternative", code: selectedLong.dockerCommand }] : []),
      ],
      tips: selectedLong.notes,
    });

    // Common steps
    const common = getMemoryCommonSteps();
    for (const cs of common) {
      steps.push({ ...cs, notes: undefined });
    }

    // Config step
    steps.push({
      title: "Configure Environment",
      description: `Set up .memory_env for ${selectedShort.name} + ${selectedLong.name}.`,
      commands: [
        { label: `${selectedShort.name} config`, code: selectedShort.configSnippet },
        { label: `${selectedLong.name} config`, code: selectedLong.configSnippet },
        { label: "Ollama config", code: 'export OLLAMA_URL="http://127.0.0.1:11434"' },
        {
          label: "Write to .memory_env",
          code: `cat > ~/.openclaw/workspace/.memory_env << 'EOF'\nexport USER_ID="yourname"\n${selectedShort.configSnippet}\n${selectedLong.configSnippet}\nexport OLLAMA_URL="http://127.0.0.1:11434"\nEOF`,
        },
        { label: "Source it", code: "source ~/.openclaw/workspace/.memory_env" },
      ],
      tips: [
        "Replace 'yourname' with your actual user ID.",
        "This file is sourced automatically by the memory scripts.",
      ],
    });

    // Dependencies
    const allDeps = new Set<string>();
    selectedShort.dependencies?.forEach(d => allDeps.add(d));
    selectedLong.dependencies?.forEach(d => allDeps.add(d));
    allDeps.add("pip3 install requests");

    steps.push({
      title: "Install Python Dependencies",
      description: "Install all required Python packages for your chosen backends.",
      commands: [...allDeps].map(d => ({ label: d.replace("pip3 install ", ""), code: d })),
    });

    return steps;
  }

  // INTRO
  if (phase === "intro") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">🧠 Memory Framework</h1>
          <p className="text-muted-foreground mt-1">
            Optional Jarvis-like memory system for OpenClaw — gives your AI persistent,
            searchable memory across sessions.
          </p>
        </div>

        {/* Architecture diagram */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Three-Layer Architecture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="code-block text-xs">
              <code>{`┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: Short-Term Buffer (Fast)                         │
│  • Real-time conversation accumulation                     │
│  • Multi-session persistence                               │
│  • Daily flush to vector DB                                │
│  Default: Redis │ Alternatives: Valkey, KeyDB, DragonflyDB,│
│           Memcached, Tair, pgvector                        │
├─────────────────────────────────────────────────────────────┤
│  LAYER 2: Daily File Logs (.md)                            │
│  • Human-readable audit trail                              │
│  • Git-tracked, never lost                                 │
├─────────────────────────────────────────────────────────────┤
│  LAYER 3: Vector DB (Semantic Long-Term)                   │
│  • 1024-dim embeddings (snowflake-arctic-embed2)           │
│  • Semantic search across ALL conversations                │
│  Default: Qdrant │ Alternatives: Weaviate, ChromaDB, FAISS │
└─────────────────────────────────────────────────────────────┘`}</code>
            </div>
          </CardContent>
        </Card>

        <div className="rounded-lg bg-info/10 border border-info/20 p-4">
          <p className="text-sm flex items-start gap-2">
            <Info className="h-4 w-4 shrink-0 mt-0.5 text-info" />
            <span>
              The default setup uses <strong>Redis</strong> (short-term buffer) and <strong>Qdrant</strong> (long-term vector search).
              This wizard also lets you choose free, open-source alternatives for each layer.
            </span>
          </p>
        </div>

        <Button size="lg" onClick={() => setPhase("short-term")} className="w-full">
          Start Memory Setup →
        </Button>
      </div>
    );
  }

  // BACKEND SELECTION (shared UI for short-term and long-term)
  if (phase === "short-term" || phase === "long-term") {
    const isShort = phase === "short-term";
    const backends = isShort ? shortTermBackends : longTermBackends;
    const selected = isShort ? shortTerm : longTerm;
    const setSelected = isShort ? setShortTerm : setLongTerm;
    const icon = isShort ? HardDrive : Database;
    const Icon = icon;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Icon className="h-6 w-6 text-primary" />
              Choose {isShort ? "Short-Term" : "Long-Term"} Backend
            </h1>
            <p className="text-sm text-muted-foreground">
              {isShort
                ? "Fast buffer for real-time conversation capture."
                : "Vector database for semantic search across conversations."
              }
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          {backends.map((b) => (
            <motion.div key={b.id} whileHover={{ scale: 1.01 }}>
              <Card
                className={cn(
                  "cursor-pointer transition-all",
                  selected === b.id
                    ? "border-primary bg-primary/5 shadow-md"
                    : "hover:border-primary/30"
                )}
                onClick={() => setSelected(b.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{b.name}</CardTitle>
                      {b.isDefault && (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      )}
                    </div>
                    {selected === b.id && <CheckCircle className="h-5 w-5 text-primary" />}
                  </div>
                  <CardDescription className="text-sm">{b.description}</CardDescription>
                  {b.notes && b.notes.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {b.notes.filter(n => n.startsWith("⚠️")).map((n, i) => (
                        <p key={i} className="text-xs text-warning flex items-start gap-1">
                          <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                          {n.replace("⚠️ ", "")}
                        </p>
                      ))}
                    </div>
                  )}
                  <a
                    href={b.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                    onClick={e => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3 w-3" /> Website
                  </a>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>

        <Button
          size="lg"
          className="w-full"
          disabled={!selected}
          onClick={() => setPhase(isShort ? "long-term" : "platform")}
        >
          Continue →
        </Button>
      </div>
    );
  }

  // PLATFORM SELECTION
  if (phase === "platform") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Choose Your Platform</h1>
            <p className="text-sm text-muted-foreground">
              Installing {selectedShort?.name} + {selectedLong?.name} on:
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {platforms.map((p) => (
            <Card
              key={p.id}
              className={cn(
                "cursor-pointer transition-all hover:border-primary/50",
                platform === p.id && "border-primary bg-primary/5"
              )}
              onClick={() => { setPlatform(p.id); setPhase("install"); setStep(0); }}
            >
              <CardHeader className="text-center">
                <div className="text-3xl">{p.icon}</div>
                <CardTitle className="text-base">{p.name}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // INSTALL STEPS
  const installSteps = getInstallSteps();
  const current = installSteps[step];
  if (!current) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={goBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            Memory Setup: {selectedShort?.name} + {selectedLong?.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Step {step + 1} of {installSteps.length}: {current.title}
          </p>
        </div>
      </div>

      {/* Step tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2">
        {installSteps.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
              i === step
                ? "bg-primary text-primary-foreground"
                : i < step
                ? "bg-success/20 text-success"
                : "bg-muted text-muted-foreground"
            )}
          >
            {i < step && <CheckCircle className="inline h-3 w-3 mr-1" />}
            {s.title.length > 25 ? s.title.slice(0, 25) + "…" : s.title}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{current.title}</CardTitle>
          <CardDescription>{current.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {current.commands.map((cmd, i) => (
            <div key={i}>
              <CodeBlock code={cmd.code} title={cmd.label} language="bash" />
              {cmd.note && (
                <p className="text-sm text-muted-foreground ml-1 mt-1 flex items-start gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5 shrink-0 mt-0.5 text-warning" />
                  {cmd.note}
                </p>
              )}
            </div>
          ))}

          {current.tips && current.tips.length > 0 && (
            <div className="rounded-lg bg-info/10 border border-info/20 p-4 mt-4">
              <h4 className="text-sm font-semibold text-info flex items-center gap-1.5 mb-2">
                <Info className="h-4 w-4" /> Notes
              </h4>
              <ul className="space-y-1">
                {current.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-muted-foreground">• {tip.replace("⚠️ ", "")}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <StepNavigator
        current={step}
        total={installSteps.length}
        onPrev={() => setStep(Math.max(0, step - 1))}
        onNext={() => setStep(Math.min(installSteps.length - 1, step + 1))}
      />
    </div>
  );
}
