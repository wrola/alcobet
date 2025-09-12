# Alcobet - Alcohol Abstinence Betting App

A monorepo containing both frontend (React/Vite) and backend (NestJS) applications for an alcohol abstinence betting platform.

## Prerequisites

**Global NX Installation Required:**
```bash
npm install -g nx@latest
```

This project uses NX as a monorepo manager and requires global installation to work properly.

## Project Structure

```
├── backend/          # NestJS API server
├── frontend/         # React frontend application  
├── spec/            # Project specifications and documentation
├── .github/         # GitHub Actions CI/CD workflows
└── nx.json          # NX workspace configuration
```

## Development Setup

1. **Install NX globally:**
   ```bash
   npm install -g nx@latest
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run development servers:**
   ```bash
   # Start both applications
   npm run dev
   
   # Or run individually
   nx serve backend
   nx serve frontend
   ```

## Available Commands

### Build Commands
```bash
npm run build          # Build all projects
nx build backend       # Build backend only
nx build frontend      # Build frontend only
```

### Test Commands  
```bash
npm run test           # Test all projects
nx test backend        # Test backend only
nx test frontend       # Test frontend only
```

### Lint Commands
```bash
npm run lint           # Lint all projects
nx lint backend        # Lint backend only  
nx lint frontend       # Lint frontend only
```

### NX-Specific Commands
```bash
nx affected -t build   # Build only affected projects
nx affected -t test    # Test only affected projects
nx affected -t lint    # Lint only affected projects
nx run-many -t build   # Build all projects in parallel
```

## Deployment

This project is configured with GitHub Actions for CI/CD:

- **Main Pipeline** (`.github/workflows/ci.yml`): Runs on pushes to `main` and `develop`
- **Development Pipeline** (`.github/workflows/development.yml`): Runs on feature branches

## Technologies

- **Frontend:** React 19, TypeScript, Vite, Mantine UI, Tailwind CSS
- **Backend:** NestJS, TypeScript, SQLite, TypeORM
- **Monorepo:** NX
- **CI/CD:** GitHub Actions