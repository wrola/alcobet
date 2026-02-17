# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copy root workspace files
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/

# Install dependencies
RUN npm ci --workspace=backend --include-workspace-root

# Copy backend source
COPY backend/ ./backend/

# Build
RUN npm run build --workspace=backend

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/

RUN npm ci --workspace=backend --include-workspace-root --omit=dev

COPY --from=build /app/backend/dist ./backend/dist

# Copy email templates
COPY backend/src/mail/templates ./backend/dist/mail/templates

EXPOSE 3000

CMD ["node", "backend/dist/main.js"]
