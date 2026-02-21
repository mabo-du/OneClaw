import { useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, RotateCcw, Check, Copy, AlertTriangle } from "lucide-react";

const defaultConfig = {
  channels: {
    whatsapp: {
      allowFrom: ["+15555550123"],
      groups: { "*": { requireMention: true } },
    },
    telegram: {
      botToken: "YOUR_BOT_TOKEN",
    },
    discord: {
      botToken: "YOUR_DISCORD_TOKEN",
    },
  },
  messages: {
    groupChat: {
      mentionPatterns: ["@openclaw"],
    },
  },
  ai: {
    provider: "anthropic",
    model: "claude-sonnet-4-20250514",
    maxTokens: 8192,
  },
  gateway: {
    port: 18789,
    host: "127.0.0.1",
  },
};

export default function JsonEditorPage() {
  const [value, setValue] = useState(JSON.stringify(defaultConfig, null, 2));
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const validate = useCallback((text: string) => {
    try {
      JSON.parse(text);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    validate(e.target.value);
  };

  const format = () => {
    try {
      const parsed = JSON.parse(value);
      setValue(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch {}
  };

  const reset = () => {
    setValue(JSON.stringify(defaultConfig, null, 2));
    setError(null);
  };

  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([value], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "openclaw.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const upload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const text = ev.target?.result as string;
          setValue(text);
          validate(text);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">📝 Config Editor</h1>
        <p className="text-muted-foreground mt-1">
          Edit your <code className="rounded bg-muted px-1.5 py-0.5 text-sm">~/.openclaw/openclaw.json</code> configuration file.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={format}>Format</Button>
        <Button variant="outline" size="sm" onClick={copy}>
          {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
          {copied ? "Copied" : "Copy"}
        </Button>
        <Button variant="outline" size="sm" onClick={download}>
          <Download className="h-4 w-4 mr-1" /> Download
        </Button>
        <Button variant="outline" size="sm" onClick={upload}>
          <Upload className="h-4 w-4 mr-1" /> Import
        </Button>
        <Button variant="outline" size="sm" onClick={reset}>
          <RotateCcw className="h-4 w-4 mr-1" /> Reset
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <textarea
        value={value}
        onChange={handleChange}
        spellCheck={false}
        className="w-full min-h-[500px] rounded-lg border bg-card p-4 font-mono text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
      />

      <Card className="border-info/20">
        <CardHeader>
          <CardTitle className="text-sm">💡 Configuration Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• <strong>channels.whatsapp.allowFrom</strong>: Restrict which phone numbers can message your bot.</p>
          <p>• <strong>ai.provider</strong>: Set to "ollama" for local LLM, "anthropic" for Claude, "openai" for GPT.</p>
          <p>• <strong>gateway.port</strong>: Change the port the Gateway listens on (default: 18789).</p>
          <p>• Save this file to <code className="rounded bg-muted px-1 py-0.5">~/.openclaw/openclaw.json</code> on your machine.</p>
        </CardContent>
      </Card>
    </div>
  );
}
