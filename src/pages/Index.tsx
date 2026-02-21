import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, Brain, FileJson, HelpCircle, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const features = [
  {
    icon: Download,
    title: "Install OpenClaw",
    description: "Step-by-step installation for Fedora, Ubuntu, Mint, Arch, Windows 11, and macOS.",
    path: "/install",
    color: "text-primary",
  },
  {
    icon: Brain,
    title: "Memory Framework",
    description: "Optional Jarvis-like memory system with Redis, Qdrant, and open-source alternatives.",
    path: "/memory",
    color: "text-accent",
  },
  {
    icon: FileJson,
    title: "Config Editor",
    description: "Built-in editor for openclaw.json with syntax highlighting and validation.",
    path: "/json-editor",
    color: "text-info",
  },
  {
    icon: HelpCircle,
    title: "Troubleshooting",
    description: "Guided troubleshooting for each installation stage with DuckDuckGo fallback.",
    path: "/troubleshoot",
    color: "text-warning",
  },
];

export default function Index() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="text-7xl mb-2"
        >
          🦞
        </motion.div>
        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
          <span className="text-primary">OpenClaw</span> Installation Wizard
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Your guided setup for the self-hosted AI gateway. Multi-platform support,
          local LLM configuration, memory framework, and more.
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {features.map(({ icon: Icon, title, description, path, color }, i) => (
          <motion.div
            key={path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link to={path}>
              <Card className="group cursor-pointer transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Icon className={`h-8 w-8 ${color}`} />
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                  <CardTitle className="text-lg">{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick start */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">⚡ Quick Start</CardTitle>
          <CardDescription>Get OpenClaw running in under 5 minutes</CardDescription>
        </CardHeader>
        <div className="px-6 pb-6">
          <div className="code-block">
            <code>
              <span className="comment"># Install</span>{"\n"}
              npm install -g openclaw@latest{"\n\n"}
              <span className="comment"># Setup</span>{"\n"}
              openclaw onboard --install-daemon{"\n\n"}
              <span className="comment"># Connect & run</span>{"\n"}
              openclaw channels login{"\n"}
              openclaw gateway --port 18789
            </code>
          </div>
        </div>
      </Card>
    </div>
  );
}
