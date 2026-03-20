# --- STAGE 1: Builder ---
FROM node:20-bookworm AS builder

# node-pty needs build-essential (make, g++, gcc) and python
RUN apt-get update && apt-get install -y \
build-essential \
python3 \
&& rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./

# Build native modules (like node-pty) for the specific architecture
RUN npm install



# --- STAGE 2: Runner ---
FROM node:20-bookworm-slim

# 1. Install Java & Python
# We add 'procps' which helps node-pty manage processes
RUN mkdir -p /usr/share/man/man1 && \
    apt-get update && apt-get install -y \
    bash \
    python3 \
    openjdk-17-jdk-headless \
    procps \
    && rm -rf /var/lib/apt/lists/*

# 2. THE FIX: Let the system link Java automatically
# This ensures /usr/bin/javac and /usr/bin/java always exist
RUN update-alternatives --get-selections | grep -E '^(java|javac)'

# 3. Symlink python
RUN ln -s /usr/bin/python3 /usr/bin/python

WORKDIR /app

# 4. Create user
RUN useradd -m -u 1001 coder

# 5. Copy your files
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# 6. Permissions (700 on /app allows 'coder' to write/execute/delete)
RUN chown -R coder:coder /app && \
    chmod -R 700 /app

USER coder

EXPOSE 4000
CMD ["node", "server.js"]