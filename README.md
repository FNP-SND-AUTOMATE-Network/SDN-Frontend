# SDN Frontend

โปรเจค Frontend สำหรับระบบจัดการเครือข่าย SDN (Software-Defined Networking) พัฒนาด้วย Next.js 15 และ TypeScript


## 🚀 การติดตั้งและเริ่มต้นใช้งาน

### 1. Clone โปรเจค

```bash
git clone <repository-url>
cd SDN-Frontend
```

### 2. ติดตั้ง Dependencies

เข้าไปในโฟลเดอร์ `frontend`:

```bash
cd frontend
```
ใช้ bun :

```bash
bun install
```

### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local` ในโฟลเดอร์ `frontend`
## 🐳 การใช้งาน Docker

### Production Mode

รันจาก root directory ของโปรเจค:

```bash
# Build และรัน production container
docker-compose up --build (Recommand)

# หรือรันเฉพาะ production service
docker-compose up nextjs-frontend --build
```

Application จะรันที่ [http://localhost:3000](http://localhost:3000)

### Development Mode

```bash
# รัน development container พร้อม hot reload
docker-compose --profile dev up nextjs-dev --build
```

Application จะรันที่ [http://localhost:3001](http://localhost:3001)

### คำสั่ง Docker อื่นๆ

```bash
# Stop containers
docker-compose down

# View logs
docker-compose logs nextjs-frontend

# Rebuild without cache
docker-compose build --no-cache

# Remove all containers and volumes
docker-compose down -v
```

## 📁 โครงสร้างโปรเจค

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── login/             # หน้า Login
│   │   ├── register/          # หน้า Register
│   │   ├── dashboard/         # หน้า Dashboard
│   │   ├── device/            # จัดการอุปกรณ์
│   │   ├── setting/           # การตั้งค่า
│   │   │   ├── mfa/          # MFA/2FA Settings
│   │   │   ├── profile/      # โปรไฟล์ผู้ใช้
│   │   │   └── account/      # จัดการบัญชี
│   │   └── ...
│   ├── components/            # React Components
│   │   ├── ui/               # UI Components พื้นฐาน
│   │   ├── auth/             # Authentication Components
│   │   ├── device/           # Device-related Components
│   │   └── ...
│   ├── contexts/             # React Contexts (AuthContext, etc.)
│   ├── hooks/                # Custom React Hooks
│   ├── lib/                  # Utilities และ Helpers
│   │   ├── api.ts           # API Client
│   │   └── utils.ts         # Helper Functions
│   └── services/             # API Services
│       ├── userService.ts
│       ├── deviceNetworkService.ts
│       └── ...
├── public/                   # Static Files
├── .env.local               # Environment Variables (ไม่ commit)
├── .env.example             # ตัวอย่าง Environment Variables
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

## ✨ ฟีเจอร์หลัก

### 🔐 Authentication & Security

- **Login/Register** - ระบบเข้าสู่ระบบและสมัครสมาชิก
- **Email OTP Verification** - ยืนยันอีเมลด้วย OTP
- **TOTP MFA (2FA)** - Two-Factor Authentication ด้วย TOTP (Google Authenticator)
- **Role-based Access Control** - ระบบสิทธิ์ตาม Role (VIEWER, ENGINEER, ADMIN, OWNER)

### 📊 Dashboard

- แสดงภาพรวมของระบบ
- สถิติและข้อมูลสำคัญ

### 🖥️ Device Management

- จัดการอุปกรณ์เครือข่าย (Switches, Routers, Firewalls, Access Points)
- ดูรายละเอียดอุปกรณ์
- จัดการ Tags และ Categories
- ดู Network Interfaces

### ⚙️ Settings

- **Profile** - จัดการข้อมูลส่วนตัว
- **Account** - เปลี่ยนรหัสผ่าน
- **MFA/2FA** - ตั้งค่า Two-Factor Authentication
  - Enable/Disable TOTP
  - QR Code Scanning
  - Backup Codes (Coming Soon)

### 👥 User Management (Admin)

- จัดการผู้ใช้ในระบบ
- เปลี่ยน Role
- รีเซ็ตรหัสผ่าน

### Audit Logs

- ดูประวัติการใช้งานระบบ
- Filter และ Search