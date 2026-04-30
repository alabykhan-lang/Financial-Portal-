# Financial Portal - Standard Schools

A modular, high-performance financial management and educational portal built with React 18, Vite 5, and Supabase.

## 🚀 Key Features
- **Core Dashboard**: Real-time financial overview and system status.
- **Financial Management**: Daily Cash Book, Student Ledgers, Payment Analysis, Accounting, and Salaries.
- **Educational Management**: Class Portal, Lesson Management, and External Exam tracking.
- **Admin Suite**: Advanced user management and system settings.
- **AI Integration**: Built-in AI Audit and Anomaly Detection for financial records.

## 📁 Project Structure
The codebase follows a modular architecture:
- `src/components/core`: Application entry points, authentication, and layout components.
- `src/components/finance`: All financial processing modules.
- `src/components/edu`: Educational management and class tracking.
- `src/components/admin`: Administrative and system-wide settings.
- `src/context`: Centralized state management via `AppContext`.
- `src/utils`: API wrappers and helper functions for Supabase integration.

## 🛠 Tech Stack
- **Frontend**: React 18
- **Build Tool**: Vite 5
- **Backend**: Supabase (PostgreSQL + RLS)
- **Styling**: Vanilla CSS with a Navy/Gold design system.

## 📦 Deployment
This project is configured for seamless deployment on **Vercel**. 
Ensure the following Environment Variables are set:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_OPENROUTER_API_KEY` (for AI features)
