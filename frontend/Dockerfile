# --- Step 1: Builder image ---
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy all files
COPY . .

# Build the Next.js app (build-time env from Doppler will go here)
RUN yarn build

# --- Step 2: Runtime image ---
FROM node:20-alpine AS runner

WORKDIR /app

# Copy build from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./

# Install only prod deps
RUN yarn install --frozen-lockfile --production

EXPOSE 3000

ENV NODE_ENV=production

CMD ["yarn", "start"]