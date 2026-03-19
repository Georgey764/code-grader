# --- STAGE 1: Builder ---
    FROM node:20-bookworm AS builder

    RUN apt-get update && apt-get install -y python3 make g++
    
    WORKDIR /app
    COPY package*.json ./
    # Install only production dependencies
    RUN npm install --omit=dev
    
    # --- STAGE 2: Runner ---
    FROM node:20-bookworm-slim
    
    # We still need a shell to run inside the PTY!
    RUN apt-get update && apt-get install -y bash && rm -rf /var/lib/apt/lists/*
    
    WORKDIR /app
    
    # Create a non-root user for security (CRITICAL for a terminal server)
    RUN useradd -m terminaluser

    # Set correct permissions BEFORE switching user
    RUN chown -R terminaluser:terminaluser /app && chmod -R u+rw /app

    USER terminaluser

  
    
    # Copy only the compiled node_modules and code from builder
    COPY --from=builder /app/node_modules ./node_modules
    COPY . .
    
    EXPOSE 4000
    
    CMD ["node", "server.js"]