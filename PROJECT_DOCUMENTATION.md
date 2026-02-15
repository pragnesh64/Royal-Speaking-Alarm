# 📱 MyPA - Royal Speaking Alarm - Complete Project Documentation

> **App Name:** MyPA (My Personal Assistant)  
> **Package:** `com.mypa.app`  
> **Version:** 1.0.0  
> **Platform:** Android (via Capacitor) + Web  
> **Last Updated:** 15 Feb 2026

---

## 📑 TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [Database Schema](#4-database-schema)
5. [API Routes](#5-api-routes)
6. [Authentication System](#6-authentication-system)
7. [Server Architecture](#7-server-architecture)
8. [Client Architecture (React Frontend)](#8-client-architecture)
9. [Native Android Architecture](#9-native-android-architecture)
10. [Alarm System (Full Flow)](#10-alarm-system-full-flow)
11. [Payment Integration](#11-payment-integration)
12. [Push Notifications](#12-push-notifications)
13. [Configuration Files](#13-configuration-files)
14. [Environment Variables](#14-environment-variables)
15. [Build & Deploy](#15-build--deploy)
16. [Performance Optimizations](#16-performance-optimizations)

---

## 1. PROJECT OVERVIEW

**MyPA** is a Speaking Alarm app that allows users to:
- ⏰ **Create alarms** with custom voice messages (TTS - Text to Speech)
- 💊 **Medicine reminders** with dosage info and photo
- 📅 **Meeting reminders** with date, time, location
- 🎙️ **Custom voice recording** for alarm sounds
- 🌐 **Multi-language support** (English, Hindi, Marathi, Spanish)
- 📸 **Image-based alarms** (photo display when alarm rings)
- 🔔 **Native Android alarms** that work even when app is killed
- 💳 **Subscription system** with Stripe + Razorpay
- 📲 **Push Notifications** via Web Push (VAPID)

### App Flow
```
User opens app → Login (Email/Phone/Replit OIDC)
  → Dashboard (Home) → Create Alarms/Medicines/Meetings
  → Server schedules push notifications
  → Native Android: AlarmManager schedules exact alarms
  → Alarm rings → Full-screen UI shows → User Dismiss/Snooze
```

---

## 2. TECH STACK

### Frontend (Client)
| Technology | Version | Purpose |
|---|---|---|
| React | 18.3.1 | UI Framework |
| TypeScript | 5.6.3 | Type Safety |
| Vite | 7.3.0 | Build Tool & Dev Server |
| TailwindCSS | 3.4.17 | Styling |
| Radix UI | Various | UI Components (Dialog, Select, Tabs, etc.) |
| TanStack React Query | 5.60.5 | Server State Management |
| Wouter | 3.3.5 | Client-side Routing |
| Framer Motion | 11.18.2 | Animations |
| date-fns | 3.6.0 | Date utilities |
| Zod | 3.24.2 | Schema Validation |
| Lucide React | 0.453.0 | Icons |
| React Hook Form | 7.55.0 | Form handling |

### Backend (Server)
| Technology | Version | Purpose |
|---|---|---|
| Express | 5.0.1 | HTTP Server |
| Drizzle ORM | 0.39.3 | Database ORM |
| PostgreSQL | (via pg 8.16.3) | Database |
| Passport.js | 0.7.0 | Authentication |
| bcryptjs | 3.0.3 | Password hashing |
| web-push | 3.6.7 | Push Notifications |
| Stripe | 20.0.0 | Payment (International) |
| Razorpay | 2.9.6 | Payment (India) |
| Multer | 2.0.2 | File Upload |
| express-session | 1.19.0 | Session Management |
| memorystore | 1.6.7 | Dev Session Store |
| connect-pg-simple | 10.0.0 | Production Session Store |

### Native (Android)
| Technology | Purpose |
|---|---|
| Capacitor | 8.0.2 | Web-to-Native Bridge |
| Java (Android SDK) | Native Android Code |
| AlarmManager | Exact alarm scheduling |
| Foreground Service | Alarm ringing (sound + vibration) |
| WakeLock | Screen wake on alarm |
| MediaPlayer | Alarm sound playback |
| NotificationCompat | High-priority notifications |

### Capacitor Plugins
| Plugin | Version | Purpose |
|---|---|---|
| @capacitor/core | 8.0.2 | Core framework |
| @capacitor/android | 8.0.2 | Android platform |
| @capacitor/local-notifications | 8.0.0 | Local notifications |
| @capacitor/push-notifications | 8.0.0 | Push notifications |
| @capacitor/splash-screen | 8.0.0 | Splash screen |
| @capacitor/status-bar | 8.0.0 | Status bar control |
| @capacitor-community/text-to-speech | 8.0.0 | TTS engine |

---

## 3. FOLDER STRUCTURE

```
Royal-Speaking-Alarm 2/
├── 📁 android/                          # Native Android project
│   ├── 📁 app/
│   │   ├── build.gradle                 # App-level Gradle config
│   │   └── 📁 src/main/
│   │       ├── AndroidManifest.xml      # App manifest (permissions, activities, services)
│   │       ├── 📁 java/com/mypa/app/
│   │       │   ├── MainActivity.java           # App entry point (Capacitor Bridge)
│   │       │   ├── AlarmActivity.java          # Full-screen alarm UI (native XML layout)
│   │       │   ├── AlarmReceiver.java          # BroadcastReceiver (survives process death)
│   │       │   ├── AlarmRingingService.java    # Foreground service (sound + vibration)
│   │       │   ├── AlarmSchedulerHelper.java   # Centralized AlarmManager scheduling
│   │       │   ├── AlarmPermissionHelper.java  # Permission checks (EXACT_ALARM, Battery)
│   │       │   ├── FullScreenAlarmPlugin.java  # Capacitor→Java bridge plugin
│   │       │   └── AlarmPermissionsPlugin.java # Permissions bridge plugin
│   │       └── 📁 res/
│   │           ├── 📁 layout/
│   │           │   └── activity_alarm.xml      # Native alarm screen layout
│   │           └── 📁 xml/
│   │               └── network_security_config.xml  # HTTP cleartext config
│   ├── build.gradle                     # Project-level Gradle config
│   ├── settings.gradle                  # Gradle settings
│   ├── variables.gradle                 # SDK versions
│   └── 📁 capacitor-*/                  # Capacitor plugin native code
│
├── 📁 client/                           # React Frontend
│   ├── index.html                       # Entry HTML
│   ├── 📁 public/
│   │   ├── favicon.png
│   │   ├── manifest.json                # PWA manifest
│   │   ├── sw.js                        # Service Worker (push notifications)
│   │   └── 📁 icons/                    # PWA icons (192x192, 512x512)
│   └── 📁 src/
│       ├── main.tsx                     # React entry point
│       ├── App.tsx                      # Root component with routing
│       ├── index.css                    # Global styles (Tailwind)
│       ├── 📁 pages/
│       │   ├── home.tsx                 # Dashboard (main menu)
│       │   ├── routine.tsx              # Alarm management page
│       │   ├── medicines.tsx            # Medicine reminders page
│       │   ├── meetings.tsx             # Meeting reminders page
│       │   ├── settings.tsx             # User settings page
│       │   ├── login.tsx                # Login/Register page
│       │   └── not-found.tsx            # 404 page
│       ├── 📁 components/
│       │   ├── global-alarm-handler.tsx # Web alarm ringing logic (portal-based)
│       │   ├── alarm-modal.tsx          # Create/Edit alarm modal
│       │   ├── medicine-modal.tsx       # Create/Edit medicine modal
│       │   ├── voice-recorder.tsx       # Audio recording component
│       │   ├── layout.tsx               # App layout with navigation
│       │   ├── push-notification-prompt.tsx  # Push notification opt-in
│       │   ├── AlarmPermissionBanner.tsx     # Native permission banner
│       │   ├── trial-popup.tsx          # Trial expiry popup
│       │   ├── expired-banner.tsx       # Subscription expired banner
│       │   ├── ad-popup.tsx             # Advertisement popup
│       │   └── 📁 ui/                   # Shadcn/Radix UI components (47 files)
│       │       ├── dialog.tsx, button.tsx, card.tsx, input.tsx, etc.
│       ├── 📁 hooks/
│       │   ├── use-alarms.ts            # Alarm CRUD (React Query)
│       │   ├── use-medicines.ts         # Medicine CRUD
│       │   ├── use-auth.ts              # Auth state management
│       │   ├── use-translations.ts      # i18n hook
│       │   ├── use-trial-status.ts      # Trial/subscription check
│       │   ├── use-upload.ts            # File upload hook
│       │   ├── use-mobile.tsx           # Mobile detection
│       │   ├── useNativeSync.ts         # Sync alarms to native Android
│       │   ├── usePushNotifications.ts  # Web push setup
│       │   └── useAlarmPermissions.tsx  # Native permission checks
│       ├── 📁 lib/
│       │   ├── capacitor.ts             # Capacitor initialization
│       │   ├── nativeNotifications.ts   # Native alarm scheduling via FullScreenAlarm plugin
│       │   ├── translations.ts          # Translation strings (EN/HI/MR/ES - 2661 lines)
│       │   ├── queryClient.ts           # React Query client config
│       │   ├── auth-utils.ts            # Auth helper functions
│       │   └── utils.ts                 # General utilities (cn, etc.)
│       └── 📁 plugins/
│           ├── FullScreenAlarm.ts       # TS interface for native plugin
│           ├── FullScreenAlarmWeb.ts     # Web fallback for FullScreenAlarm
│           ├── alarmPermissions.ts      # TS interface for permissions plugin
│           ├── CleanupOldAlarms.ts      # Old alarm cleanup
│           └── TestAlarm.ts             # Test alarm utility
│
├── 📁 server/                           # Express Backend
│   ├── index.ts                         # Server entry point (Express + HTTP server)
│   ├── routes.ts                        # All API routes (782 lines)
│   ├── db.ts                            # PostgreSQL connection pool (Drizzle)
│   ├── storage.ts                       # Database CRUD operations
│   ├── alarmScheduler.ts                # Server-side alarm checker (30s interval)
│   ├── alarmToggleLogic.ts              # Smart alarm on/off logic
│   ├── pushNotification.ts              # Web Push (VAPID) notification sender
│   ├── stripeClient.ts                  # Stripe SDK initialization
│   ├── webhookHandlers.ts               # Stripe webhook processing
│   ├── seed.ts                          # Database seeding
│   ├── seed-stripe-products.ts          # Stripe product seeding
│   ├── static.ts                        # Production static file serving
│   ├── vite.ts                          # Vite dev server middleware
│   └── 📁 replit_integrations/auth/
│       ├── index.ts                     # Auth exports
│       ├── replitAuth.ts               # Session + Passport + OIDC setup
│       ├── routes.ts                    # /api/auth/user route (with cache)
│       └── storage.ts                   # Auth-specific DB operations
│
├── 📁 shared/                           # Shared between client & server
│   ├── schema.ts                        # Drizzle ORM schema (all tables)
│   ├── routes.ts                        # API route contracts (Zod validated)
│   └── 📁 models/
│       └── auth.ts                      # Auth-related types
│
├── 📁 dist/                             # Production build output
│   ├── index.cjs                        # Compiled server
│   └── 📁 public/                       # Compiled client assets
│
├── capacitor.config.ts                  # Capacitor configuration
├── package.json                         # Dependencies & scripts
├── tsconfig.json                        # TypeScript configuration
├── vite.config.ts                       # Vite configuration
├── drizzle.config.ts                    # Drizzle Kit config (migrations)
├── tailwind.config.ts                   # Tailwind CSS config
├── postcss.config.js                    # PostCSS config
├── components.json                      # Shadcn UI config
└── 📁 script/
    └── build.ts                         # Custom build script
```

---

## 4. DATABASE SCHEMA

Database: **PostgreSQL** (Neon/Cloud compatible)  
ORM: **Drizzle ORM**

### Tables

#### `users`
| Column | Type | Description |
|---|---|---|
| id | VARCHAR (PK) | UUID (auto-generated) |
| email | VARCHAR (UNIQUE) | User email |
| phone | VARCHAR | Phone number |
| passwordHash | VARCHAR | bcrypt hashed password |
| authProvider | VARCHAR | `email`, `google`, `phone` |
| firstName | VARCHAR | First name |
| lastName | VARCHAR | Last name |
| profileImageUrl | VARCHAR | Profile photo URL |
| subscriptionStatus | TEXT | `trial`, `active`, `expired` |
| trialEndsAt | TIMESTAMP | Trial expiry date |
| language | TEXT | Preferred language (default: `english`) |
| stripeCustomerId | VARCHAR | Stripe customer ID |
| stripeSubscriptionId | VARCHAR | Stripe subscription ID |
| createdAt | TIMESTAMP | Account creation |
| updatedAt | TIMESTAMP | Last update |

#### `alarms`
| Column | Type | Description |
|---|---|---|
| id | SERIAL (PK) | Auto-increment ID |
| userId | VARCHAR | FK to users.id |
| title | TEXT | Alarm name |
| time | TEXT | HH:mm format (24-hour) |
| date | TEXT | YYYY-MM-DD (for one-time alarms) |
| days | TEXT[] | Array of days: `["Mon", "Tue", ...]` |
| isActive | BOOLEAN | Is alarm enabled |
| type | TEXT | `speaking`, `custom_voice`, `text` |
| voiceUrl | TEXT | Recorded voice URL |
| imageUrl | TEXT | Alarm photo URL |
| textToSpeak | TEXT | TTS message |
| voiceGender | TEXT | `male` or `female` |
| language | TEXT | `english`, `hindi`, `marathi`, `spanish` |
| duration | INTEGER | Play duration (seconds) |
| loop | BOOLEAN | Loop audio/TTS |

#### `medicines`
| Column | Type | Description |
|---|---|---|
| id | SERIAL (PK) | Auto-increment ID |
| userId | VARCHAR | FK to users.id |
| name | TEXT | Medicine name |
| photoUrl | TEXT | Medicine photo |
| timeOfDay | TEXT | Morning/Afternoon/Night |
| times | TEXT[] | Array of times: `["08:00", "14:00"]` |
| dosage | TEXT | Dosage info |
| isActive | BOOLEAN | Enabled |
| type | TEXT | `speaking`, `custom_voice` |
| voiceUrl | TEXT | Custom voice |
| textToSpeak | TEXT | TTS message |
| voiceGender | TEXT | `male`/`female` |
| language | TEXT | Language |
| duration | INTEGER | Duration |
| loop | BOOLEAN | Loop |

#### `meetings`
| Column | Type | Description |
|---|---|---|
| id | SERIAL (PK) | Auto-increment ID |
| userId | VARCHAR | FK to users.id |
| title | TEXT | Meeting title |
| date | TEXT | YYYY-MM-DD |
| time | TEXT | HH:mm |
| location | TEXT | Meeting location |
| description | TEXT | Description |
| participants | TEXT | Participants |
| textToSpeak | TEXT | TTS message |
| enabled | BOOLEAN | Enabled |

#### `sessions`
| Column | Type | Description |
|---|---|---|
| sid | VARCHAR (PK) | Session ID |
| sess | JSONB | Session data |
| expire | TIMESTAMP | Expiry time |

#### `push_subscriptions`
| Column | Type | Description |
|---|---|---|
| id | SERIAL (PK) | Auto-increment ID |
| userId | VARCHAR | FK to users.id |
| endpoint | TEXT | Push endpoint URL |
| p256dh | TEXT | Public key |
| auth | TEXT | Auth secret |
| createdAt | TIMESTAMP | Created |

#### `otp_codes`
| Column | Type | Description |
|---|---|---|
| id | SERIAL (PK) | Auto-increment ID |
| phone | VARCHAR | Phone number |
| code | VARCHAR | OTP code |
| expiresAt | TIMESTAMP | Expiry |
| used | BOOLEAN | Is used |
| createdAt | TIMESTAMP | Created |

---

## 5. API ROUTES

### Authentication
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Email registration (bcrypt hash) |
| POST | `/api/auth/login` | Email/password login |
| POST | `/api/auth/phone/send-otp` | Send OTP to phone |
| POST | `/api/auth/phone/verify-otp` | Verify OTP & login |
| GET | `/api/auth/user` | Get current user (cached 60s) |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/login` | Replit OIDC login |
| GET | `/api/callback` | OIDC callback |

### Alarms CRUD
| Method | Path | Description |
|---|---|---|
| GET | `/api/alarms` | List user's alarms |
| POST | `/api/alarms` | Create alarm |
| PUT | `/api/alarms/:id` | Update alarm |
| DELETE | `/api/alarms/:id` | Delete alarm |

### Medicines CRUD
| Method | Path | Description |
|---|---|---|
| GET | `/api/medicines` | List medicines |
| POST | `/api/medicines` | Create medicine |
| PUT | `/api/medicines/:id` | Update medicine |
| DELETE | `/api/medicines/:id` | Delete medicine |

### Meetings CRUD
| Method | Path | Description |
|---|---|---|
| GET | `/api/meetings` | List meetings |
| POST | `/api/meetings` | Create meeting |
| PATCH | `/api/meetings/:id` | Update meeting |
| DELETE | `/api/meetings/:id` | Delete meeting |

### File Upload
| Method | Path | Description |
|---|---|---|
| POST | `/api/upload` | Upload file (Multer) → returns `{ url }` |

### Push Notifications
| Method | Path | Description |
|---|---|---|
| GET | `/api/push/vapid-key` | Get VAPID public key |
| POST | `/api/push/subscribe` | Subscribe to push |
| POST | `/api/push/unsubscribe` | Unsubscribe from push |

### Payments
| Method | Path | Description |
|---|---|---|
| POST | `/api/stripe/webhook` | Stripe webhook |
| POST | `/api/razorpay/create-order` | Create Razorpay order |
| POST | `/api/razorpay/verify` | Verify Razorpay payment |
| GET | `/api/stripe/publishable-key` | Get Stripe publishable key |

### User Settings
| Method | Path | Description |
|---|---|---|
| PUT | `/api/user/language` | Update language preference |
| PUT | `/api/user/settings` | Update user settings |

---

## 6. AUTHENTICATION SYSTEM

### Three Auth Methods:
1. **Email/Password** (Primary)
   - Registration: `POST /api/auth/register` → bcrypt hash → create user → auto-login
   - Login: `POST /api/auth/login` → bcrypt compare → passport session
   
2. **Phone/OTP** (India)
   - Send OTP: `POST /api/auth/phone/send-otp`
   - Verify: `POST /api/auth/phone/verify-otp` → create/find user → auto-login

3. **Replit OIDC** (When running on Replit)
   - Uses OpenID Connect with Replit as identity provider
   - Auto-creates user from OIDC claims

### Session Management
- **Development:** In-memory store (`memorystore`) — fast, no DB hit
- **Production:** PostgreSQL store (`connect-pg-simple`)
- Session TTL: 7 days
- Cookie: httpOnly, secure (production only)

### User Cache
- In-memory cache for `/api/auth/user` endpoint
- TTL: 60 seconds
- Avoids ~200-400ms DB query on every page load
- `invalidateUserCache()` called on user settings update

---

## 7. SERVER ARCHITECTURE

### File: `server/index.ts` (Entry Point)
```
1. Import dependencies
2. Create Express app + HTTP server
3. Initialize Stripe (background, non-blocking)
4. Register Stripe webhook route (BEFORE json parser)
5. Enable ETag caching
6. Setup JSON/URL-encoded body parsers (10mb limit)
7. Request logging middleware (with slow API warning >500ms)
8. Register all API routes (routes.ts)
9. Error handler middleware
10. Setup Vite (dev) or static serving (prod)
11. Listen on PORT (default 5000, host 0.0.0.0)
```

### File: `server/routes.ts` (API Routes - 782 lines)
- All CRUD operations for alarms, medicines, meetings
- Auth routes (register, login, OTP)
- Payment routes (Stripe, Razorpay)
- Push notification routes
- File upload (Multer)
- Starts Alarm Scheduler on boot

### File: `server/db.ts` (Database Connection)
- PostgreSQL connection pool (max: 10, min: 2)
- Auto-detects Neon DB for SSL
- Pool error handling (non-fatal)
- Connection pre-warming on startup
- Keep-alive enabled for remote DBs

### File: `server/storage.ts` (Data Access Layer)
- `DatabaseStorage` class implementing `IStorage` interface
- All CRUD methods for: Users, Alarms, Medicines, Meetings, OTP
- Clean separation from route handlers

### File: `server/alarmScheduler.ts` (Server-Side Scheduler)
- Runs every **30 seconds**
- Checks current IST time against all active alarms/medicines/meetings
- Sends push notifications via `web-push` for matching alarms
- All 3 DB queries run **in parallel** (`Promise.all`)
- All push notifications sent **in parallel** (`Promise.allSettled`)
- Deduplication: skips same minute twice

### File: `server/alarmToggleLogic.ts` (Smart Toggle)
- `hasFutureOccurrence()` — checks if alarm has future triggers
- `setAlarmActiveStatus()` — auto-calculates isActive
- `handleAlarmToggle()` — respects manual toggle vs auto-calculate
- Handles: date alarms, recurring day alarms, one-time alarms

---

## 8. CLIENT ARCHITECTURE

### Routing (Wouter)
| Path | Component | Description |
|---|---|---|
| `/` | Home | Dashboard with feature cards |
| `/routine` | Routine | Alarm list + create/edit |
| `/medicines` | Medicines | Medicine reminder management |
| `/meetings` | Meetings | Meeting reminder management |
| `/settings` | Settings | Language, subscription, profile |

### State Management
- **Server State:** TanStack React Query
  - Auto-refetch, cache invalidation
  - Optimistic updates on mutations
- **Auth State:** Custom `useAuth()` hook
- **No global client state library** (no Redux/Zustand)

### Key Components

#### `GlobalAlarmHandler` (833 lines)
- The heart of web-based alarm ringing
- Uses `createPortal` to render full-screen overlay on `document.body`
- Checks alarms every second against current time
- Handles:
  - Playing alarm sound via `HTMLAudioElement` or TTS (`@capacitor-community/text-to-speech`)
  - Vibration via `navigator.vibrate()`
  - Dismiss/Snooze logic
  - Date-based vs recurring alarms
  - `isDateAlarm` tracking for auto-deactivation
- Prevents duplicate triggers with `activeAlarms`, `activeMeds`, `activeMeetings` Sets
- Dismissed alarms tracked with timestamp to prevent re-trigger within same minute

#### `AlarmModal` — Create/edit alarm form with:
- Time picker, day selector, date picker
- Alarm type selection (speaking, custom voice, text)
- Voice recorder integration
- Image upload
- Language selection
- Preview TTS

### Hooks
| Hook | Purpose |
|---|---|
| `useAlarms()` | Fetch all alarms (React Query) |
| `useCreateAlarm()` | Create alarm mutation |
| `useUpdateAlarm()` | Update alarm mutation |
| `useDeleteAlarm()` | Delete alarm mutation |
| `useMedicines()` | Fetch medicines |
| `useMeetings()` | Fetch meetings |
| `useAuth()` | Auth state (user, isLoading, login, logout) |
| `useNativeSync()` | Sync alarm data to native Android |
| `usePushNotifications()` | Register web push |
| `useAlarmPermissions()` | Check native alarm permissions |
| `useTranslations()` | Get translated strings |
| `useTrialStatus()` | Check trial/subscription status |

### Capacitor Plugins (TypeScript Interface)

#### `FullScreenAlarm` Plugin
```typescript
schedule(options: {
  id: number;
  title: string;
  body: string;
  triggerAtMillis: number;  // Unix timestamp in ms
  type?: string;            // 'alarm' | 'medicine' | 'meeting'
}) → { success: boolean, alarmId: number }

scheduleRepeating(options: {
  id: number;
  title: string;
  body: string;
  hour: number;    // 0-23
  minute: number;  // 0-59
  type?: string;
}) → { success: boolean, alarmId: number }

cancel(options: { id: number }) → { success: boolean }
```

#### `AlarmPermissions` Plugin
```typescript
checkPermissions() → { hasPermissions, canScheduleExactAlarms, batteryOptimizationDisabled }
requestPermissions() → { success: boolean }
getPermissionExplanation() → { message: string }
```

---

## 9. NATIVE ANDROID ARCHITECTURE

### AndroidManifest.xml — Key Components

#### Activities
| Component | Purpose |
|---|---|
| `MainActivity` | Main app (Capacitor WebView) |
| `AlarmActivity` | Full-screen alarm UI (native XML) |

#### Services
| Component | Purpose |
|---|---|
| `AlarmRingingService` | Foreground service: sound + vibration + notification |

#### Receivers
| Component | Purpose |
|---|---|
| `AlarmReceiver` | BroadcastReceiver — triggered by AlarmManager |

### Permissions Required
```xml
INTERNET, ACCESS_NETWORK_STATE          — Network
POST_NOTIFICATIONS                       — Notifications (Android 13+)
SCHEDULE_EXACT_ALARM, USE_EXACT_ALARM   — Exact alarms (Android 12+)
VIBRATE                                  — Vibration
WAKE_LOCK                               — Keep CPU awake
RECEIVE_BOOT_COMPLETED                  — Reschedule after reboot
FOREGROUND_SERVICE                       — Foreground service
FOREGROUND_SERVICE_SYSTEM_EXEMPTED      — System-exempted service
REQUEST_IGNORE_BATTERY_OPTIMIZATIONS    — Battery exemption
USE_FULL_SCREEN_INTENT                  — Full-screen notification
```

### Java Classes Detail

#### `MainActivity.java`
- Extends `BridgeActivity` (Capacitor)
- Registers custom plugins: `FullScreenAlarmPlugin`, `AlarmPermissionsPlugin`
- Requests alarm permissions on first launch

#### `AlarmReceiver.java` (BroadcastReceiver)
- **Survives process death** — registered in AndroidManifest
- Receives alarm triggers from `AlarmManager`
- Starts `AlarmRingingService` as foreground service
- Has emergency fallback if service start fails

#### `AlarmRingingService.java` (Foreground Service)
- **Main alarm component** — handles everything:
  - Creates high-priority notification channel (`IMPORTANCE_HIGH`, bypasses DND)
  - Builds notification with full-screen intent → opens `AlarmActivity`
  - Plays alarm sound via `MediaPlayer` (USAGE_ALARM, looping, max volume)
  - Vibrates with pattern: `[0, 500, 500, 500, 500, 500, 500]`
  - Acquires `SCREEN_BRIGHT_WAKE_LOCK` + `ACQUIRE_CAUSES_WAKEUP`
  - Handles DISMISS action → stops everything
  - Handles SNOOZE action → schedules +5 min via `AlarmSchedulerHelper`

#### `AlarmActivity.java` (Full-Screen UI)
- Native XML layout (`activity_alarm.xml`)
- Shows over lock screen (`setShowWhenLocked`, `setTurnScreenOn`)
- Displays: current time, date, alarm title, message, type badge
- Two buttons: DISMISS and SNOOZE
- Back button disabled (must use buttons)
- Communicates with `AlarmRingingService` via Intent actions
- Dark theme: `#0D1B3E` background

#### `AlarmSchedulerHelper.java` (Central Scheduling)
- **Uses `setAlarmClock()`** for maximum reliability
  - Bypasses ALL power restrictions (Doze, Battery Saver, App Standby)
  - Works even when app is force-stopped
  - Works on ALL OEMs (Xiaomi, Huawei, Samsung, etc.)
- `scheduleExactAlarm()` — one-time alarm
- `cancelAlarm()` — cancel scheduled alarm
- `scheduleSnoozeAlarm()` — snooze (+5 min, ID offset +10000)
- `cancelSnoozeAlarm()` — cancel snooze

#### `AlarmPermissionHelper.java`
- `canScheduleExactAlarms()` — checks Android 12+ permission
- `isBatteryOptimizationDisabled()` — checks battery exemption
- `requestExactAlarmPermission()` — opens system settings
- `requestBatteryOptimizationExemption()` — opens battery settings
- `ensureAllAlarmPermissions()` — requests all needed permissions

#### `AlarmPermissionsPlugin.java` (Capacitor Bridge)
- Exposes permission checks to JavaScript
- Methods: `checkPermissions()`, `requestPermissions()`, `getPermissionExplanation()`

#### `FullScreenAlarmPlugin.java` (Capacitor Bridge)
- JavaScript → Native alarm scheduling
- Methods: `schedule()`, `scheduleRepeating()`, `cancel()`
- Validates parameters and calls `AlarmSchedulerHelper`

### Native Alarm Layout (`activity_alarm.xml`)
```
┌─────────────────────────────┐
│     (dark blue: #0D1B3E)    │
│                             │
│        ⏰  ALARM            │
│                             │
│       08:33 AM              │  ← 64sp, white, bold
│   Sunday, 15 Feb 2026      │  ← 15sp, muted blue
│                             │
│       ────────              │  ← divider line
│                             │
│     Morning Alarm           │  ← 24sp, cyan (#00C8FF)
│     Time to wake up!        │  ← 16sp, muted text
│     🔔 Sound Alarm          │  ← type badge
│                             │
│  Snooze will ring again...  │
│  ┌─────────────────────┐   │
│  │  ✓  DISMISS ALARM   │   │  ← blue button
│  └─────────────────────┘   │
│  ┌─────────────────────┐   │
│  │  😴 SNOOZE 5 MINUTES│   │  ← dark outline button
│  └─────────────────────┘   │
└─────────────────────────────┘
```

---

## 10. ALARM SYSTEM (FULL FLOW)

### How an Alarm is Created → Rings → Dismissed

```
USER CREATES ALARM (Frontend)
  │
  ├─ 1. User fills form in AlarmModal component
  ├─ 2. POST /api/alarms → Server creates in PostgreSQL
  ├─ 3. React Query invalidates alarm list
  ├─ 4. useNativeSync() detects new alarm
  └─ 5. syncAlarmsToNative() calls FullScreenAlarm.schedule()
        │
        ╔══════════════════════════════════════════╗
        ║  NATIVE ANDROID (via Capacitor Bridge)   ║
        ╠══════════════════════════════════════════╣
        ║                                          ║
        ║  6. FullScreenAlarmPlugin.schedule()      ║
        ║     → AlarmSchedulerHelper               ║
        ║     → AlarmManager.setAlarmClock()        ║
        ║                                          ║
        ║  [TIME PASSES... DEVICE MAY BE SLEEPING] ║
        ║                                          ║
        ║  7. AlarmManager triggers at exact time   ║
        ║     → AlarmReceiver.onReceive()           ║
        ║     (Survives app kill!)                  ║
        ║                                          ║
        ║  8. AlarmReceiver starts                  ║
        ║     → AlarmRingingService (foreground)    ║
        ║                                          ║
        ║  9. AlarmRingingService:                  ║
        ║     → Posts HIGH priority notification    ║
        ║     → Plays alarm sound (MediaPlayer)     ║
        ║     → Starts vibration pattern            ║
        ║     → Wakes screen (WakeLock)             ║
        ║     → Shows full-screen intent            ║
        ║        → AlarmActivity opens              ║
        ║                                          ║
        ║  10. User taps DISMISS:                   ║
        ║      → AlarmActivity sends ACTION_DISMISS ║
        ║      → AlarmRingingService stops sound     ║
        ║      → Service stops itself                ║
        ║                                          ║
        ║  10b. User taps SNOOZE:                   ║
        ║       → AlarmSchedulerHelper              ║
        ║         .scheduleSnoozeAlarm()             ║
        ║       → +5 minutes new alarm              ║
        ║       → Service stops itself               ║
        ╚══════════════════════════════════════════╝

SERVER-SIDE (Parallel Path):
  │
  ├─ 11. alarmScheduler checks every 30 seconds
  ├─ 12. If alarm time matches current IST time
  └─ 13. Sends Web Push notification to all user's devices
         → Service Worker receives push
         → Shows browser/PWA notification

WEB ALARM (if app is open in browser):
  │
  ├─ 14. GlobalAlarmHandler checks every 1 second
  ├─ 15. If alarm time matches → triggers alarm popup
  ├─ 16. Plays sound + TTS + vibration
  └─ 17. User dismisses/snoozes via web UI
```

### Alarm Types
| Type | Behavior |
|---|---|
| `speaking` | TTS reads `textToSpeak` in selected language |
| `custom_voice` | Plays recorded audio from `voiceUrl` |
| `text` | Shows text message + plays default sound |

### Alarm Scheduling Logic
| Alarm Config | Behavior |
|---|---|
| `time` only | One-time alarm for next occurrence of that time |
| `time` + `days` | Recurring on specific days (Mon, Tue, etc.) |
| `time` + `date` | One-time on specific date |
| `date` alarm after trigger | Auto-deactivated (`isActive = false`) |
| `days` alarm after trigger | Stays active (has future days) |

---

## 11. PAYMENT INTEGRATION

### Stripe (International)
- **Server:** `stripeClient.ts` → Stripe SDK initialization
- **Webhooks:** `webhookHandlers.ts` → processes subscription events
  - `customer.subscription.created/updated` → activate
  - `customer.subscription.deleted` → deactivate
  - `checkout.session.completed` → handle checkout
- **Schema sync:** `stripe-replit-sync` package
- **Route:** `POST /api/stripe/webhook` (raw body, before JSON parser)

### Razorpay (India)
- **Create order:** `POST /api/razorpay/create-order`
- **Verify payment:** `POST /api/razorpay/verify` (HMAC SHA256 signature)
- On successful verification → updates user `subscriptionStatus` to `active`

### Trial System
- New users get **30 days free trial**
- `trialEndsAt` timestamp set on registration
- `useTrialStatus()` hook checks expiry on client
- Expired trial shows `trial-popup.tsx` and `expired-banner.tsx`

---

## 12. PUSH NOTIFICATIONS

### Web Push (VAPID)
- **Server:** `pushNotification.ts`
  - Auto-generates VAPID keys if not set in env
  - `sendPushNotification()` → sends to all user's subscriptions
  - Auto-removes invalid subscriptions (410/404)
- **Client:** `usePushNotifications.ts`
  - Registers service worker (`sw.js`)
  - Gets VAPID public key from server
  - Subscribes with `PushManager.subscribe()`
  - Saves subscription to server
- **Service Worker:** `client/public/sw.js`
  - Listens for `push` events
  - Shows notification with alarm data
  - Handles notification click → opens app

### Push Payload Format
```json
{
  "title": "Morning Alarm",
  "body": "Time to wake up!",
  "type": "alarm",
  "id": 123,
  "textToSpeak": "Good morning, time to wake up!",
  "alarmType": "speaking",
  "voiceUrl": null,
  "imageUrl": null,
  "language": "english",
  "days": ["Mon", "Tue", "Wed"],
  "duration": 30,
  "loop": true,
  "voiceGender": "female"
}
```

---

## 13. CONFIGURATION FILES

### `capacitor.config.ts`
```typescript
{
  appId: 'com.mypa.app',
  appName: 'MyPA',
  webDir: 'dist/public',
  server: {
    url: 'http://10.195.157.10:8080',  // Dev server URL
    androidScheme: 'http',
    cleartext: true
  },
  plugins: {
    LocalNotifications: { smallIcon: "ic_stat_icon", iconColor: "#002E6E" },
    PushNotifications: { presentationOptions: ["badge", "sound", "alert"] },
    SplashScreen: { launchShowDuration: 2000, backgroundColor: "#002E6E" },
    StatusBar: { backgroundColor: "#002E6E" }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false
  }
}
```

### `network_security_config.xml`
- Allows cleartext HTTP for: `localhost`, `127.0.0.1`, `10.195.157.10`, `10.0.2.2`, `10.0.3.2`
- Trusts system + user certificates

### `tsconfig.json`
- Path aliases: `@/` → `client/src/`, `@shared/` → `shared/`
- Module: ESNext, JSX: preserve
- Strict mode enabled

### `vite.config.ts`
- React plugin
- Path aliases: `@`, `@shared`, `@assets`
- Root: `client/`
- Build output: `dist/public/`

---

## 14. ENVIRONMENT VARIABLES

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `SESSION_SECRET` | ✅ | Express session secret |
| `PORT` | ❌ | Server port (default: 5000) |
| `NODE_ENV` | ❌ | `development` or `production` |
| `VAPID_PUBLIC_KEY` | ❌ | Web Push public key (auto-generated) |
| `VAPID_PRIVATE_KEY` | ❌ | Web Push private key (auto-generated) |
| `STRIPE_SECRET_KEY` | ❌ | Stripe API secret key |
| `STRIPE_PUBLISHABLE_KEY` | ❌ | Stripe publishable key |
| `RAZORPAY_KEY_ID` | ❌ | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | ❌ | Razorpay secret |
| `REPL_ID` | ❌ | Replit deployment ID |
| `ISSUER_URL` | ❌ | OIDC issuer (Replit) |
| `APP_DOMAIN` | ❌ | App domain for webhooks |

---

## 15. BUILD & DEPLOY

### NPM Scripts
```bash
npm run dev          # Development (tsx + Vite HMR)
npm run build        # Production build (client + server)
npm run start        # Start production server
npm run check        # TypeScript type check
npm run db:push      # Push Drizzle schema to DB
```

### Build Process (`script/build.ts`)
1. Vite builds client → `dist/public/`
2. esbuild compiles server → `dist/index.cjs`

### Android Build
```bash
# 1. Build web assets
npm run build

# 2. Sync to Android
npx cap sync android

# 3. Open in Android Studio
npx cap open android

# 4. Build APK from Android Studio
# OR via command line:
cd android && ./gradlew assembleDebug
```

### Development Workflow
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Android development
npx cap sync android
npx cap run android
```

---

## 16. PERFORMANCE OPTIMIZATIONS

### Server-Side
| Optimization | Impact |
|---|---|
| **In-memory session store** (dev) | Eliminates DB hit per request |
| **User cache** (60s TTL) | Saves ~200-400ms per auth check |
| **Parallel DB queries** in scheduler | 3 queries run simultaneously |
| **Parallel push notifications** | All notifications sent at once |
| **Connection pool** (min:2, max:10) | Warm connections ready |
| **Pool keep-alive** | Prevents cold connection to remote DB |
| **ETag caching** | 304 Not Modified responses |
| **Slow API warning** (>500ms) | Logs slow endpoints |
| **Stripe init in background** | Doesn't block server startup |

### Client-Side
| Optimization | Impact |
|---|---|
| **React Query caching** | Reduces redundant API calls |
| **Vite HMR** | Instant dev updates |
| **Code splitting** (Vite) | Smaller initial bundle |
| **Dismissed alarm dedup** | Prevents re-trigger within same minute |
| **isProcessingRef** guard | Prevents double alarm invocation |

### Android Native
| Optimization | Impact |
|---|---|
| **setAlarmClock()** | Most reliable scheduling method |
| **Foreground service** | Won't be killed by Android |
| **WakeLock** | Screen wakes immediately |
| **Battery optimization exemption** | Prevents alarm suppression |

---

## ✅ SUMMARY

**MyPA** is a full-stack Speaking Alarm application with:
- **React + TypeScript** frontend (SPA with Tailwind + Radix UI)
- **Express + Drizzle** backend (PostgreSQL, REST API)
- **Native Android** via Capacitor with custom Java plugins
- **Dual alarm system**: Server-side push + Native Android AlarmManager
- **Multi-language** TTS support (English, Hindi, Marathi, Spanish)
- **Payment integration**: Stripe (intl) + Razorpay (India)
- **Reliable native alarms** that work even when app is killed

---

*Document auto-generated on 15 Feb 2026*

