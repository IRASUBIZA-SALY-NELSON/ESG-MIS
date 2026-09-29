# RCA App

A comprehensive school management application built with Next.js for managing the entire school operations including elections, teacher management, and administrative tasks.

## Features

- **Elections System**: Manage school elections with voting and results tracking
- **Teacher Management**: Comprehensive teacher administration portal
- **Dashboard**: Real-time insights and analytics
- **Report Cards**: Student performance tracking and reporting
- **Innovations & Opportunities**: Track and manage school innovations
- **User Authentication**: Secure JWT-based authentication
- **Document Management**: Upload, view, and manage various document formats
- **PDF Generation**: Generate reports and documents on-the-fly
- **Data Export**: Export data to Excel and other formats

## Tech Stack

- **Framework**: Next.js 14.2.4 (React 18.2.0)
- **Language**: TypeScript 5.2.2
- **Styling**: TailwindCSS 3.4.0
- **UI Components**: 
  - Mantine UI v8
  - NextUI v2
  - Tremor
  - Headless UI
- **Forms**: React Hook Form + Yup validation
- **State Management**: TanStack Query (React Query), SWR
- **Data Tables**: TanStack Table
- **Charts**: Chart.js with React wrapper
- **PDF Handling**: 
  - PDF generation: jsPDF, @react-pdf/renderer, pdf-lib
  - PDF viewing: react-pdf, pdfjs-dist
- **Document Viewing**: @cyntler/react-doc-viewer
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast, Mantine Notifications
- **Code Quality**: ESLint, Prettier, Husky

## Prerequisites

- Node.js >= 16 and < 21
- npm, pnpm, or bun package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd rca_app
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
# or
bun install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with required environment variables.

4. Install Husky hooks:
```bash
npm run prepare
```

## Development

Run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5443`

## Build

Build the application for production:

```bash
npm run build
```

Note: The build uses increased memory allocation (4GB) for optimal performance.

## Deployment

### Start Production Server

```bash
npm run start:prod
```

The production server runs on port `9099`.

### Docker Deployment

Build and run using Docker:

```bash
docker-compose up -d
```

Docker workflows are configured in `.github/workflows/`:
- `docker-test.yml` - Test environment
- `docker-prod.yml` - Production environment

### Deployment Workflows

GitHub Actions workflows are set up for:
- **Preview Builds**: `.github/workflows/build-preview.yml`
- **Production Builds**: `.github/workflows/build.yml`
- **Test Deployment**: `.github/workflows/deploy-test.yml`
- **Production Deployment**: `.github/workflows/deploy-prod.yml`

## Available Scripts

- `npm run dev` - Start development server on port 5443
- `npm run build` - Build for production
- `npm run start` - Start production server on port 5443
- `npm run start:prod` - Start production server on port 9099
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier
- `npm run prepare` - Install Husky git hooks

## Git Hooks

Pre-configured Husky hooks:
- **pre-commit**: Runs linting and formatting checks
- **pre-push**: Runs validation before pushing

## Project Structure

```
rca_app/
├── .github/          # GitHub Actions workflows
├── .husky/           # Git hooks
├── public/           # Static assets
│   └── svg/         # SVG icons
├── scripts/          # Deployment scripts
├── src/
│   └── app/         # Next.js app directory
│       ├── (shared)/ # Shared routes
│       │   ├── elections/
│       │   └── teacher/
│       └── ...
├── .env.local       # Environment variables
├── next.config.js   # Next.js configuration
├── tailwind.config.js
└── package.json
```

## Environment Configuration

Environment-specific configuration scripts:
- `scripts/create_test_env.sh` - Test environment setup
- `scripts/create_prod_env.sh` - Production environment setup

## Security

- JWT-based authentication
- Environment variable management
- Git hooks for code quality
- Docker security best practices

## License

ISC

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Issues

Report issues at the project's issue tracker.

---

**Note**: This application is designed for school management and includes sensitive educational data. Ensure proper security measures are in place when deploying to production.
