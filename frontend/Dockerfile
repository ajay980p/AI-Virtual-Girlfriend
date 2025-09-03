# 1️⃣ Builder Stage: Install and build the app
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy only dependency files (for better Docker cache)
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy the full app source code
COPY . .

# Build the Next.js app (standalone output will be created)
RUN npm run build

# 2️⃣ Runtime Stage: Slim final image with only runtime files
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy the standalone build and public assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# (Optional) Expose port (Next.js runs on 3000 by default)
EXPOSE 3000

# Run the app using the standalone server file
CMD ["node", "server.js"]