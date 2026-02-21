import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from "@/components/ui/accordion";
import { Search, ExternalLink, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TroubleshootIssue {
  id: string;
  stage: string;
  title: string;
  symptoms: string[];
  solutions: { step: string; code?: string }[];
}

const issues: TroubleshootIssue[] = [
  {
    id: "node-not-found",
    stage: "Prerequisites",
    title: "Node.js not found or wrong version",
    symptoms: ["command not found: node", "node: command not found", "Node.js version < 22"],
    solutions: [
      { step: "Check if Node.js is installed:", code: "node --version" },
      { step: "If not installed, use the platform-specific instructions in the Install Wizard." },
      { step: "If version < 22, update via nvm:", code: "nvm install 22 && nvm use 22" },
      { step: "Verify npm is available:", code: "npm --version" },
    ],
  },
  {
    id: "npm-permission",
    stage: "Installation",
    title: "npm EACCES permission denied",
    symptoms: ["EACCES: permission denied", "npm ERR! code EACCES", "Error: EACCES"],
    solutions: [
      { step: "Option A: Use sudo (Linux/macOS):", code: "sudo npm install -g openclaw@latest" },
      { step: "Option B: Fix npm permissions:", code: "mkdir -p ~/.npm-global\nnpm config set prefix '~/.npm-global'\necho 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc\nsource ~/.bashrc" },
      { step: "Option C: Use nvm (recommended):", code: "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash\nnvm install 22\nnpm install -g openclaw@latest" },
    ],
  },
  {
    id: "gateway-port",
    stage: "Gateway",
    title: "Port 18789 already in use",
    symptoms: ["EADDRINUSE", "address already in use", "port 18789"],
    solutions: [
      { step: "Find what's using the port:", code: "lsof -i :18789  # macOS/Linux\nnetstat -ano | findstr 18789  # Windows" },
      { step: "Kill the process:", code: "kill -9 <PID>" },
      { step: "Or use a different port:", code: "openclaw gateway --port 18790" },
    ],
  },
  {
    id: "whatsapp-qr",
    stage: "Channels",
    title: "WhatsApp QR code not appearing",
    symptoms: ["QR code blank", "No QR code displayed", "WhatsApp pairing failed"],
    solutions: [
      { step: "Ensure the Gateway is running first:", code: "openclaw gateway --port 18789" },
      { step: "Re-run channel login:", code: "openclaw channels login" },
      { step: "Check your terminal supports QR code rendering (avoid non-UTF8 terminals)." },
      { step: "Try the web UI instead: open http://127.0.0.1:18789 in your browser." },
    ],
  },
  {
    id: "redis-connection",
    stage: "Memory Framework",
    title: "Cannot connect to Redis / short-term backend",
    symptoms: ["Connection refused", "redis.exceptions.ConnectionError", "ECONNREFUSED 127.0.0.1:6379"],
    solutions: [
      { step: "Check if Redis is running:", code: "redis-cli ping  # Should return PONG" },
      { step: "Start Redis:", code: "sudo systemctl start redis  # or: docker start redis" },
      { step: "Check the port:", code: "ss -tlnp | grep 6379" },
      { step: "Verify .memory_env has correct REDIS_HOST and REDIS_PORT." },
    ],
  },
  {
    id: "qdrant-connection",
    stage: "Memory Framework",
    title: "Cannot connect to Qdrant / vector DB",
    symptoms: ["Connection refused", "qdrant_client.http.exceptions", "ECONNREFUSED 127.0.0.1:6333"],
    solutions: [
      { step: "Check if Qdrant is running:", code: "curl http://localhost:6333/collections" },
      { step: "Start Qdrant:", code: "docker start qdrant  # or: docker run -d --name qdrant -p 6333:6333 qdrant/qdrant" },
      { step: "Check Qdrant dashboard: http://localhost:6333/dashboard" },
      { step: "Verify QDRANT_URL in .memory_env." },
    ],
  },
  {
    id: "ollama-embeddings",
    stage: "Memory Framework",
    title: "Ollama embedding model not working",
    symptoms: ["model not found", "snowflake-arctic-embed2", "ollama: connection refused"],
    solutions: [
      { step: "Check Ollama is running:", code: "ollama list" },
      { step: "Pull the embedding model:", code: "ollama pull snowflake-arctic-embed2" },
      { step: "Start Ollama:", code: "ollama serve" },
      { step: "Test embeddings:", code: 'curl http://localhost:11434/api/embeddings -d \'{"model":"snowflake-arctic-embed2","prompt":"test"}\'' },
    ],
  },
  {
    id: "docker-not-found",
    stage: "Prerequisites",
    title: "Docker not installed or not running",
    symptoms: ["docker: command not found", "Cannot connect to the Docker daemon", "docker.sock permission denied"],
    solutions: [
      { step: "Install Docker:", code: "curl -fsSL https://get.docker.com | sh" },
      { step: "Start Docker:", code: "sudo systemctl enable --now docker" },
      { step: "Add your user to the docker group:", code: "sudo usermod -aG docker $USER\n# Then log out and back in" },
      { step: "macOS/Windows: Install Docker Desktop from https://docker.com/products/docker-desktop" },
    ],
  },
];

const stages = [...new Set(issues.map(i => i.stage))];

export default function TroubleshootingPage() {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [ddgQuery, setDdgQuery] = useState("");

  const filtered = issues.filter(issue => {
    if (selectedStage && issue.stage !== selectedStage) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        issue.title.toLowerCase().includes(q) ||
        issue.symptoms.some(s => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const openDDG = (query: string) => {
    const q = encodeURIComponent(`openclaw ${query}`);
    window.open(`https://duckduckgo.com/?q=${q}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🔧 Troubleshooting</h1>
        <p className="text-muted-foreground mt-1">
          Find solutions for common issues at each installation stage.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by error message or symptom..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stage filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedStage === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedStage(null)}
        >
          All
        </Button>
        {stages.map(stage => (
          <Button
            key={stage}
            variant={selectedStage === stage ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedStage(stage)}
          >
            {stage}
          </Button>
        ))}
      </div>

      {/* Issues */}
      <Accordion type="single" collapsible className="space-y-2">
        {filtered.map(issue => (
          <AccordionItem key={issue.id} value={issue.id} className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3 text-left">
                <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                <div>
                  <p className="font-medium text-sm">{issue.title}</p>
                  <Badge variant="secondary" className="text-xs mt-1">{issue.stage}</Badge>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pb-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Common Symptoms</p>
                <div className="flex flex-wrap gap-1">
                  {issue.symptoms.map((s, i) => (
                    <code key={i} className="text-xs rounded bg-destructive/10 text-destructive px-2 py-0.5">{s}</code>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Solutions</p>
                {issue.solutions.map((sol, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm">{sol.step}</p>
                      {sol.code && (
                        <pre className="code-block mt-1 text-xs">{sol.code}</pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => openDDG(issue.title)}
              >
                <Search className="h-3.5 w-3.5 mr-1" />
                Search DuckDuckGo for more
              </Button>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {filtered.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <XCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">No matching issues found.</p>
          </CardContent>
        </Card>
      )}

      {/* DuckDuckGo fallback */}
      <Card className="border-accent/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5 text-accent" /> Can't find your issue?
          </CardTitle>
          <CardDescription>Search DuckDuckGo for community solutions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Describe your issue..."
              value={ddgQuery}
              onChange={e => setDdgQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && ddgQuery && openDDG(ddgQuery)}
            />
            <Button onClick={() => ddgQuery && openDDG(ddgQuery)} disabled={!ddgQuery}>
              <ExternalLink className="h-4 w-4 mr-1" /> Search
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
