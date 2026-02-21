export type Platform = "fedora" | "ubuntu" | "mint" | "arch" | "windows" | "macos";

export interface PlatformInfo {
  id: Platform;
  name: string;
  icon: string;
  description: string;
}

export const platforms: PlatformInfo[] = [
  { id: "fedora", name: "Fedora", icon: "🎩", description: "RPM-based, cutting edge" },
  { id: "ubuntu", name: "Ubuntu", icon: "🟠", description: "Debian-based, most popular" },
  { id: "mint", name: "Linux Mint", icon: "🍃", description: "Ubuntu-based, beginner friendly" },
  { id: "arch", name: "Arch Linux", icon: "🏔️", description: "Rolling release, DIY" },
  { id: "windows", name: "Windows 11", icon: "🪟", description: "Via WSL2 or native Node" },
  { id: "macos", name: "macOS", icon: "🍎", description: "Homebrew-based setup" },
];

export interface InstallStep {
  title: string;
  description: string;
  commands: { label: string; code: string; note?: string }[];
  tips?: string[];
}

export function getInstallSteps(platform: Platform): InstallStep[] {
  const common: InstallStep[] = [
    {
      title: "Install OpenClaw",
      description: "Install the OpenClaw CLI globally via npm.",
      commands: [
        { label: "Install OpenClaw", code: "npm install -g openclaw@latest", note: "This installs the `openclaw` command globally." },
      ],
      tips: ["Run with sudo on Linux if you get permission errors: sudo npm install -g openclaw@latest"],
    },
    {
      title: "Run the Onboarding Wizard",
      description: "OpenClaw has a built-in onboarding wizard that walks you through initial setup including API keys and daemon installation.",
      commands: [
        { label: "Run onboard", code: "openclaw onboard --install-daemon", note: "This sets up your API key (Anthropic recommended), creates the config file, and installs the system service." },
      ],
      tips: [
        "You'll need an API key from Anthropic (Claude), OpenAI, or another supported provider.",
        "The --install-daemon flag sets up OpenClaw as a background service.",
      ],
    },
    {
      title: "Connect a Channel",
      description: "Link your messaging apps (WhatsApp, Telegram, Discord, etc.) to the Gateway.",
      commands: [
        { label: "Login to channels", code: "openclaw channels login", note: "Follow the QR code or token prompts for each platform." },
      ],
      tips: [
        "WhatsApp requires scanning a QR code with your phone.",
        "Telegram requires a bot token from @BotFather.",
        "Discord requires a bot token from the Discord Developer Portal.",
      ],
    },
    {
      title: "Start the Gateway",
      description: "Launch the Gateway process to begin receiving and responding to messages.",
      commands: [
        { label: "Start Gateway", code: "openclaw gateway --port 18789", note: "The Gateway runs on port 18789 by default." },
        { label: "Open Dashboard", code: "# Open http://127.0.0.1:18789 in your browser", note: "Access the Control UI for chat, config, and sessions." },
      ],
      tips: [
        "Use --background to run as a background daemon.",
        "The Control UI is available at http://127.0.0.1:18789 after starting.",
      ],
    },
  ];

  const prereqs: Record<Platform, InstallStep> = {
    fedora: {
      title: "Install Prerequisites",
      description: "Install Node.js 22+, npm, and Git on Fedora.",
      commands: [
        { label: "Update system", code: "sudo dnf update -y" },
        { label: "Install Node.js 22", code: "sudo dnf module install nodejs:22 -y", note: "Fedora ships Node.js as a module stream." },
        { label: "Verify", code: "node --version && npm --version", note: "Should show v22.x.x or higher." },
        { label: "Install Git", code: "sudo dnf install git -y" },
      ],
      tips: ["If module streams aren't available, use NodeSource: curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -"],
    },
    ubuntu: {
      title: "Install Prerequisites",
      description: "Install Node.js 22+, npm, and Git on Ubuntu.",
      commands: [
        { label: "Update system", code: "sudo apt update && sudo apt upgrade -y" },
        { label: "Add NodeSource repo", code: "curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -" },
        { label: "Install Node.js", code: "sudo apt install -y nodejs", note: "Includes npm." },
        { label: "Verify", code: "node --version && npm --version" },
        { label: "Install Git", code: "sudo apt install git -y" },
      ],
    },
    mint: {
      title: "Install Prerequisites",
      description: "Install Node.js 22+, npm, and Git on Linux Mint (Ubuntu-based).",
      commands: [
        { label: "Update system", code: "sudo apt update && sudo apt upgrade -y" },
        { label: "Add NodeSource repo", code: "curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -" },
        { label: "Install Node.js", code: "sudo apt install -y nodejs" },
        { label: "Verify", code: "node --version && npm --version" },
        { label: "Install Git", code: "sudo apt install git -y" },
      ],
      tips: ["Linux Mint uses the same package repos as Ubuntu, so all Ubuntu instructions apply."],
    },
    arch: {
      title: "Install Prerequisites",
      description: "Install Node.js 22+, npm, and Git on Arch Linux.",
      commands: [
        { label: "Update system", code: "sudo pacman -Syu" },
        { label: "Install Node.js & npm", code: "sudo pacman -S nodejs npm", note: "Arch typically has the latest Node.js in its repos." },
        { label: "Verify", code: "node --version && npm --version" },
        { label: "Install Git", code: "sudo pacman -S git" },
      ],
      tips: ["Alternatively use nvm: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash && nvm install 22"],
    },
    windows: {
      title: "Install Prerequisites",
      description: "Set up Node.js 22+ on Windows 11 via WSL2 (recommended) or native.",
      commands: [
        { label: "Option A: Enable WSL2", code: "wsl --install", note: "Run in PowerShell as Administrator. Reboot when prompted." },
        { label: "Inside WSL (Ubuntu)", code: "curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -\nsudo apt install -y nodejs git" },
        { label: "Option B: Native Windows", code: "# Download Node.js 22 LTS from https://nodejs.org\n# Run the installer with default options\n# Also install Git from https://git-scm.com/download/win" },
        { label: "Verify (either method)", code: "node --version && npm --version" },
      ],
      tips: [
        "WSL2 is strongly recommended — OpenClaw works best in a Linux environment.",
        "If using native Windows, run commands in Git Bash or PowerShell.",
      ],
    },
    macos: {
      title: "Install Prerequisites",
      description: "Install Node.js 22+, npm, and Git on macOS using Homebrew.",
      commands: [
        { label: "Install Homebrew (if needed)", code: '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"' },
        { label: "Install Node.js 22", code: "brew install node@22", note: "Homebrew handles everything." },
        { label: "Link (if needed)", code: 'echo \'export PATH="/opt/homebrew/opt/node@22/bin:$PATH"\' >> ~/.zshrc && source ~/.zshrc' },
        { label: "Verify", code: "node --version && npm --version" },
        { label: "Install Git", code: "brew install git" },
      ],
      tips: ["Git may already be installed via Xcode Command Line Tools: xcode-select --install"],
    },
  };

  const localLlm: InstallStep = {
    title: "Local LLM Setup (Optional)",
    description: "Use a local LLM instead of a cloud API for fully offline operation.",
    commands: [
      { label: "Install Ollama", code: "curl -fsSL https://ollama.ai/install.sh | sh", note: "Ollama runs local LLMs with a simple API." },
      { label: "Pull a model", code: "ollama pull llama3.1:8b", note: "8B parameter model, ~4.7GB download. Good balance of quality and speed." },
      { label: "Start Ollama server", code: "ollama serve", note: "Runs on http://localhost:11434 by default." },
      { label: "Configure OpenClaw", code: `# Edit ~/.openclaw/openclaw.json:\n{\n  "ai": {\n    "provider": "ollama",\n    "model": "llama3.1:8b",\n    "baseUrl": "http://localhost:11434"\n  }\n}`, note: "Point OpenClaw to your local Ollama instance." },
    ],
    tips: [
      "For better quality, try larger models: ollama pull llama3.1:70b (requires ~40GB RAM).",
      "For embeddings (used by memory system): ollama pull snowflake-arctic-embed2",
      "Windows users: download Ollama from https://ollama.ai/download/windows",
      "macOS users: brew install ollama",
    ],
  };

  return [prereqs[platform], ...common, localLlm];
}
