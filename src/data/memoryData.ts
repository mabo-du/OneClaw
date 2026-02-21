export interface MemoryBackend {
  id: string;
  name: string;
  role: "short-term" | "long-term";
  isDefault: boolean;
  description: string;
  dockerCommand: string;
  defaultPort: number;
  website: string;
  platformInstall: Record<string, { commands: { label: string; code: string; note?: string }[] }>;
  configSnippet: string;
  dependencies?: string[];
  notes?: string[];
}

export const shortTermBackends: MemoryBackend[] = [
  {
    id: "redis",
    name: "Redis",
    role: "short-term",
    isDefault: true,
    description: "The original in-memory data store. Used by default in the Jarvis Memory system for fast buffering of conversation turns before flushing to the vector DB.",
    dockerCommand: "docker run -d --name redis -p 6379:6379 redis:latest",
    defaultPort: 6379,
    website: "https://redis.io",
    platformInstall: {
      fedora: { commands: [
        { label: "Install", code: "sudo dnf install redis -y" },
        { label: "Start & enable", code: "sudo systemctl enable --now redis" },
        { label: "Test", code: "redis-cli ping", note: "Should return PONG" },
      ]},
      ubuntu: { commands: [
        { label: "Install", code: "sudo apt install redis-server -y" },
        { label: "Start & enable", code: "sudo systemctl enable --now redis-server" },
        { label: "Test", code: "redis-cli ping" },
      ]},
      mint: { commands: [
        { label: "Install", code: "sudo apt install redis-server -y" },
        { label: "Start & enable", code: "sudo systemctl enable --now redis-server" },
        { label: "Test", code: "redis-cli ping" },
      ]},
      arch: { commands: [
        { label: "Install", code: "sudo pacman -S redis" },
        { label: "Start & enable", code: "sudo systemctl enable --now redis" },
        { label: "Test", code: "redis-cli ping" },
      ]},
      windows: { commands: [
        { label: "WSL2", code: "sudo apt install redis-server -y && sudo service redis-server start" },
        { label: "Or Docker", code: "docker run -d --name redis -p 6379:6379 redis" },
      ]},
      macos: { commands: [
        { label: "Install", code: "brew install redis" },
        { label: "Start", code: "brew services start redis" },
        { label: "Test", code: "redis-cli ping" },
      ]},
    },
    configSnippet: `export REDIS_HOST="127.0.0.1"\nexport REDIS_PORT="6379"`,
    dependencies: ["pip3 install redis"],
  },
  {
    id: "valkey",
    name: "Valkey",
    role: "short-term",
    isDefault: false,
    description: "A community-driven fork of Redis by the Linux Foundation. Fully compatible drop-in replacement. Maintained by former Redis contributors.",
    dockerCommand: "docker run -d --name valkey -p 6379:6379 valkey/valkey:latest",
    defaultPort: 6379,
    website: "https://valkey.io",
    platformInstall: {
      fedora: { commands: [
        { label: "Install from source", code: "sudo dnf install gcc make jemalloc-devel -y\ngit clone https://github.com/valkey-io/valkey.git\ncd valkey && make && sudo make install" },
        { label: "Start", code: "valkey-server --daemonize yes" },
        { label: "Test", code: "valkey-cli ping" },
      ]},
      ubuntu: { commands: [
        { label: "Install from source", code: "sudo apt install build-essential libjemalloc-dev -y\ngit clone https://github.com/valkey-io/valkey.git\ncd valkey && make && sudo make install" },
        { label: "Start", code: "valkey-server --daemonize yes" },
      ]},
      mint: { commands: [
        { label: "Install from source", code: "sudo apt install build-essential libjemalloc-dev -y\ngit clone https://github.com/valkey-io/valkey.git\ncd valkey && make && sudo make install" },
        { label: "Start", code: "valkey-server --daemonize yes" },
      ]},
      arch: { commands: [
        { label: "AUR", code: "yay -S valkey", note: "Or build from source like other platforms." },
        { label: "Start", code: "sudo systemctl enable --now valkey" },
      ]},
      windows: { commands: [
        { label: "Docker (recommended)", code: "docker run -d --name valkey -p 6379:6379 valkey/valkey" },
        { label: "Or build in WSL2", code: "# Follow Ubuntu instructions inside WSL2" },
      ]},
      macos: { commands: [
        { label: "Build from source", code: "brew install gcc make\ngit clone https://github.com/valkey-io/valkey.git\ncd valkey && make && sudo make install" },
        { label: "Or Docker", code: "docker run -d --name valkey -p 6379:6379 valkey/valkey" },
      ]},
    },
    configSnippet: `# Valkey is wire-compatible with Redis — same config!\nexport REDIS_HOST="127.0.0.1"\nexport REDIS_PORT="6379"`,
    dependencies: ["pip3 install redis"],
    notes: ["Valkey uses the Redis wire protocol — no code changes needed.", "The `redis` Python library works with Valkey out of the box."],
  },
  {
    id: "keydb",
    name: "KeyDB",
    role: "short-term",
    isDefault: false,
    description: "A multi-threaded fork of Redis by Snap Inc. Offers higher throughput on multi-core systems. Fully Redis-compatible.",
    dockerCommand: "docker run -d --name keydb -p 6379:6379 eqalpha/keydb:latest",
    defaultPort: 6379,
    website: "https://docs.keydb.dev",
    platformInstall: {
      fedora: { commands: [
        { label: "Add repo & install", code: "# Build from source:\nsudo dnf install gcc gcc-c++ make cmake libuuid-devel tcl -y\ngit clone https://github.com/Snapchat/KeyDB.git\ncd KeyDB && make && sudo make install" },
        { label: "Start", code: "keydb-server --daemonize yes --server-threads 4", note: "Uses 4 threads for better multi-core performance." },
      ]},
      ubuntu: { commands: [
        { label: "Add PPA", code: "sudo add-apt-repository ppa:keydb/keydb -y\nsudo apt update\nsudo apt install keydb-server -y" },
        { label: "Start", code: "sudo systemctl enable --now keydb-server" },
      ]},
      mint: { commands: [
        { label: "Add PPA", code: "sudo add-apt-repository ppa:keydb/keydb -y\nsudo apt update\nsudo apt install keydb-server -y" },
        { label: "Start", code: "sudo systemctl enable --now keydb-server" },
      ]},
      arch: { commands: [
        { label: "Build from source", code: "sudo pacman -S base-devel cmake\ngit clone https://github.com/Snapchat/KeyDB.git\ncd KeyDB && make && sudo make install" },
      ]},
      windows: { commands: [
        { label: "Docker", code: "docker run -d --name keydb -p 6379:6379 eqalpha/keydb" },
      ]},
      macos: { commands: [
        { label: "Docker", code: "docker run -d --name keydb -p 6379:6379 eqalpha/keydb" },
      ]},
    },
    configSnippet: `# KeyDB is Redis-compatible\nexport REDIS_HOST="127.0.0.1"\nexport REDIS_PORT="6379"`,
    dependencies: ["pip3 install redis"],
    notes: ["Multi-threaded: add --server-threads N for more throughput."],
  },
  {
    id: "dragonfly",
    name: "DragonflyDB",
    role: "short-term",
    isDefault: false,
    description: "A modern, multi-threaded Redis & Memcached replacement. Claims 25x throughput vs Redis. Written in C++ with shared-nothing architecture.",
    dockerCommand: "docker run -d --name dragonfly --ulimit memlock=-1 -p 6379:6379 docker.dragonflydb.io/dragonflydb/dragonfly",
    defaultPort: 6379,
    website: "https://dragonflydb.io",
    platformInstall: {
      fedora: { commands: [
        { label: "Docker (recommended)", code: "docker run -d --name dragonfly --ulimit memlock=-1 -p 6379:6379 docker.dragonflydb.io/dragonflydb/dragonfly" },
      ]},
      ubuntu: { commands: [
        { label: "Docker", code: "docker run -d --name dragonfly --ulimit memlock=-1 -p 6379:6379 docker.dragonflydb.io/dragonflydb/dragonfly" },
        { label: "Or snap", code: "sudo snap install dragonfly --edge" },
      ]},
      mint: { commands: [
        { label: "Docker", code: "docker run -d --name dragonfly --ulimit memlock=-1 -p 6379:6379 docker.dragonflydb.io/dragonflydb/dragonfly" },
      ]},
      arch: { commands: [
        { label: "Docker", code: "docker run -d --name dragonfly --ulimit memlock=-1 -p 6379:6379 docker.dragonflydb.io/dragonflydb/dragonfly" },
      ]},
      windows: { commands: [
        { label: "Docker Desktop", code: "docker run -d --name dragonfly --ulimit memlock=-1 -p 6379:6379 docker.dragonflydb.io/dragonflydb/dragonfly" },
      ]},
      macos: { commands: [
        { label: "Docker", code: "docker run -d --name dragonfly --ulimit memlock=-1 -p 6379:6379 docker.dragonflydb.io/dragonflydb/dragonfly" },
      ]},
    },
    configSnippet: `# DragonflyDB is Redis-compatible\nexport REDIS_HOST="127.0.0.1"\nexport REDIS_PORT="6379"`,
    dependencies: ["pip3 install redis"],
    notes: ["Dragonfly supports the Redis API — no code changes needed.", "Requires Docker for most platforms (no native packages yet for most distros)."],
  },
  {
    id: "memcached",
    name: "Memcached",
    role: "short-term",
    isDefault: false,
    description: "A simple, high-performance distributed memory cache. Note: Memcached uses a different protocol than Redis, so the memory scripts need adaptation.",
    dockerCommand: "docker run -d --name memcached -p 11211:11211 memcached:latest",
    defaultPort: 11211,
    website: "https://memcached.org",
    platformInstall: {
      fedora: { commands: [
        { label: "Install", code: "sudo dnf install memcached -y" },
        { label: "Start", code: "sudo systemctl enable --now memcached" },
      ]},
      ubuntu: { commands: [
        { label: "Install", code: "sudo apt install memcached -y" },
        { label: "Start", code: "sudo systemctl enable --now memcached" },
      ]},
      mint: { commands: [
        { label: "Install", code: "sudo apt install memcached -y" },
        { label: "Start", code: "sudo systemctl enable --now memcached" },
      ]},
      arch: { commands: [
        { label: "Install", code: "sudo pacman -S memcached" },
        { label: "Start", code: "sudo systemctl enable --now memcached" },
      ]},
      windows: { commands: [
        { label: "Docker", code: "docker run -d --name memcached -p 11211:11211 memcached" },
      ]},
      macos: { commands: [
        { label: "Install", code: "brew install memcached" },
        { label: "Start", code: "brew services start memcached" },
      ]},
    },
    configSnippet: `export MEMCACHED_HOST="127.0.0.1"\nexport MEMCACHED_PORT="11211"`,
    dependencies: ["pip3 install pymemcache"],
    notes: [
      "⚠️ Memcached uses a different protocol than Redis. The default Jarvis Memory scripts expect Redis.",
      "You'll need to write adapter code or modify save_mem.py to use pymemcache instead of redis-py.",
      "Memcached doesn't support data structures like lists/hashes — only simple key-value storage.",
    ],
  },
  {
    id: "tair",
    name: "Tair (by Alibaba)",
    role: "short-term",
    isDefault: false,
    description: "An open-source Redis-compatible KV store by Alibaba with enhanced data structures and persistent storage. Drop-in Redis replacement.",
    dockerCommand: "docker run -d --name tair -p 6379:6379 tairopen/tair:latest",
    defaultPort: 6379,
    website: "https://github.com/tair-opensource/TairString",
    platformInstall: {
      fedora: { commands: [
        { label: "Docker (recommended)", code: "docker run -d --name tair -p 6379:6379 tairopen/tair:latest" },
      ]},
      ubuntu: { commands: [
        { label: "Docker", code: "docker run -d --name tair -p 6379:6379 tairopen/tair:latest" },
      ]},
      mint: { commands: [
        { label: "Docker", code: "docker run -d --name tair -p 6379:6379 tairopen/tair:latest" },
      ]},
      arch: { commands: [
        { label: "Docker", code: "docker run -d --name tair -p 6379:6379 tairopen/tair:latest" },
      ]},
      windows: { commands: [
        { label: "Docker", code: "docker run -d --name tair -p 6379:6379 tairopen/tair:latest" },
      ]},
      macos: { commands: [
        { label: "Docker", code: "docker run -d --name tair -p 6379:6379 tairopen/tair:latest" },
      ]},
    },
    configSnippet: `# Tair is Redis-compatible\nexport REDIS_HOST="127.0.0.1"\nexport REDIS_PORT="6379"`,
    dependencies: ["pip3 install redis"],
    notes: ["Tair supports the Redis protocol — no code changes needed."],
  },
  {
    id: "pgvector",
    name: "pgvector (PostgreSQL)",
    role: "short-term",
    isDefault: false,
    description: "PostgreSQL extension for vector similarity search. Can serve as both short-term buffer (via tables) and vector store. Different paradigm than Redis.",
    dockerCommand: "docker run -d --name pgvector -e POSTGRES_PASSWORD=password -p 5432:5432 pgvector/pgvector:pg17",
    defaultPort: 5432,
    website: "https://github.com/pgvector/pgvector",
    platformInstall: {
      fedora: { commands: [
        { label: "Install PostgreSQL", code: "sudo dnf install postgresql-server postgresql-contrib -y\nsudo postgresql-setup --initdb\nsudo systemctl enable --now postgresql" },
        { label: "Install pgvector", code: "sudo dnf install pgvector_17 -y\n# Or build from source:\ngit clone https://github.com/pgvector/pgvector.git\ncd pgvector && make && sudo make install" },
        { label: "Enable extension", code: 'sudo -u postgres psql -c "CREATE EXTENSION vector;"' },
      ]},
      ubuntu: { commands: [
        { label: "Install PostgreSQL", code: "sudo apt install postgresql postgresql-contrib -y" },
        { label: "Install pgvector", code: "sudo apt install postgresql-17-pgvector -y\n# Or from source:\ngit clone https://github.com/pgvector/pgvector.git\ncd pgvector && make && sudo make install" },
        { label: "Enable extension", code: 'sudo -u postgres psql -c "CREATE EXTENSION vector;"' },
      ]},
      mint: { commands: [
        { label: "Install PostgreSQL", code: "sudo apt install postgresql postgresql-contrib -y" },
        { label: "Install pgvector", code: "sudo apt install postgresql-17-pgvector -y" },
        { label: "Enable extension", code: 'sudo -u postgres psql -c "CREATE EXTENSION vector;"' },
      ]},
      arch: { commands: [
        { label: "Install", code: "sudo pacman -S postgresql\nsudo -u postgres initdb -D /var/lib/postgres/data\nsudo systemctl enable --now postgresql" },
        { label: "Install pgvector", code: "yay -S pgvector" },
        { label: "Enable extension", code: 'sudo -u postgres psql -c "CREATE EXTENSION vector;"' },
      ]},
      windows: { commands: [
        { label: "Docker", code: "docker run -d --name pgvector -e POSTGRES_PASSWORD=password -p 5432:5432 pgvector/pgvector:pg17" },
      ]},
      macos: { commands: [
        { label: "Install PostgreSQL", code: "brew install postgresql@17\nbrew services start postgresql@17" },
        { label: "Install pgvector", code: "brew install pgvector\n# Then in psql:\nCREATE EXTENSION vector;" },
      ]},
    },
    configSnippet: `export PG_HOST="127.0.0.1"\nexport PG_PORT="5432"\nexport PG_DB="openclaw_memory"\nexport PG_USER="postgres"\nexport PG_PASSWORD="password"`,
    dependencies: ["pip3 install psycopg2-binary pgvector"],
    notes: [
      "⚠️ pgvector uses SQL, not the Redis protocol. Jarvis Memory scripts need significant adaptation.",
      "However, pgvector can serve as BOTH short-term buffer AND long-term vector store in a single database.",
      "Create a buffer table: CREATE TABLE memory_buffer (id SERIAL, user_id TEXT, content TEXT, ts TIMESTAMPTZ DEFAULT NOW());",
    ],
  },
];

export const longTermBackends: MemoryBackend[] = [
  {
    id: "qdrant",
    name: "Qdrant",
    role: "long-term",
    isDefault: true,
    description: "Purpose-built vector similarity search engine. Default for Jarvis Memory. Stores 1024-dim embeddings for semantic search across all conversations.",
    dockerCommand: "docker run -d --name qdrant -p 6333:6333 -p 6334:6334 qdrant/qdrant:latest",
    defaultPort: 6333,
    website: "https://qdrant.tech",
    platformInstall: {
      fedora: { commands: [
        { label: "Docker (recommended)", code: "docker run -d --name qdrant -p 6333:6333 -p 6334:6334 qdrant/qdrant" },
        { label: "Test", code: "curl http://localhost:6333/dashboard", note: "Opens the Qdrant dashboard." },
      ]},
      ubuntu: { commands: [
        { label: "Docker", code: "docker run -d --name qdrant -p 6333:6333 -p 6334:6334 qdrant/qdrant" },
        { label: "Or snap", code: "snap install qdrant" },
      ]},
      mint: { commands: [
        { label: "Docker", code: "docker run -d --name qdrant -p 6333:6333 -p 6334:6334 qdrant/qdrant" },
      ]},
      arch: { commands: [
        { label: "Docker", code: "docker run -d --name qdrant -p 6333:6333 -p 6334:6334 qdrant/qdrant" },
      ]},
      windows: { commands: [
        { label: "Docker Desktop", code: "docker run -d --name qdrant -p 6333:6333 -p 6334:6334 qdrant/qdrant" },
      ]},
      macos: { commands: [
        { label: "Docker", code: "docker run -d --name qdrant -p 6333:6333 -p 6334:6334 qdrant/qdrant" },
        { label: "Or Homebrew", code: "brew install qdrant/tap/qdrant\nqdrant" },
      ]},
    },
    configSnippet: `export QDRANT_URL="http://127.0.0.1:6333"`,
    dependencies: ["pip3 install qdrant-client"],
  },
  {
    id: "weaviate",
    name: "Weaviate",
    role: "long-term",
    isDefault: false,
    description: "An open-source vector search engine with built-in vectorization modules. Can auto-generate embeddings from text without needing Ollama.",
    dockerCommand: "docker run -d --name weaviate -p 8080:8080 -p 50051:50051 -e AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=true -e DEFAULT_VECTORIZER_MODULE=none cr.weaviate.io/semitechnologies/weaviate:latest",
    defaultPort: 8080,
    website: "https://weaviate.io",
    platformInstall: {
      fedora: { commands: [
        { label: "Docker Compose (recommended)", code: `# Create docker-compose.yml:\nversion: '3.4'\nservices:\n  weaviate:\n    image: cr.weaviate.io/semitechnologies/weaviate:latest\n    ports:\n      - "8080:8080"\n      - "50051:50051"\n    environment:\n      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'\n      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'\n      DEFAULT_VECTORIZER_MODULE: 'none'\n      CLUSTER_HOSTNAME: 'node1'\n\n# Then run:\ndocker compose up -d` },
      ]},
      ubuntu: { commands: [
        { label: "Docker", code: "docker run -d --name weaviate -p 8080:8080 -e AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=true -e DEFAULT_VECTORIZER_MODULE=none cr.weaviate.io/semitechnologies/weaviate" },
      ]},
      mint: { commands: [
        { label: "Docker", code: "docker run -d --name weaviate -p 8080:8080 -e AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=true -e DEFAULT_VECTORIZER_MODULE=none cr.weaviate.io/semitechnologies/weaviate" },
      ]},
      arch: { commands: [
        { label: "Docker", code: "docker run -d --name weaviate -p 8080:8080 -e AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=true -e DEFAULT_VECTORIZER_MODULE=none cr.weaviate.io/semitechnologies/weaviate" },
      ]},
      windows: { commands: [
        { label: "Docker Desktop", code: "docker run -d --name weaviate -p 8080:8080 -e AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=true -e DEFAULT_VECTORIZER_MODULE=none cr.weaviate.io/semitechnologies/weaviate" },
      ]},
      macos: { commands: [
        { label: "Docker", code: "docker run -d --name weaviate -p 8080:8080 -e AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=true -e DEFAULT_VECTORIZER_MODULE=none cr.weaviate.io/semitechnologies/weaviate" },
      ]},
    },
    configSnippet: `export WEAVIATE_URL="http://127.0.0.1:8080"`,
    dependencies: ["pip3 install weaviate-client"],
    notes: [
      "⚠️ Weaviate has a different API than Qdrant. Jarvis Memory scripts need adaptation.",
      "Weaviate can auto-vectorize text with built-in modules (text2vec-transformers, etc.).",
      "You may not need Ollama embeddings if using Weaviate's built-in vectorizer.",
    ],
  },
  {
    id: "chromadb",
    name: "ChromaDB",
    role: "long-term",
    isDefault: false,
    description: "An AI-native open-source embedding database. Extremely simple Python API. Great for prototyping and small-to-medium scale deployments.",
    dockerCommand: "docker run -d --name chromadb -p 8000:8000 chromadb/chroma:latest",
    defaultPort: 8000,
    website: "https://www.trychroma.com",
    platformInstall: {
      fedora: { commands: [
        { label: "Install via pip", code: "pip3 install chromadb", note: "ChromaDB can run as an in-process Python library or a server." },
        { label: "Run as server", code: "chroma run --host 0.0.0.0 --port 8000", note: "Or run embedded in your Python scripts." },
      ]},
      ubuntu: { commands: [
        { label: "Install via pip", code: "pip3 install chromadb" },
        { label: "Run as server", code: "chroma run --host 0.0.0.0 --port 8000" },
      ]},
      mint: { commands: [
        { label: "Install via pip", code: "pip3 install chromadb" },
        { label: "Run as server", code: "chroma run --host 0.0.0.0 --port 8000" },
      ]},
      arch: { commands: [
        { label: "Install via pip", code: "pip3 install chromadb" },
        { label: "Run as server", code: "chroma run --host 0.0.0.0 --port 8000" },
      ]},
      windows: { commands: [
        { label: "Install via pip", code: "pip install chromadb" },
        { label: "Run as server", code: "chroma run --host 0.0.0.0 --port 8000" },
        { label: "Or Docker", code: "docker run -d --name chromadb -p 8000:8000 chromadb/chroma" },
      ]},
      macos: { commands: [
        { label: "Install via pip", code: "pip3 install chromadb" },
        { label: "Run as server", code: "chroma run --host 0.0.0.0 --port 8000" },
      ]},
    },
    configSnippet: `export CHROMA_URL="http://127.0.0.1:8000"`,
    dependencies: ["pip3 install chromadb"],
    notes: [
      "⚠️ ChromaDB has a different API than Qdrant. Scripts need adaptation.",
      "ChromaDB can run in-process (no server needed) — great for development.",
      "Supports built-in embedding functions, so Ollama may be optional.",
    ],
  },
  {
    id: "faiss",
    name: "FAISS (by Meta)",
    role: "long-term",
    isDefault: false,
    description: "Facebook AI Similarity Search — a library for efficient similarity search. Runs entirely in-process (no server). Best for offline/local-only use.",
    dockerCommand: "# FAISS is a Python library, not a server.\npip3 install faiss-cpu  # or faiss-gpu for CUDA",
    defaultPort: 0,
    website: "https://github.com/facebookresearch/faiss",
    platformInstall: {
      fedora: { commands: [
        { label: "CPU version", code: "pip3 install faiss-cpu" },
        { label: "GPU version (NVIDIA)", code: "pip3 install faiss-gpu", note: "Requires CUDA toolkit installed." },
      ]},
      ubuntu: { commands: [
        { label: "CPU version", code: "pip3 install faiss-cpu" },
        { label: "GPU version (NVIDIA)", code: "pip3 install faiss-gpu" },
        { label: "Via conda", code: "conda install -c pytorch faiss-cpu" },
      ]},
      mint: { commands: [
        { label: "CPU version", code: "pip3 install faiss-cpu" },
      ]},
      arch: { commands: [
        { label: "CPU version", code: "pip3 install faiss-cpu" },
        { label: "Or AUR", code: "yay -S python-faiss" },
      ]},
      windows: { commands: [
        { label: "CPU version", code: "pip install faiss-cpu" },
        { label: "Via conda", code: "conda install -c pytorch faiss-cpu" },
      ]},
      macos: { commands: [
        { label: "CPU version", code: "pip3 install faiss-cpu", note: "GPU not supported on macOS." },
      ]},
    },
    configSnippet: `# FAISS runs in-process — no server URL needed.\n# Configure the index file path:\nexport FAISS_INDEX_PATH="$HOME/.openclaw/workspace/memory/faiss_index"`,
    dependencies: ["pip3 install faiss-cpu numpy"],
    notes: [
      "⚠️ FAISS is a library, not a server. No REST API — runs in your Python process.",
      "You need to manage persistence yourself (save/load index files).",
      "Jarvis Memory scripts need significant rewriting to use FAISS.",
      "Best for: offline-only, single-machine, high-performance vector search.",
    ],
  },
];

export interface MemoryInstallStep {
  title: string;
  description: string;
  commands: { label: string; code: string; note?: string }[];
  tips?: string[];
}

export function getMemoryCommonSteps(): MemoryInstallStep[] {
  return [
    {
      title: "Install Python Dependencies",
      description: "Install the shared Python libraries required by the memory system.",
      commands: [
        { label: "Core dependencies", code: "pip3 install redis qdrant-client requests", note: "Adjust based on your chosen backends." },
      ],
    },
    {
      title: "Install Ollama (Embeddings)",
      description: "Ollama provides the embedding model used to convert text to vectors for semantic search.",
      commands: [
        { label: "Install Ollama", code: "curl -fsSL https://ollama.ai/install.sh | sh" },
        { label: "Pull embedding model", code: "ollama pull snowflake-arctic-embed2", note: "1024-dimension embedding model used by the memory system." },
        { label: "Start Ollama", code: "ollama serve" },
      ],
      tips: [
        "macOS: brew install ollama",
        "Windows: Download from https://ollama.ai/download/windows",
        "You can use other embedding models by updating EMBED_MODEL in .memory_env",
      ],
    },
    {
      title: "Clone the Memory Repository",
      description: "Download the Jarvis Memory blueprint from GitHub.",
      commands: [
        { label: "Clone", code: "git clone https://github.com/speedyfoxai/openclaw-jarvis-memory.git\ncd openclaw-jarvis-memory" },
      ],
    },
    {
      title: "Run the Installer",
      description: "The installer copies scripts, creates directories, sets up cron jobs, and backs up existing files.",
      commands: [
        { label: "Make executable", code: "chmod +x install.sh" },
        { label: "Run installer", code: "./install.sh", note: "Automatically backs up existing HEARTBEAT.md, .memory_env, and crontab." },
        { label: "Source environment", code: "source ~/.openclaw/workspace/.memory_env" },
      ],
      tips: [
        "The installer creates backups in .backups/ with timestamps.",
        "Run ./uninstall.sh to reverse all changes if needed.",
      ],
    },
    {
      title: "Initialize & Test",
      description: "Create the vector collections and verify everything works.",
      commands: [
        { label: "Initialize collections", code: "cd ~/.openclaw/workspace/skills/qdrant-memory/scripts\npython3 init_kimi_memories.py" },
        { label: "Test save", code: "python3 ~/.openclaw/workspace/skills/mem-redis/scripts/save_mem.py --user-id yourname" },
        { label: "Test search", code: 'python3 ~/.openclaw/workspace/skills/qdrant-memory/scripts/search_memories.py --query "test" --user-id yourname' },
      ],
    },
  ];
}
