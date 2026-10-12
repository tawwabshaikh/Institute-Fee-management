# Institute Fee Management System

A responsive web application for managing an institute's student records, monthly fee cycles, payment history, parent reminders, and collection reports. The project is built with React and TypeScript and currently runs as a client-side demo using browser local storage.

## Overview

The dashboard brings fee collection activity into one place. Administrators can review student balances, generate monthly fee records, record payments, monitor overdue accounts, and inspect reports. Sample student, fee, payment, and notification data is generated automatically the first time the app is opened.

## Features

- **Dashboard:** Collection totals, expected fees, pending and overdue balances, recent payments, and charts.
- **Student management:** Search student records, add or edit profiles, activate or deactivate students, and view individual profiles and fee history.
- **Monthly fee management:** Generate fee records for active students, filter by billing period and payment status, and send simulated reminders.
- **Payment tracking:** Record payments against fee records, track payment methods and receipts, and update fee balances.
- **Notifications:** Review notification history and message templates; create simulated WhatsApp or SMS messages for the demo.
- **Reports:** Review collection, payment method, due, and student reports.
- **Settings and audit history:** Configure institute details and reminder preferences, edit message templates, and review recorded actions.
- **Local persistence:** App data is saved in the browser's `localStorage` so it remains available after a page refresh in the same browser.

## Tech Stack

- React 18 and TypeScript
- Vite
- Tailwind CSS 4
- React Router
- Recharts
- Lucide React
- Framer Motion
- `date-fns` and `uuid`

## Getting Started

### Requirements

- Node.js 18 or newer
- npm

### Install and run

```bash
git clone https://github.com/tawwabshaikh/Institute-Fee-management.git
cd Institute-Fee-management
npm install
npm run dev
```

Open the local URL shown by Vite (the development server is configured for port `3000`).

### Demo login

```text
Email:    admin@nc2.com
Password: admin123
```

The credentials are hard-coded for demonstration in the client application. This login is not production authentication.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server on port 3000. |
| `npm run build` | Create a production build in `dist/`. |
| `npm run typecheck` | Run the TypeScript compiler without emitting files. |

## Application Pages

| Page | Purpose |
| --- | --- |
| Dashboard | Summary metrics, collection charts, recent payments, and upcoming dues. |
| Students | Search, manage, and browse student profiles. |
| Fees | Generate monthly fees, track fee status, and manage reminders. |
| Payments | Browse recorded payments and receipt information. |
| Notifications | Review message history and test message templates. |
| Reports | View collection, payment method, due, and student reports. |
| Settings | Update institute configuration, notification preferences, templates, and audit logs. |

## Project Structure

```text
src/
├── components/
│   ├── layout/       # Application shell and navigation
│   └── ui/           # Shared interface components and formatting helpers
├── data/             # Demo seed data and default settings/templates
├── pages/            # Route-level application screens
├── store/            # React context, reducer, and localStorage persistence
├── types/            # Shared TypeScript models
├── App.tsx           # Routes and authentication gate
└── main.tsx          # Application entry point
```

## Demo and Production Notes

This repository currently provides a front-end demonstration. It does not connect to a server or database. Data is stored per browser in `localStorage`, so it is not shared between users or devices and may be cleared by browser storage cleanup. The login check is client-side only. WhatsApp/SMS reminders and online payments are simulated; sending real messages or collecting real payments requires secure server-side integrations and credentials.

Do not use the demo credentials or browser storage as a security boundary for real student or payment information.

## License

This project is distributed under the MIT License. See [LICENSE](LICENSE) for details.
