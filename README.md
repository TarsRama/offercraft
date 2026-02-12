# OfferCraft

Professional offer/proposal management SaaS platform for complex industries like construction, engineering, and professional services.

## Features

- 📝 **Professional Proposals** - Create stunning, branded proposals that win clients
- 👥 **Client Management** - Keep all client information organized in one place
- 📊 **Analytics & Insights** - Track proposal views, acceptance rates, and more
- 🔒 **Multi-tenant Security** - Enterprise-grade security for your business data
- ⚡ **Fast & Efficient** - Templates and automation to save hours of work
- 🌍 **Multi-language** - Create proposals in any language your clients speak

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **UI**: shadcn/ui + Tailwind CSS + Framer Motion
- **Database**: PostgreSQL via Neon
- **ORM**: Prisma
- **Auth**: NextAuth.js
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (we use Neon)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/TarsRama/offercraft.git
   cd offercraft
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` with your database and auth credentials.

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
offercraft/
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (auth)/         # Auth pages (login, register)
│   │   ├── (dashboard)/    # Dashboard pages
│   │   ├── api/            # API routes
│   │   └── page.tsx        # Landing page
│   ├── components/
│   │   ├── ui/             # shadcn/ui components
│   │   ├── layout/         # Layout components
│   │   └── providers/      # Context providers
│   ├── lib/
│   │   ├── auth.ts         # NextAuth configuration
│   │   ├── prisma.ts       # Prisma client
│   │   └── utils.ts        # Utility functions
│   └── middleware.ts       # Auth middleware
├── .env.example            # Environment variables template
└── package.json
```

## Database Schema

The application uses a multi-tenant architecture with the following main entities:

- **PlatformAdmin** - Super admin users for platform management
- **Tenant** - Organization/company accounts
- **User** - Users within tenants
- **Client** - Client companies with contacts and addresses
- **Offer** - Proposals with sections and articles
- **ArticleTemplate** - Reusable article templates
- **Notification** - User notifications

## Development

### Running migrations

```bash
npx prisma migrate dev
```

### Generating Prisma client

```bash
npx prisma generate
```

### Opening Prisma Studio

```bash
npx prisma studio
```

## Deployment

The app is designed to be deployed on Vercel with a Neon PostgreSQL database.

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
