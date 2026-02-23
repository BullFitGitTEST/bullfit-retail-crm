# Bullfit Retail CRM

Customer relationship management system for Bullfit retail operations.

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express
- **Database:** Supabase (Postgres)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account & project

### Installation

```bash
# Clone the repo
git clone https://github.com/BullFitGitTEST/bullfit-retail-crm.git
cd bullfit-retail-crm

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials
```

### Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Linting & Formatting

```bash
npm run lint
npm run format
```

## Project Structure

```
src/
├── index.ts            # App entry point
├── config/             # Configuration (Supabase client, etc.)
├── routes/             # Express route definitions
├── controllers/        # Request handlers & business logic
├── models/             # TypeScript interfaces & types
├── middleware/          # Express middleware (auth, etc.)
└── utils/              # Utility functions
```

## License

ISC
