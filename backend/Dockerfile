# Stage 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Stage 2: Runtime stage
FROM node:18-alpine

WORKDIR /usr/src/app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy only necessary files from builder
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/src ./src

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start app in production mode
CMD ["npm", "start"]
