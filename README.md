# SDN Frontend

## 🚀 เริ่มต้นใช้งาน

### การติดตั้ง Dependencies

```bash
bun install
```

### การรัน Development Server

```bash
bun dev
```

เปิด [http://localhost:3000](http://localhost:3000) ในเบราว์เซอร์เพื่อดูผลลัพธ์

## 🐳 การใช้งาน Docker

### Production Mode

```bash
# Build และรัน production container
docker-compose up --build

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
```


## 🛠️ เทคโนโลยีที่ใช้

- **Next.js 15** - React Framework พร้อม App Router
- **TypeScript** - Type Safety
- **Tailwind CSS** - Utility-first CSS Framework
- **Bun** - Fast JavaScript Runtime
- **Docker** - Containerization
- **Icon** - Frontawsome
- **Front** - SF PRO

## 📝 Scripts ที่มีให้ใช้

```bash
bun dev          # รัน development server พร้อม Turbopack
bun build        # Build สำหรับ production
bun start        # รัน production server
bun lint         # ตรวจสอบ code style
bun type-check   # ตรวจสอบ TypeScript types
```

## 🔧 การ Configuration

### Environment Variables

สร้างไฟล์ `.env` สำหรับ environment variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Tailwind CSS

Configuration อยู่ในไฟล์ `tailwind.config.ts`

### TypeScript

Configuration อยู่ในไฟล์ `tsconfig.json`
