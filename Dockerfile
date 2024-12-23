# Build stage
FROM node:21-alpine AS builder

WORKDIR /app

COPY pnpm-lock.yaml ./
COPY package.json ./
COPY prisma ./prisma/
COPY .env.example .env

RUN npm install -g pnpm

RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN pnpx prisma generate

# Copy application code
COPY . .

# Build the application
RUN pnpm build

# Production stage
FROM node:21-alpine AS production

WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/build build/
COPY --from=builder /app/prisma prisma/

# Generate Prisma client in production
RUN pnpx prisma generate

# Expose the port your app runs on
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "build"]