# 1. Use official Node.js LTS image
FROM node:20-alpine AS builder

# 2. Set working directory
WORKDIR /app

# 3. Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# 4. Install dependencies
RUN npm ci

# 5. Copy the rest of the app
COPY . .

# 6. Build the Next.js app
RUN npm run build

# -----------------------------
# Production image
# -----------------------------
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built files from the builder
COPY --from=builder /app/.next .next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

# Expose port 3000 (default Next.js)
EXPOSE 3000

# Start Next.js in production mode
CMD ["npm", "start"]
