# SDN Frontend

A modern, full-featured frontend for an SDN (Software-Defined Networking) management platform. Built with **Next.js 15**, **React 19**, **TypeScript**, and **MUI (Material UI) v7**, it provides a comprehensive web interface for managing network devices, topology, IP addresses, policies, configuration templates, backups, and real-time monitoring — all with robust authentication and role-based access control.

## ✨ Key Features

### 🔐 Authentication & Security

- **Login / Register** with email OTP verification
- **TOTP-based MFA (2FA)** — Google Authenticator compatible (setup, verify, disable)
- **Forgot Password / Reset Password** flow with email OTP
- **CSRF Protection** — double-submit cookie pattern on all mutating requests
- **HttpOnly Cookie Sessions** with automatic token refresh on 401
- **Role-Based Access Control (RBAC)** — `VIEWER`, `ENGINEER`, `ADMIN`, `OWNER` roles with UI-level enforcement

### 📊 Dashboard

- System overview with summary cards
- **Zabbix Integration** — live host monitoring, active problems, top metrics, and host detail modals
- Real-time WebSocket alerts / notifications

### 🖥️ Device Management

- Full CRUD for network devices (switches, routers, firewalls, access points, etc.)
- Device detail view with live configuration retrieval
- Network interface management
- Tag and tag-group management
- Site management (hierarchical site tree)
- Device operation tracking (create, edit, delete operations)
- **IPAM Picker** integration for Management IP and Netconf Host fields

### 🌐 Network Topology

- Interactive topology canvas powered by **React Flow** (`@xyflow/react`)
- Site-based tree navigation sidebar
- Device table with bulk selection
- Configuration modal with per-device config panels
- Template deployment onto topology devices
- Config preview and confirmation modals

### 📋 Policy Management (Intent-Based Networking)

- Policy creation wizard with step-by-step flow (category → configuration)
- Policy table with filtering and search
- Policy detail drawer
- OpenDaylight flow synchronization modal

### 📝 Configuration Templates

- Template card grid with create / edit / detail modals
- Jinja2-style templating with variable support
- Template deployment to devices via topology

### 🗂️ IP Address Management (IPAM)

- Hierarchical tree sidebar (Sections → Subnets → IPs)
- Subnet table and IP address table views
- **IP Space Map** — visual grid showing IP allocation status with paginated loading
- IP address form modal with IPAM picker for interactive selection
- Section and subnet CRUD modals
- Full IPAM lifecycle: book, release, reactivate

### 💾 Configuration Backup

- Backup profile management with scheduling (cron-based)
- Backup history table with diff comparison
- Manual and scheduled backup triggers
- Pause / resume / offline backup profiles
- Configuration diff viewer (side-by-side comparison)

### 📜 Audit Logs

- System-wide activity logging
- Filterable and searchable audit log table

### ⚙️ Settings

- **Profile** — update personal information
- **Account** — change password
- **MFA/2FA** — enable/disable TOTP with QR code scanning

### 👥 User Management (Admin)

- User listing and role management
- Password reset by administrators

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) |
| UI Library | [React 19](https://react.dev/) |
| Component Library | [MUI v7](https://mui.com/) (Material UI, MUI Lab, MUI X Charts) |
| Styling | [Tailwind CSS 3](https://tailwindcss.com/) + [Emotion](https://emotion.sh/) |
| Icons | [Font Awesome 7](https://fontawesome.com/), [Lucide React](https://lucide.dev/), [React Icons](https://react-icons.github.io/react-icons/) |
| Topology Canvas | [@xyflow/react](https://reactflow.dev/) (React Flow) |
| API Client | Custom fetch wrapper + [openapi-fetch](https://openapi-ts.dev/) with generated types |
| Date Utilities | [date-fns](https://date-fns.org/) |
| QR Code | [react-qr-code](https://github.com/rosskhanas/react-qr-code) |
| Package Manager | [Bun](https://bun.sh/) |
| Containerization | Docker + Docker Compose |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+ or [Bun](https://bun.sh/)
- [Docker](https://www.docker.com/) (optional, for containerized deployment)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd SDN-Frontend
```

### 2. Install Dependencies

```bash
cd frontend
bun install
```

### 3. Configure Environment Variables

Create a `.env.local` file inside the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws/alerts
```

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000` |
| `NEXT_PUBLIC_WS_URL` | WebSocket endpoint for real-time alerts | `ws://localhost:8000/ws/alerts` |

### 4. Run Development Server

```bash
bun run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

---

## 🐳 Docker

### Development Mode (Recommended)

Run from the project root directory:

```bash
docker-compose up --build
```

The application will be available at [http://localhost:3000](http://localhost:3000) with hot-reload enabled.

### Common Docker Commands

```bash
# Stop containers
docker-compose down

# View logs
docker-compose logs sdn-frontend

# Rebuild without cache
docker-compose build --no-cache

# Remove all containers and volumes
docker-compose down -v
```

---

## 📁 Project Structure

```
SDN-Frontend/
├── docker-compose.yml           # Docker Compose orchestration
├── README.md
└── frontend/
    ├── Dockerfile               # Production Docker image
    ├── Dockerfile.dev           # Development Docker image
    ├── package.json
    ├── tailwind.config.ts
    ├── tsconfig.json
    ├── next.config.js
    └── src/
        ├── app/                 # Next.js App Router pages
        │   ├── login/           # Login page
        │   ├── register/        # Registration page
        │   ├── otp/             # OTP verification page
        │   ├── forgot-password/ # Forgot password page
        │   ├── reset-password/  # Reset password page
        │   ├── dashboard/       # Dashboard (Zabbix monitoring)
        │   ├── device/          # Device management
        │   ├── topology/        # Network topology canvas
        │   ├── policies/        # Policy management (IBN)
        │   ├── templates/       # Configuration templates
        │   ├── ipam/            # IPAM management
        │   ├── ip-management/   # IP management views
        │   ├── audit-log/       # Audit log viewer
        │   └── setting/         # User settings
        │       ├── profile/     # Profile settings
        │       ├── account/     # Account / password
        │       └── mfa/         # MFA/2FA settings
        ├── components/          # React components
        │   ├── ui/              # Reusable UI (Navbar, Sidebar, Pagination, etc.)
        │   ├── auth/            # Authentication components
        │   ├── dashboard/       # Dashboard & Zabbix components
        │   ├── device/          # Device CRUD, detail, backup, operations
        │   │   ├── device-list/ # Device listing
        │   │   ├── device-detail/ # Device detail views
        │   │   ├── backup/      # Backup management components
        │   │   ├── operation/   # Operation tracking components
        │   │   ├── site/        # Site management
        │   │   └── tag-group/   # Tag & tag-group management
        │   ├── topology/        # Topology canvas, config, deployment
        │   ├── policies/        # Policy wizard, table, filters
        │   ├── templates/       # Template CRUD modals & cards
        │   ├── ipam/            # IPAM tree, tables, space map, forms
        │   ├── audit/           # Audit log components
        │   ├── profile/         # Profile components
        │   ├── account/         # Account components
        │   ├── layout/          # Layout wrappers
        │   ├── modals/          # Shared modal components
        │   └── providers/       # Context providers (MUI theme, etc.)
        ├── contexts/            # React Contexts
        │   ├── AuthContext.tsx   # Authentication state
        │   └── AlertContext.tsx  # Global alert/notification state
        ├── hooks/               # Custom React hooks
        │   └── useSnackbar.ts   # Snackbar notification hook
        ├── lib/                 # Utilities & configuration
        │   ├── api.ts           # Primary API client (fetch wrapper)
        │   ├── apiv2/           # OpenAPI-generated typed API client
        │   ├── theme.ts         # MUI theme configuration
        │   ├── emotion.ts       # Emotion cache setup
        │   ├── fontawesome.ts   # Font Awesome library config
        │   └── utils.ts         # Helper functions
        └── services/            # Domain-specific API services
            ├── userService.ts
            ├── deviceNetworkService.ts
            ├── topologyService.ts
            ├── intentService.ts
            ├── ipamService.ts
            ├── auditService.ts
            ├── siteService.ts
            ├── tagService.ts
            ├── configurationTemplateService.ts
            └── operatingSystemService.ts
```

---

## 📜 Available Scripts

Run from the `frontend/` directory:

| Command | Description |
|---|---|
| `bun run dev` | Start Next.js development server with hot-reload |
| `bun run build` | Create optimized production build |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint checks |
| `bun run type-check` | Run TypeScript type checking (`tsc --noEmit`) |
| `bun run api:gen` | Generate typed API client from OpenAPI spec |