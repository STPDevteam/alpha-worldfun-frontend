## AWE Frontend (awe-fe)

### Overview

A Next.js 15 App Router frontend for Web3 token launching platform on Base network. Built with Web3 integrations (Reown AppKit + SIWE, Wagmi + Viem), TanStack Query, and Tailwind CSS v4. This README documents the current project structure and where to add new code.

### Tech Stack

- **Framework**: Next.js 15 (App Router), React 19
- **Web3**: Reown AppKit, SIWE, Wagmi, Viem (Base network)
- **State**: TanStack Query, Zustand
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Blockchain**: Base network only

### Directory Layout

```text
awe-fe/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   ├── admin/[id]/page.tsx      # Token admin page
│   ├── how-it-works/            # How it works page
│   ├── launch-token/            # Token creation flow
│   ├── new-home/                # Home page
│   ├── world/[id]/              # Token detail pages
│   ├── api/
│   │   ├── auth/siwe/route.ts   # SIWE authentication
│   │   └── webhooks/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   └── not-found.tsx
├── components/                   # Feature & UI components
│   ├── ui/                       # Shadcn UI primitives
│   │   ├── button.tsx, input.tsx, dialog.tsx, card.tsx, table.tsx, etc.
│   ├── layout/                   # Layout components
│   │   ├── header.tsx, sidebar.tsx, navigation.tsx, breadcrumbs.tsx
│   ├── common/                   # Shared utilities
│   │   ├── loading-spinner.tsx, error-boundary.tsx, data-table.tsx, pagination.tsx
│   ├── home/                     # Home page components
│   │   ├── world-card-v2.tsx, world-cards-grid.tsx, world-list.tsx
│   ├── launch-token/             # Token launch flow components
│   ├── world-detail/             # Token detail components
│   │   ├── chart-section.tsx, overview-section.tsx, right-sidebar.tsx
│   ├── admin/                    # Admin panel components
│   ├── wallet-connect-button/   # Wallet connection
│   └── providers/                # React context providers
│       ├── client-provider.tsx, theme-provider.tsx, auth-provider.tsx
├── libs/                         # Business logic & utilities
│   ├── abi/                      # Smart contract ABIs
│   ├── configs/                  # App configuration
│   │   ├── wagmi-config.ts, siwe-config.ts, query-client.ts, env.ts
│   ├── constants/                # App constants
│   │   ├── network.ts, routes.ts, api-endpoints.ts, contracts.ts
│   ├── services/                 # API services
│   │   └── api/                  # Service layer
│   │       ├── base.service.ts, auth.service.ts, wallet.service.ts, world-card.service.ts
│   ├── hooks/                    # Custom React hooks
│   │   ├── auth/, common/, contracts/, wallet/, subgraph/
│   ├── stores/                   # Zustand stores
│   │   ├── auth.store.ts, world-cards-store.ts, toast.store.ts
│   ├── utils/                    # Utility functions
│   │   ├── cn.ts, format.ts, date.ts, validation.ts, crypto.ts
│   └── types/                    # TypeScript types
│       ├── api.ts, auth.ts, wallet.ts, world-card.ts, contracts.ts
├── public/                       # Static assets
│   ├── assets/, icons/, manifest.json
├── styles/                       # Additional styles
│   ├── components.css, utilities.css
├── components.json               # shadcn/ui config
├── next.config.ts                # Next.js config
├── tailwind.config.ts            # Tailwind CSS config
├── eslint.config.mjs             # ESLint config
├── tsconfig.json                 # TypeScript config
└── package.json                  # Dependencies & scripts
```

### Conventions

- **Route groups**: `(auth)` organizes authentication pages.
- **Components**: Keep primitives in `components/ui`, layout in `components/layout`, shared utilities in `components/common`, feature-specific components in their own folders (home, launch-token, world-detail, admin).
- **Providers**: Client-side context providers live in `components/providers`.
- **Configs**: Web3 (Base network), SIWE, Query client, and env parsing in `libs/configs`.
- **Services**: HTTP/API wrapper layer in `libs/services/api`.
- **Hooks**: Custom hooks in `libs/hooks` organized by domain (auth, wallet, contracts, subgraph, common).
- **Stores**: Zustand state management in `libs/stores`.
- **Smart Contracts**: ABIs in `libs/abi`, contract utilities in `libs/hooks/contracts`.
- **Types/Utils**: Centralized in `libs/types` and `libs/utils`.
- **Network**: All Web3 interactions are on Base network only.

### Getting started

- Install deps and run dev server:

```bash
pnpm install
pnpm dev
```

- Copy `.env.example` to `.env.local` and set values (e.g., `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_PROJECT_ID`).

### Adding Features

- **New pages**: Add under the appropriate `app/` folder (e.g., `app/launch-token`, `app/world/[id]`).
- **New UI components**: Add primitives to `components/ui`, feature-specific to their domain folder (e.g., `components/home`, `components/launch-token`, `components/world-detail`).
- **API calls**: Add service methods in `libs/services/api/*` and consume with TanStack Query hooks in `libs/hooks`.
- **Smart contracts**: Add ABIs to `libs/abi` and create hooks in `libs/hooks/contracts`.
- **Web3 interactions**: All on Base network - extend `libs/configs/wagmi-config.ts` and related hooks.
- **State management**: Use TanStack Query for server state, Zustand stores in `libs/stores` for client state.
- **Subgraph queries**: Add GraphQL queries in `libs/hooks/subgraph` for blockchain data.
