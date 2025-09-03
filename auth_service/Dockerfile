# Stage 1: Build the TypeScript application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the TypeScript code into JavaScript
RUN npm run build

# Stage 2: Create the production image
FROM node:20-alpine
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm install --production

# Copy the compiled JavaScript from the builder stage (assuming it's in a 'dist' folder)
COPY --from=builder /app/dist ./dist

# Expose the port the app runs on
EXPOSE 4500

# The command to start the application
CMD ["node", "dist/server.js"]