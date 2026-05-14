# Quotex - Professional Quotation & Invoice Generator

A modern web application for generating professional quotations and invoices with custom company letterhead design.

## Features

- **Quotation Generator** - Create detailed quotations with itemized tables, auto-calculation, payment terms, and bank details
- **Invoice Generator** - Generate invoices with tax handling, discounts, payment status tracking
- **PDF Export** - Download high-quality, print-ready PDFs matching professional corporate letterhead
- **Document Management** - Save, search, filter, duplicate, and delete documents
- **Real-time Preview** - Live preview of your document as you fill the form
- **Dark/Light Mode** - Full theme support with system preference detection
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Local Storage** - Documents persist in browser local storage

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion
- React Hook Form + Zod
- jsPDF + jspdf-autotable
- Lucide React Icons
- next-themes

## Getting Started

Install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

```bash
npm run build
```

The static export will be generated in the `dist` folder, ready for deployment on Vercel, Netlify, or any static hosting.

## Project Structure

```
src/
  app/              - Next.js App Router pages
  components/       - React components (ui, layout, forms, preview)
  hooks/            - Custom React hooks (localStorage, documents)
  lib/              - Utilities, schemas, helpers
  templates/        - PDF generation templates
  types/            - TypeScript type definitions
```

## Customization

Edit `src/types/index.ts` to update the `defaultCompanySettings` with your company details, logo, and branding.

## Deployment

This project is configured for static export and can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- Any static web host
