# My Hisab (আমার হিসাব) - Personal Finance Manager

A modern, responsive personal finance and expense management web & mobile application built for Bangladeshi Taka (৳ BDT). Designed with a clean Blue & White theme, full offline capability (PWA), and native Android APK support via Capacitor.

![My Hisab Banner](public/pwa-512x512.png)

## 🌟 Key Features

- **Real-time Financial Dashboard**:
  - Automatically calculates `Remaining Balance = Total Income - Total Expenses - Savings Deposits`.
  - KPI Cards for Monthly Salary (৳20,000 default), Total Expenses, Income, Remaining Balance, Monthly Savings, Family Support, House Rent, and Food Expenses.
  - Interactive Daily, Weekly, and Monthly expense charts.
- **Monthly Budget Planner**:
  - Default Budget: Monthly Salary ৳20,000, House Rent ৳2,000, Daily Food Budget ৳250 (৳7,500/mo), Family Support ৳5,000, Savings Target ৳3,000, Other Expenses ৳2,500.
  - Dynamic budget limit progress bars with visual warning thresholds.
- **Daily Expense Tracker**:
  - Date, Category, Amount, Shop/Location Name, Description, and Payment Method (Cash, bKash, Nagad, Bank, Card).
  - Searchable list with category filters, date filters, edit, and deletion confirmation.
- **Income Tracker**:
  - Categorized records for Salary, Extra Income, Bonus, and Other Income.
- **Family Support Tracker**:
  - Monthly allowance progress, remaining target, and history.
- **Debts & Accounts (দেনা-পাওনা)**:
  - Separate management for **Money I Owe** and **Money People Owe Me**.
  - Partial payments support, remaining balance calculation, and history logs.
- **Savings Tracker**:
  - Monthly targets, deposit/withdraw operations, and annual savings projection.
- **Reports & Export**:
  - Filter by month/year, category breakdowns, and export to **Excel (CSV)** or formatted **PDF**.
- **Data Persistence & Safety**:
  - Reliable local storage persistence.
  - Full JSON Data Backup & One-Click Restore in Settings.
- **Cross-Platform**:
  - Responsive Web (Desktop & Mobile).
  - Progressive Web App (PWA) with offline support.
  - Native Android project (`/android`) with Capacitor (`com.myhisab.finance`).

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm or bun

### Local Development
```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Run Unit Tests
```bash
npx --yes tsx --test src/utils/finance.test.ts
```

### Production Build
```bash
npm run build
```

---

## 📱 Building Android APK

The project contains a pre-configured native Android Studio project in `/android` with application ID `com.myhisab.finance`.

### Option A: Using Android Studio (Recommended)
1. Open **Android Studio**.
2. Click **Open** and select the `/android` folder.
3. Wait for Gradle sync to complete.
4. Go to **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
5. Find the APK at:
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```

### Option B: Using Command Line (Requires JDK 17+ & Android SDK)
```bash
# 1. Build web production bundle & sync to Android
npm run build
npx cap sync android

# 2. Compile APK
cd android
./gradlew assembleDebug
```

---

## 🌐 Deploying to GitHub & Vercel / Netlify

### Push to GitHub
```bash
# Link your GitHub repository and push
git remote add origin https://github.com/YOUR_USERNAME/my-hisab.git
git push -u origin main
```

### One-Click Deploy on Vercel
1. Import your GitHub repository into [Vercel](https://vercel.com).
2. Framework: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Click **Deploy**!
