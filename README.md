# 🌐 CrossPixel Network

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql)
![Auth.js](https://img.shields.io/badge/Auth.js-Security-purple?style=for-the-badge&logo=nextauth)

Bienvenido al repositorio oficial de **CrossPixel Web**, una plataforma de comunidad integral diseñada para redefinir el ecosistema y la gestión de redes de gaming. Construida de cero para ofrecer una experiencia ultra-rápida, segura y escalable.

---

## ✨ Características Principales

*   **🛡️ Autenticación Moderna (Auth.js):** 
    Soporte para inicio de sesión local (usuario/email), verificación por SMTP y OAuth integrado (Discord y Google) para un acceso instantáneo sin perder la seguridad.
*   **🌍 Multi-Idioma (i18n):** 
    Traducción dinámica implementada en todo el sistema (`en-US` y `de-DE`) incluyendo el panel de control. Todo adaptado para crecimiento internacional.
*   **💬 Foros de Comunidad (Forums):** 
    Hilos de discusión, respuestas enriquecidas, protección temporal y jerarquías limpias diseñadas para el feedback efectivo de los jugadores.
*   **🎫 Sistema de Soporte Avanzado (Tickets):** 
    Permite a los usuarios crear tickets categorizados y recibir atención priorizada en tiempo real.
*   **👑 Roles y Permisos Granulares:**
    Motor de permisos (`admin.access`, `forums.moderate`, etc.) asignables por roles personalizables para miembros de una jerarquía extensa (Staff, Admin, VIP).
*   **⚙️ Panel de Administración Dinámico:**
    Un centro de control absoluto (`/admin/*`) donde el administrador puede gestionar usuarios, crear categorías de foros, definir reglas de modos de juego y visualizar notificaciones globales.

## 🛠️ Tecnologías Empleadas

El proyecto está creado utilizando un "Stack" moderno y robusto, garantizando el mejor rendimiento:
- **Framework:** `Next.js 14` (App Router)
- **Lenguaje:** `TypeScript`
- **Base de Datos:** `MySQL` | `PostgreSQL` | `SQLite`
- **ORM:** `Prisma`
- **Seguridad y Cifrado:** `bcryptjs`, `NextAuth (Auth.js v5)`
- **Core de UI:** Diseño robusto implementando CSS Modules y alertas nativas.

---

## 🚀 Despliegue en Producción (Vercel)

El proyecto está empaquetado para escalar globalmente y sobrevivir flujos altísimos de jugadores gracias a **Vercel** o plataformas PaaS.

1. **Variables de Entorno (`.env`):**
   Asegúrate de rellenar todas las variables necesarias extraídas de `.env.example`, en especial tu `DATABASE_URL` y tu `AUTH_SECRET`.
   
   *Si estás detrás de un proxy/Pterodactyl, activa `AUTH_TRUST_HOST=true`.*

2. **Base de Datos Remota:**
   El código espera una base de datos persistente (*MySQL* o *PostgreSQL* preferiblemente si estás en servicios Serverless) para persistir las migraciones.

3. **Deploy Automatizado:**
   Una vez configurado Vercel, sólo ejecuta el siguiente script en tu terminal para compilar el proyecto o ver su despliegue directamente desde el repositorio:
   ```bash
   npm run build && npm run start
   ```

## 💻 Desarrollo Local

Si deseas clonar el repositorio para desarrollar y contribuir locamente, es tan sencillo como:

1. **Clonar e instalar dependencias:**
   ```bash
   git clone https://github.com/tu-usuario/cross-pixel-web.git
   cd cross-pixel-web
   npm install
   ```

2. **Sincronizar y generar la Base de Datos:**
   ```bash
   npm run db:setup
   ```
   *(Este comando inyectará los roles básicos y sincronizará Prisma de golpe).*

3. **Inicia el servidor en modo desarrollo:**
   ```bash
   npm run dev
   ```

---

❤️ **Desarrollado con mucha pasión para dar vida a la comunidad.**
