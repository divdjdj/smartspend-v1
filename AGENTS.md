<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# SpendSmart Developer & Coding Guidelines

## 1. Directory Structure
- **`src/app`**: Next.js App Router pages, layouts, and API routes.
- **`src/features`**: Feature-specific logic grouped into subfolders:
  - `shared`: Shared models (`src/features/shared/model`), services, and API routes used across features.
  - `admin`: Admin portal features and routes.
  - `auth`: Authentication mechanisms and flows.
  - `client`: Client portal features.
- **`src/components`**: UI components, subdivided into:
  - `ui`: Reusable primitive design system components (e.g., `dialog`, `button`, `sheet` via shadcn).
  - `marketing`: Components specifically for the landing/marketing website.
- **`src/lib`**: Common utilities (e.g., `mongodb.ts`, `utils.ts`).
- **`src/data`**: Static files containing site data (e.g., `tools.ts`).
- **`doc/`**: System design documentation (e.g., `DB_CONNECTION.md`, `README.md`, `USER_MODEL_USAGE.md`).

## 2. Database Connection Standard (`src/lib/mongodb.ts`)
- **Cached Connections**: Mongoose connections must be cached globally to prevent exhaustion in serverless environments.
- **DNS Overrides**: Always set public DNS servers (`dns.setServers(['8.8.8.8', '1.1.1.1'])`) in database initialization to prevent SRV resolution failures (e.g., querySrv ECONNREFUSED) on strict local networks.
- **Development Model Caching**: In development (`process.env.NODE_ENV === "development"`), always delete the mongoose model from `mongoose.models` before exporting to ensure schema changes hot-reload correctly. Example:
  ```typescript
  if (process.env.NODE_ENV === "development") {
    delete mongoose.models.User
  }
  export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
  ```
- **Connection Invocation**: Always import `connectDB` from `@/lib/mongodb` (or the correct path) and await it at the beginning of API routes or Server Actions.

## 3. UI Styling & Typography
- **Tailwind & Shadcn**: Use components from `@/components/ui/` for consistency. Customize styling using Tailwind CSS utility classes and modern styling patterns.
- **Client Components**: Mark files with `'use client';` at the very top if they utilize React state (`useState`), hooks, or interactive events.
