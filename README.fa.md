# SaaS Starter

یک boilerplate فول‌استک برای ساخت SaaS با Next.js، NestJS، PostgreSQL و Redis در یک monorepo.

## اجرا

1. cp .env.example .env
2. docker compose up --build
3. http://localhost:3000

MailHog در http://localhost:8025 در دسترس است. حساب admin اولیه از DEFAULT_ADMIN_EMAIL و DEFAULT_ADMIN_PASSWORD ساخته می‌شود؛ رمز آن را قبل از استفاده واقعی تغییر دهید.

## امکانات

- احراز هویت با Argon2 و cookieهای HTTP-only
- refresh token چرخشی و تشخیص reuse
- RBAC برای USER و ADMIN
- سازمان و OWNER/MEMBER با tenant isolation
- Projects به عنوان ماژول نمونه
- Prisma migration، Swagger، health check و audit log
- Docker، CI و ساختار آماده انگلیسی/فارسی RTL

جزئیات معماری و راهنمای توسعه در README انگلیسی قرار دارد.