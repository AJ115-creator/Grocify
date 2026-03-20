# Grocify

Grocify is a cross-platform mobile application designed to streamline the grocery shopping experience. Built on modern React Native architecture and utilizing Expo Router, the application offers a performant, stable, and highly responsive user interface.

## Core Features

- **Cross-Platform Compatibility:** Native builds for both Android and iOS powered by the Expo framework.
- **Secure Authentication:** Seamless and secure social authentication flows implemented via Clerk.
- **Global State Management:** Persistent, globally accessible user and grocery list state utilizing Zustand.
- **Intelligent Notifications:** Scheduled local background push notifications driven by Expo, featuring custom soft-prompt permission strategies to maximize user opt-in rates.
- **Serverless Integration:** Full-stack data management connecting directly to a Neon Serverless Postgres database via Drizzle ORM.
- **Modern User Interface:** Fully responsive design system implemented using NativeWind (Tailwind CSS) with strict adherence to global custom themes.
- **Observability and Crash Reporting:** Real-time error monitoring and direct user feedback collection integrated natively through Sentry.

## Tech Stack Overview

- **Frontend Framework:** React Native, Expo, Expo Router
- **State Management:** Zustand
- **Styling:** NativeWind (Tailwind CSS)
- **Authentication:** Clerk Expo
- **Database Architecture:** Neon Postgres, Drizzle ORM
- **Infrastructure & Monitoring:** Expo Notifications, Sentry

## Getting Started

### Prerequisites

Ensure the following dependencies are installed prior to running the application:
- Node.js (v18 or higher)
- npm package manager
- Expo CLI
- Android Studio (for Android native compilation)

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone <repository-url>
   cd Grocify
   ```

2. Install the necessary Node dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory and populate it with the required keys:
   - Clerk Publishable Key
   - Neon Database URL
   - Sentry DSN & Auth Token

### Running the Application

To start the local development server with the Metro bundler:
```bash
npx expo start
```

To compile and execute the application directly on an Android emulator or connected device:
```bash
npx expo run:android
```

## Production Building

To generate a standalone Release APK for Android locally:
```bash
npx expo run:android --variant release
```

Alternatively, utilize Expo Application Services (EAS) for seamless cloud compilation:
```bash
eas build -p android --profile preview
```
