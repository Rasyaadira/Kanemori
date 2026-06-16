# 🍃 Kanemori

> A personal finance tracker optimized for local-first stability, ease of use, and robust data portability.

Kanemori (formerly FinanceTracker) is a modern web-based application built to help you manage your personal finances with ease. It runs locally on your machine, ensuring complete privacy and fast performance without relying on external cloud databases for its core functionality.

## ✨ Key Features

- **Local-First Architecture:** Your financial data stays on your machine using a reliable SQLite database, ensuring privacy and offline availability.
- **Interactive Dashboard:** Visualize your income, expenses, and trends with beautiful, responsive charts powered by Recharts.
- **Robust Data Portability:**
  - Export your financial reports into multi-sheet Excel/CSV formats.
  - Sync your transaction history to **Notion** with built-in API integration and rate-limiting handling.
- **Desktop Integration:** Seamlessly start and manage the application via dedicated desktop shortcuts and a control GUI.
- **Auto-Healing & Reliability:** Designed to survive system updates with auto-rebuild capabilities for native modules and a robust WAL-mode SQLite configuration.

## 🛠 Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Database:** SQLite via [`better-sqlite3`](https://github.com/WiseLibs/better-sqlite3)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Visualizations:** [Recharts](https://recharts.org/)
- **Icons:** [Lucide React](https://lucide.dev/)

## 📂 Project Structure

```text
kanemori/
├── src/           # Next.js application source code (App Router)
├── data/          # SQLite database (finance.db) - This is where your data lives!
├── scripts/       # Shell scripts for desktop integration and auto-rebuilding
├── logs/          # Application and server logs
└── guide.md      # Detailed maintenance and reliability guide
```

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd kanemori
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The SQLite database will be automatically initialized in the `data/` folder.

## ⚙️ Desktop Integration & Maintenance

Kanemori includes scripts to run seamlessly from your desktop environment:
- **Kanemori Shortcut:** Starts the local server and opens your web browser.
- **Kanemori Control:** A small GUI to manage the server status.

For detailed instructions on troubleshooting, database backups, and manual rebuilds, please refer to the [Maintenance Guide (GEMINI.md)](./GEMINI.md).

## 🛡 License

This project is private and intended for personal use.
