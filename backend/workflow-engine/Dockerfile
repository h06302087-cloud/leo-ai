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

# EXPOSE $3002

# CMD ["node", "dist/index.js"]
# --- Build Stage ---
FROM node:22-alpine AS builder

WORKDIR /app

# Enable corepack to activate native pnpm support
RUN corepack enable

# Copy package management files (matches both package.json and pnpm-lock.yaml)
COPY package.json pnpm-lock.yaml* ./

# Install ALL dependencies (including TypeScript/devDependencies)
RUN pnpm install --no-frozen-lockfile

# Copy the rest of your application source code
COPY . .

# Build the application (tsc will execute successfully here)
RUN pnpm run build

# Remove development dependencies to minimize the final image footprint
RUN pnpm prune --prod


# --- Production Stage ---
FROM node:22-alpine

WORKDIR /app

# Create non-root system user and group safely in a single layer
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Copy only the compiled code and production dependencies from the builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Switch to the non-root user for security
USER nodejs

# Expose the correct service port
EXPOSE 3002

# Run the production build
CMD ["node", "dist/index.js"]
