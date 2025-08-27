# Condominium Management System

## Overview

This is a full-stack condominium management application built with React, Express.js, and PostgreSQL. The system provides role-based access for administrators and tenants to manage apartments, users, and payment records. It features a modern UI built with shadcn/ui components, comprehensive authentication through Replit Auth, and a robust database layer using Drizzle ORM.

## Recent Changes (August 27, 2025)

✅ **User Balance System**: Implemented automatic balance management for overpayments
- Added `balance` field to users table to track credit from excess payments
- When admin approves a payment that exceeds the required amount, excess is added to user balance
- Balance is displayed in tenant dashboard showing available credit
- Balance calculation considers both user credit and pending debts for net balance

✅ **Exchange Rate Optimization**: Modified BCV service to only store USD rates
- Removed unnecessary currency storage (EUR, CNY, TRY, RUB) to focus only on USD
- Cleaned existing database records to remove non-USD currencies
- Improved synchronization efficiency by processing only relevant currency

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Design System**: Uses "New York" style from shadcn/ui with neutral base colors

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Authentication**: Replit Auth with OpenID Connect (OIDC)
- **Session Management**: Express sessions with PostgreSQL store
- **API Design**: RESTful endpoints with role-based access control

### Database Schema
The application uses PostgreSQL with three main entities:
- **Users**: Stores user profiles with condominium-specific fields (names, identification, contact info, user type)
- **Apartments**: Manages apartment information with references to users
- **Pagos (Payments)**: Tracks payment records with relationships to users and apartments
- **Sessions**: Handles session storage for authentication

### Authentication & Authorization
- **Provider**: Replit Auth using OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions with connect-pg-simple
- **Role System**: Two-tier access control (admin/propietario)
- **Security**: HTTP-only cookies with secure flags in production

### Data Validation
- **Schema Validation**: Zod schemas for runtime type checking
- **Database Schema**: Drizzle schema definitions with TypeScript types
- **Form Validation**: React Hook Form integrated with Zod resolvers

### Development Workflow
- **Build System**: Vite for frontend, esbuild for backend bundling
- **Development Server**: Vite dev server with HMR for frontend
- **Database Migrations**: Drizzle Kit for schema management
- **TypeScript**: Strict mode enabled with path aliases for clean imports

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL hosting via `@neondatabase/serverless`
- **Connection**: WebSocket-based connections for serverless compatibility

### Authentication Services
- **Replit Auth**: OpenID Connect provider for user authentication
- **Session Store**: PostgreSQL session storage using `connect-pg-simple`

### UI Component Libraries
- **Radix UI**: Comprehensive set of accessible UI primitives
- **Lucide React**: Icon library for consistent iconography
- **Date-fns**: Date manipulation and formatting utilities

### Development Tools
- **Replit Integration**: Cartographer plugin for development environment integration
- **Error Handling**: Runtime error overlay for development debugging
- **Font Loading**: Google Fonts integration for typography

### Build & Deployment
- **Vite Plugins**: React plugin, runtime error overlay, and Replit cartographer
- **PostCSS**: Tailwind CSS processing with autoprefixer
- **TypeScript**: Full type safety across frontend and backend with shared schemas