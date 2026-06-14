# Curator Notes Backend

## Overview

Curator Notes Backend is the server-side application for a notes management app with AI-assisted features such as summarizing, improving, and extracting key points from notes.

The backend handles authentication, database operations, note management, and AI credit-based usage for AI features.

---

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- Firebase Authentication
- Google Gemini API
- dotenv

---

## Features

- User authentication with Firebase
- Create, read, update, and delete notes
- Store rich note content as JSON
- AI-powered note assistance
  - Summarize notes
  - Improve writing
  - Extract key points
- AI credit system
- PostgreSQL database with Prisma
- Role-based user model
  - USER
  - PREMIUM
  - ADMIN

---

## Migration command
- npx prisma migrate dev --name your-migration-name
- npx prisma generate
- npx prisma migrate deploy