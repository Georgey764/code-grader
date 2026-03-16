# 1. Use official Node.js LTS image
FROM node:20-alpine AS builder

ARG NEXT_PUBLIC_URL
ENV NEXT_PUBLIC_URL=${NEXT_PUBLIC_URL}

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

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy the standalone folder 
COPY --from=builder /app/.next/standalone ./
# Copy static files (Next.js expects these in a specific subfolder)
COPY --from=builder /app/.next/static ./.next/static


EXPOSE 3000

CMD ["node", "server.js"]
