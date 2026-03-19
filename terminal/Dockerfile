# --- STAGE 1: Builder ---
FROM node:20-bookworm AS builder

RUN apt-get update && apt-get install -y python3 make g++

WORKDIR /app
COPY package*.json ./
# Install only production dependencies
RUN npm install --omit=dev

# --- STAGE 2: Runner ---
FROM node:20-bookworm-slim

    # Install bash, Python3, and Java (OpenJDK)
RUN apt-get update && apt-get install -y \
bash \
python3 \
default-jdk \
&& rm -rf /var/lib/apt/lists/*

# Optional: symlink python -> python3 to match dev behavior
RUN ln -s /usr/bin/python3 /usr/bin/python
    
# We still need a shell to run inside the PTY!
RUN apt-get update && apt-get install -y bash && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create a non-root user for security (CRITICAL for a terminal server)
RUN useradd -m terminaluser

# Copy only the compiled node_modules and code from builder
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Set correct permissions BEFORE switching user
RUN find /app -type d -exec chmod 700 {} \; \
    # Files: owner can read/write
    && find /app -type f -exec chmod 600 {} \; \
    # Make sure terminaluser owns everything
    && chown -R terminaluser:terminaluser /app
USER terminaluser

EXPOSE 4000

CMD ["node", "server.js"]