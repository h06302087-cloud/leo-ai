# FROM node:22-alpine

# WORKDIR /app

# # Install dependencies
# COPY package*.json ./
# RUN npm install --omit=dev

# # Copy source
# COPY . .
# RUN npm run build

# # Create non-root user
# RUN addgroup -g 1001 -S nodejs
# RUN adduser -S nodejs -u 1001
# USER nodejs

# EXPOSE $3003

# CMD ["node", "dist/index.js"]
FROM node:22-alpine AS builder

WORKDIR /app

# Enable corepack to get pnpm automatically
RUN corepack enable

# Copy package management files (including pnpm-lock.yaml if present)
COPY package.json pnpm-lock.yaml* ./

# Install ALL dependencies (including devDependencies like tsc)
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY . .

# Build the project (tsc will now execute successfully)
RUN pnpm run build

# Purge development dependencies to shrink the image
RUN pnpm prune --prod


# --- Production Stage ---
FROM node:22-alpine

WORKDIR /app

# Create non-root system user and group
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Copy lean production modules and built application from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Switch to the non-root user for security
USER nodejs

# Expose the service port
EXPOSE 3003

# Execute the application runtime
CMD ["node", "dist/index.js"]
