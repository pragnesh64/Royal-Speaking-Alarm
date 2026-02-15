# 📱 MyPA - Production Setup Guide
# App Ko Android Phone Mein Chalane Ka Complete Guide
# (Personal Use / Client Delivery - Bina Play Store Ke)

> **Goal:** App ko WhatsApp ki tarah properly install karna Android phone pe, with backend server running 24/7, database live, APIs working — sab kuch production ready.

---

## 📋 TABLE OF CONTENTS

- [PHASE 1: Prerequisites (Kya Chahiye)](#phase-1-prerequisites)
- [PHASE 2: Database Setup (PostgreSQL)](#phase-2-database-setup)
- [PHASE 3: Server Deployment (Backend Live Karna)](#phase-3-server-deployment)
- [⭐ PHASE 3-VERCEL: Deploy Backend on Vercel (RECOMMENDED)](#phase-3-vercel-deploy-on-vercel)
- [PHASE 4: Build Production APK](#phase-4-build-production-apk)
- [PHASE 5: APK Install on Android Phone](#phase-5-install-apk-on-phone)
- [PHASE 6: Post-Install Permissions](#phase-6-post-install-permissions)
- [PHASE 7: Testing Checklist](#phase-7-testing-checklist)
- [PHASE 8: Maintenance & Updates](#phase-8-maintenance)
- [TROUBLESHOOTING](#troubleshooting)

---

## PHASE 1: PREREQUISITES

### 1.1 Kya Chahiye (Requirements)

| Item | Purpose | Free Option |
|---|---|---|
| **Computer** (Mac/Windows/Linux) | Build karne ke liye | Aapka current system |
| **Android Studio** | APK build karne ke liye | ✅ Free |
| **Node.js 20+** | Server chalane ke liye | ✅ Free |
| **PostgreSQL Database** | Data store karne ke liye | ✅ Neon.tech (Free tier) |
| **VPS Server** | Backend host karne ke liye (24/7) | ✅ Oracle Cloud (Free forever) |
| **Domain Name** (Optional) | HTTPS ke liye (push notifications) | ~₹500/year |
| **Android Phone** | App chalane ke liye | ✅ Aapka phone |

### 1.2 Software Install Karo (Apne Computer Pe)

#### Node.js 20+
```bash
# Mac (Homebrew)
brew install node

# Windows - https://nodejs.org se download karo (LTS version)

# Verify
node -v    # v20.x.x hona chahiye
npm -v     # 10.x.x hona chahiye
```

#### Android Studio
1. Download: https://developer.android.com/studio
2. Install karo (2-3 GB download hoga)
3. First launch pe ye install hona chahiye:
   - Android SDK (API 35)
   - Android SDK Build-Tools
   - Android Emulator (optional)
   - Java 17 (bundled aata hai)

#### Project Dependencies
```bash
# Project folder mein jaao
cd "/Users/pragnesh/Downloads/All Downloads/Royal-Speaking-Alarm 2"

# Dependencies install karo
npm install
```

---

## PHASE 2: DATABASE SETUP

### Option A: Neon.tech (Recommended - Free Cloud PostgreSQL)

Neon ek free cloud PostgreSQL service hai. Server chahe kahin bhi ho, database Neon pe rahega.

#### Step 1: Account Banao
1. Jaao: https://neon.tech
2. "Sign Up" click karo (GitHub ya Email se)
3. Free plan select karo

#### Step 2: Database Create Karo
1. Dashboard pe "New Project" click karo
2. Project name: `mypa-production`
3. Region: **Asia (Singapore)** select karo (India ke sabse close)
4. "Create Project" click karo

#### Step 3: Connection String Copy Karo
1. Dashboard pe connection string dikhega:
```
postgresql://username:password@ep-xxx-xxx-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```
2. **Ye string save karo** — ye tumhara `DATABASE_URL` hai

#### Step 4: Tables Create Karo
```bash
# Apne computer pe project folder mein jaao
cd "/Users/pragnesh/Downloads/All Downloads/Royal-Speaking-Alarm 2"

# DATABASE_URL set karo
export DATABASE_URL="postgresql://username:password@ep-xxx.neon.tech/neondb?sslmode=require"

# Tables create karo (Drizzle push)
npm run db:push
```

Output mein ye dikhna chahiye:
```
Changes applied
```

#### Verify Tables Created
Neon dashboard pe jaao → SQL Editor → Run:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```
Ye tables dikhne chahiye: `users`, `alarms`, `medicines`, `meetings`, `sessions`, `push_subscriptions`, `otp_codes`

### Option B: Local PostgreSQL (Agar VPS pe host kar rahe ho)

```bash
# Ubuntu server pe:
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Database banao
sudo -u postgres psql
CREATE USER mypa_user WITH PASSWORD 'your_strong_password_here';
CREATE DATABASE mypa_db OWNER mypa_user;
GRANT ALL PRIVILEGES ON DATABASE mypa_db TO mypa_user;
\q

# Connection string: postgresql://mypa_user:your_strong_password_here@localhost:5432/mypa_db
```

---

## PHASE 3: SERVER DEPLOYMENT

Server 24/7 chalna chahiye taaki app se APIs call ho sakein. Ye 3 options hain:

### Option A: Oracle Cloud VPS (FREE Forever - Recommended)

#### Step 1: Account Create Karo
1. https://cloud.oracle.com → "Start for free"
2. Account banao (credit card verification ke liye chahiye, lekin charge nahi hoga)

#### Step 2: VM Instance Create Karo
1. Dashboard → "Create a VM instance"
2. Settings:
   - **Name:** mypa-server
   - **Shape:** VM.Standard.E2.1.Micro (**Always Free**)
   - **Image:** Ubuntu 22.04
   - **Networking:** Default VCN, public subnet
   - **SSH key:** Generate karo ya apni add karo
3. "Create" click karo
4. **Public IP note karo** (jaise: `129.154.XX.XX`)

#### Step 3: Server Setup

```bash
# SSH se connect karo
ssh ubuntu@129.154.XX.XX

# System update
sudo apt-get update && sudo apt-get upgrade -y

# Node.js 20 install karo
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 install karo (process manager - auto-restart)
sudo npm install -g pm2

# Project folder banao
mkdir -p ~/mypa-app
```

#### Step 4: Project Files Upload Karo

Apne computer pe terminal kholo:
```bash
# Project build karo pehle
cd "/Users/pragnesh/Downloads/All Downloads/Royal-Speaking-Alarm 2"
npm run build

# Server pe upload karo (scp se)
scp -r dist/ package.json package-lock.json ubuntu@129.154.XX.XX:~/mypa-app/
scp -r shared/ ubuntu@129.154.XX.XX:~/mypa-app/
scp -r server/ ubuntu@129.154.XX.XX:~/mypa-app/
scp -r node_modules/ ubuntu@129.154.XX.XX:~/mypa-app/
```

> **TIP:** Agar node_modules bohot bada hai toh server pe `npm install --production` run karo:
```bash
# Server pe:
cd ~/mypa-app
npm install --production
```

#### Step 5: Environment Variables Set Karo

Server pe:
```bash
cd ~/mypa-app
nano .env
```

Ye content daalo:
```env
# ════════════════════════════════════════════
# MyPA Production Environment Variables
# ════════════════════════════════════════════

# ⚡ REQUIRED
DATABASE_URL=postgresql://username:password@ep-xxx.neon.tech/neondb?sslmode=require
SESSION_SECRET=generate_a_random_64_char_string_here
NODE_ENV=production
PORT=5000

# 🔔 Push Notifications (auto-generated if empty, but better to fix them)
# Generate: npx web-push generate-vapid-keys
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=

# 💳 Payments (Optional - skip if not needed)
# RAZORPAY_KEY_ID=rzp_live_xxxxx
# RAZORPAY_KEY_SECRET=xxxxx
# STRIPE_SECRET_KEY=sk_live_xxxxx
# STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx

# 🌐 Domain (Optional - for HTTPS)
# APP_DOMAIN=mypa.yourdomain.com
```

**SESSION_SECRET generate karne ke liye:**
```bash
openssl rand -hex 32
```

**VAPID keys generate karne ke liye:**
```bash
npx web-push generate-vapid-keys
```
Output se Public aur Private key copy karke .env mein daalo.

#### Step 6: Database Tables Setup (if not done)
```bash
cd ~/mypa-app
npm run db:push
```

#### Step 7: App Start Karo
```bash
cd ~/mypa-app

# Production mode mein start karo
pm2 start dist/index.cjs --name mypa --env production

# Auto-start on server reboot
pm2 save
pm2 startup
# ↑ Jo command ye output de woh copy-paste karke run karo
```

#### Step 8: Firewall/Ports Open Karo

**Oracle Cloud Console mein:**
1. Networking → Virtual Cloud Networks → Apna VCN
2. Security Lists → Default Security List
3. "Add Ingress Rules":
   - Source CIDR: `0.0.0.0/0`
   - Destination Port Range: `5000`
   - (Agar Nginx use kar rahe ho toh: `80, 443`)
4. Save

**Server pe (iptables):**
```bash
sudo iptables -I INPUT -p tcp --dport 5000 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
sudo apt-get install -y iptables-persistent
sudo netfilter-persistent save
```

#### Step 9: Verify Server Running
```bash
# Server pe
curl http://localhost:5000/api/auth/user
# Expected: {"message":"Unauthorized"} (ye correct hai — matlab server chal raha hai)

# Apne computer se
curl http://129.154.XX.XX:5000/api/auth/user
# Same response aana chahiye
```

### Option B: Railway.app (Easy - Low Cost)

1. https://railway.app pe jaao
2. GitHub se login karo
3. "New Project" → "Deploy from GitHub repo"
4. Environment variables add karo (.env wale)
5. Auto-deploy ho jayega
6. Railway URL milega: `https://mypa-xxx.up.railway.app`

### Option C: Apne Computer Se (Temporary - Only for Testing)

```bash
cd "/Users/pragnesh/Downloads/All Downloads/Royal-Speaking-Alarm 2"
npm run build
NODE_ENV=production npm start
# Server chalega: http://YOUR_LOCAL_IP:5000
```

> ⚠️ Ye tab tak chalega jab tak computer on hai aur same WiFi pe ho.

---

## PHASE 3.5: HTTPS SETUP (Optional but Recommended)

Push notifications ke liye HTTPS chahiye. Bina HTTPS ke:
- ✅ App chalegi
- ✅ Alarms ring honge (native alarms)
- ❌ Web Push notifications kaam nahi karenge
- ❌ Service Worker register nahi hoga

### Domain + Nginx + SSL

```bash
# Server pe:
sudo apt-get install -y nginx certbot python3-certbot-nginx

# Nginx config banao
sudo nano /etc/nginx/sites-available/mypa
```

Content:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 10M;
    }
}
```

```bash
# Enable karo
sudo ln -s /etc/nginx/sites-available/mypa /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Free SSL certificate lagao (auto-renew)
sudo certbot --nginx -d yourdomain.com

# Verify HTTPS
curl https://yourdomain.com/api/auth/user
```

---

## ⭐ PHASE 3-VERCEL: DEPLOY BACKEND ON VERCEL (RECOMMENDED)

Vercel pe deploy karna sabse **easy aur free** hai. Koi VPS manage nahi karna padta, automatic HTTPS milta hai, aur push notifications bhi kaam karenge.

### Vercel Kya Hai?
- **Free hosting** for frontend + backend (serverless)
- **Automatic HTTPS** (SSL) — push notifications ke liye zaroori
- **Auto-deploy** from GitHub — code push karo, auto-deploy ho jayega
- **Cron Jobs** — alarm scheduler ke liye (har minute check karta hai)
- **Zero maintenance** — koi server manage nahi karna padta

### ⚠️ Vercel Ki Limitations (Samjho Pehle)

| Feature | Traditional Server | Vercel |
|---|---|---|
| API Routes | ✅ Sab kaam karte | ✅ Sab kaam karte |
| Database | ✅ | ✅ (Neon.tech se connect) |
| File Uploads | ✅ Disk pe save | ✅ Base64/memory mein (already configured) |
| Sessions | ✅ Memory/DB | ✅ DB-backed (PostgreSQL) |
| Alarm Scheduler | ✅ 30s interval | ✅ Cron Job (1 min interval) |
| Push Notifications | ✅ | ✅ (HTTPS automatic!) |
| Long-running processes | ✅ | ❌ Max 30s per request |
| WebSockets | ✅ | ❌ Not supported |
| Cost | ₹0-300/month (VPS) | ✅ FREE (Hobby plan) |

> **Bottom line:** Tumhare app ke liye Vercel **perfectly kaam karega**. Native alarms toh phone pe local hain, aur APIs sab serverless mein chalte hain.

---

### Step 1: GitHub Repository Banao

```bash
# Project folder mein jaao
cd "/Users/pragnesh/Downloads/All Downloads/Royal-Speaking-Alarm 2"

# Git init karo (agar nahi kiya hai)
git init

# .gitignore check karo — ye files NAHI jaani chahiye GitHub pe
cat .gitignore
# node_modules, dist, .env, android/app/build ye sab ignore hone chahiye

# Sab files add karo
git add .
git commit -m "Initial commit - MyPA app"

# GitHub pe repository banao (https://github.com/new)
# Repository name: mypa-app (ya jo chaaho)
# Private rakhna (personal use ke liye)

# Remote add karo
git remote add origin https://github.com/YOUR_USERNAME/mypa-app.git
git push -u origin main
```

### Step 2: Vercel Account Banao

1. Jaao: https://vercel.com
2. **"Sign Up"** → **"Continue with GitHub"**
3. GitHub account se login karo
4. Free (Hobby) plan select karo

### Step 3: Neon.tech Database Setup (Agar nahi kiya)

> Ye Phase 2 mein already covered hai. Agar Neon database bana liya hai, toh skip karo.

1. https://neon.tech → Sign Up
2. New Project → `mypa-production` → Region: Singapore
3. Connection string copy karo

### Step 4: Vercel Pe Project Import Karo

1. Vercel Dashboard → **"Add New..."** → **"Project"**
2. **"Import Git Repository"** → Apna `mypa-app` repo select karo
3. **Configure Project:**

   | Setting | Value |
   |---|---|
   | Framework Preset | **Other** |
   | Root Directory | `.` (default) |
   | Build Command | `npm run build:client` |
   | Output Directory | `dist/public` |
   | Install Command | `npm install` |

4. **"Deploy"** click karo — pehla deploy start ho jayega

### Step 5: Environment Variables Set Karo

Vercel Dashboard → Apna Project → **Settings** → **Environment Variables**

Ye variables add karo:

| Key | Value | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require` | Neon se copy karo |
| `SESSION_SECRET` | (random 64 char string) | `openssl rand -hex 32` se generate karo |
| `NODE_ENV` | `production` | |
| `VAPID_PUBLIC_KEY` | (your key) | `npx web-push generate-vapid-keys` se |
| `VAPID_PRIVATE_KEY` | (your key) | Same command se |
| `CRON_SECRET` | (random string) | Cron job security ke liye |
| `RAZORPAY_KEY_ID` | (optional) | Agar payment chahiye |
| `RAZORPAY_KEY_SECRET` | (optional) | Agar payment chahiye |
| `FAST2SMS_API_KEY` | (optional) | Agar OTP chahiye |

**Har variable ke liye:**
1. "Add New" click karo
2. Key aur Value daalo
3. Environment: **Production**, **Preview**, **Development** teeno select karo
4. "Save" click karo

### Step 6: Database Tables Create Karo

```bash
# Apne computer pe
cd "/Users/pragnesh/Downloads/All Downloads/Royal-Speaking-Alarm 2"

# Neon DATABASE_URL set karo
export DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require"

# Tables push karo
npm run db:push
```

### Step 7: Redeploy Karo

Environment variables add karne ke baad:
1. Vercel Dashboard → Apna Project → **Deployments**
2. Latest deployment pe click → **"..."** menu → **"Redeploy"**
3. ya terminal se:
```bash
cd "/Users/pragnesh/Downloads/All Downloads/Royal-Speaking-Alarm 2"
git add .
git commit -m "Add Vercel configuration"
git push
# Auto-deploy ho jayega!
```

### Step 8: Verify Deployment

Vercel tumhe ek URL dega jaise: `https://mypa-app.vercel.app`

**Test karo:**
```bash
# Health check
curl https://mypa-app.vercel.app/api/auth/user
# Expected: {"message":"Unauthorized"} ← Server chal raha hai!

# Cron job test
curl https://mypa-app.vercel.app/api/cron/check-alarms
# Expected: {"ok":true,"time":"...","checked":{...}}
```

**Browser mein kholo:**
- `https://mypa-app.vercel.app` → App ka frontend dikhna chahiye

### Step 9: Custom Domain (Optional)

Vercel pe free subdomain milta hai (`mypa-app.vercel.app`), lekin apna domain bhi laga sakte ho:

1. Vercel Dashboard → Project → **Settings** → **Domains**
2. Apna domain add karo (jaise `mypa.yourdomain.com`)
3. DNS mein CNAME record add karo:
   - Type: CNAME
   - Name: mypa (ya @)
   - Value: `cname.vercel-dns.com`
4. SSL automatic lag jayega (2-3 minutes)

### Vercel Project Structure (Jo Files Vercel Use Karta Hai)

```
Royal-Speaking-Alarm 2/
├── api/                          ← Vercel Serverless Functions
│   ├── index.ts                  ← Main API handler (Express wrapped)
│   └── cron/
│       └── check-alarms.ts       ← Cron job (runs every minute)
├── vercel.json                   ← Vercel configuration
├── dist/public/                  ← Built frontend (Vite output)
├── server/                       ← Express routes, DB, auth (used by api/index.ts)
├── shared/                       ← Shared schema
└── package.json                  ← Dependencies + build:client script
```

### Vercel Free Plan Limits

| Resource | Free Limit | Enough for MyPA? |
|---|---|---|
| Serverless Function Executions | 100,000/month | ✅ (personal use mein ~1000-5000) |
| Bandwidth | 100 GB/month | ✅ |
| Build Minutes | 6,000/month | ✅ |
| Cron Jobs | 2 cron jobs | ✅ (sirf 1 chahiye) |
| Cron Frequency | Every 1 minute (minimum) | ✅ |
| Function Duration | 30 seconds max | ✅ |
| Deployments | Unlimited | ✅ |

### Future Updates (Vercel Pe)

Code change karne ke baad:
```bash
# 1. Changes karo
# 2. Commit & push
git add .
git commit -m "Update: description of changes"
git push

# 3. Auto-deploy! Vercel 30-60 seconds mein deploy kar dega
# Dashboard pe deployment status dikh jayega
```

---

## PHASE 4: BUILD PRODUCTION APK

### Step 1: Capacitor Config Update Karo

Server URL ko production server ka URL set karo:

**File: `capacitor.config.ts`**

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mypa.app',
  appName: 'MyPA',
  webDir: 'dist/public',
  server: {
    // ═══════════════════════════════════════════
    // PRODUCTION URL — Apne server ka URL daalo
    // ═══════════════════════════════════════════
    
    // Option 1: Vercel (RECOMMENDED - free + HTTPS)
    // url: 'https://mypa-app.vercel.app',
    
    // Option 2: Custom Domain + HTTPS
    // url: 'https://mypa.yourdomain.com',
    
    // Option 3: VPS IP + Port (Push notifications won't work)
    url: 'http://129.154.XX.XX:5000',
    
    androidScheme: 'https',   // 'https' for Vercel/domain, 'http' for IP
    cleartext: false           // false for HTTPS, true for HTTP
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon",
      iconColor: "#002E6E",
      sound: "beep.wav"
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#002E6E",
      showSpinner: false
    },
    StatusBar: {
      backgroundColor: "#002E6E"
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false  // false for production!
  }
};

export default config;
```

### Step 2: Network Security Config Update Karo

**File: `android/app/src/main/res/xml/network_security_config.xml`**

Apne server ka IP/domain add karo:
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </base-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">127.0.0.1</domain>
        <domain includeSubdomains="true">129.154.XX.XX</domain>   <!-- Apna server IP -->
        <domain includeSubdomains="true">mypa.yourdomain.com</domain>  <!-- Apna domain -->
    </domain-config>
</network-security-config>
```

### Step 3: Web Assets Build Karo

```bash
cd "/Users/pragnesh/Downloads/All Downloads/Royal-Speaking-Alarm 2"

# Production build
npm run build

# Capacitor sync (copies web assets to android)
npx cap sync android
```

### Step 4: Android Studio Mein Open Karo

```bash
# Android Studio open hoga with android project
npx cap open android
```

Ya manually: Android Studio → File → Open → Navigate to:
```
/Users/pragnesh/Downloads/All Downloads/Royal-Speaking-Alarm 2/android
```

### Step 5: Gradle Sync Hone Do
- Android Studio khulne pe bottom mein "Gradle Sync" chalega
- 2-5 minutes lagenge (pehli baar 10-15 minutes)
- Agar error aaye: File → Sync Project with Gradle Files

### Step 6: Signed APK Build Karo (Release Build)

**Signed APK** lagega taaki phone pe properly install ho — jaise WhatsApp ka APK hota hai.

#### 6a: Signing Key Generate Karo (Ek Baar)

```bash
# Keystore file generate karo
keytool -genkey -v -keystore ~/mypa-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias mypa

# Ye questions puchega:
# Keystore password: [koi strong password daalo, YAAD RAKHNA!]
# Re-enter password: [same password]
# First and last name: Pragnesh
# Organizational unit: MyPA
# Organization: MyPA
# City: [Your City]
# State: [Your State]
# Country code: IN
# Is CN=Pragnesh, OU=MyPA... correct? [yes]
# Key password: [ENTER to use same as keystore]
```

> ⚠️ **CRITICAL:** `mypa-release-key.jks` file aur password KABHI MAT KHOONA! Bina iske app update nahi kar paoge.

#### 6b: Signing Config Add Karo

**File: `android/app/build.gradle`** mein `android { }` block ke andar:

```gradle
android {
    namespace "com.mypa.app"
    compileSdk rootProject.ext.compileSdkVersion
    
    // ═══════ ADD THIS BLOCK ═══════
    signingConfigs {
        release {
            storeFile file("/Users/pragnesh/mypa-release-key.jks")
            storePassword "YOUR_KEYSTORE_PASSWORD"
            keyAlias "mypa"
            keyPassword "YOUR_KEY_PASSWORD"
        }
    }
    // ═══════════════════════════════
    
    defaultConfig {
        applicationId "com.mypa.app"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0"
        ...
    }
    
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release    // ← ADD THIS LINE
        }
    }
}
```

#### 6c: Release APK Build Karo

**Method 1: Android Studio GUI**
1. Android Studio mein: **Build → Generate Signed Bundle / APK**
2. Select: **APK** (not Bundle, Bundle Play Store ke liye hota hai)
3. Key store path: `/Users/pragnesh/mypa-release-key.jks`
4. Password daalo
5. Key alias: `mypa`
6. Next → **release** select karo
7. Finish

**Method 2: Command Line**
```bash
cd "/Users/pragnesh/Downloads/All Downloads/Royal-Speaking-Alarm 2/android"

# Release APK build karo
./gradlew assembleRelease
```

### Step 7: APK File Location

Build hone ke baad APK yahaan milegi:

```
# Debug APK:
android/app/build/outputs/apk/debug/app-debug.apk

# Release APK (signed):
android/app/build/outputs/apk/release/app-release.apk
```

**File size:** ~10-20 MB hogi (normal, WhatsApp bhi 50MB+ hoti hai)

---

## PHASE 5: INSTALL APK ON PHONE

### Method 1: USB Cable Se (Sabse Easy)

1. Android phone ko USB se computer se connect karo
2. Phone pe: "File Transfer / MTP" mode select karo
3. Computer se `app-release.apk` file phone ke `Downloads` folder mein copy karo
4. Phone pe file manager kholo → Downloads → `app-release.apk` tap karo
5. "Install from unknown sources" allow karo (pehli baar puchega)
6. Install karo

### Method 2: ADB Se (Developer Mode)

```bash
# Phone ko USB se connect karo
# Phone pe Developer Options → USB Debugging ON karo

# ADB se install karo
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

ADB install karne ke liye:
```bash
# Mac
brew install android-platform-tools

# Windows - Android Studio ke saath aata hai
# Path: C:\Users\YOUR_NAME\AppData\Local\Android\Sdk\platform-tools\adb.exe
```

### Method 3: Google Drive / WhatsApp Se (Client Ko Bhejna)

1. `app-release.apk` file ko **Google Drive** pe upload karo
2. Client ko link share karo
3. Client download karke install karega

> **ya** WhatsApp pe APK file as document send karo (40MB limit hai)

### Method 4: Direct Android Studio Se (Development)

```bash
# Phone USB se connected hona chahiye + USB Debugging ON
cd "/Users/pragnesh/Downloads/All Downloads/Royal-Speaking-Alarm 2"
npx cap run android
```

---

## PHASE 6: POST-INSTALL PERMISSIONS

App install hone ke baad ye settings karna **CRITICAL** hai — bina iske alarms kaam nahi karenge:

### 6.1 First Launch
1. App kholo
2. **Notification Permission** → "Allow" karo
3. **Exact Alarm Permission** → Settings khulega → "Allow setting alarms and reminders" ON karo
4. **Battery Optimization** → "Don't optimize" / "Unrestricted" select karo

### 6.2 Battery Optimization Disable (MOST IMPORTANT)

Bina iske app background mein kill ho jayegi aur alarms nahi bajenge!

**Stock Android:**
```
Settings → Apps → MyPA → Battery → Unrestricted
```

**Samsung:**
```
Settings → Apps → MyPA → Battery → Unrestricted
Settings → Battery → Background usage limits → Never sleeping apps → Add MyPA
```

**Xiaomi/Redmi:**
```
Settings → Apps → Manage Apps → MyPA → Autostart → ON
Settings → Battery → App Battery Saver → MyPA → No restrictions
Security App → Manage apps → MyPA → Autostart → Allow
```

**Oppo/Realme:**
```
Settings → Battery → App Launch Management → MyPA → Manage manually → All toggles ON
```

**Vivo:**
```
Settings → Battery → Background Power Consumption → MyPA → Allow
i Manager → App Manager → Autostart → MyPA → ON
```

**OnePlus:**
```
Settings → Apps → MyPA → Battery → Don't optimize
Settings → Battery → Battery Optimization → All apps → MyPA → Don't optimize
```

### 6.3 Auto-Start Permission

Kuch phones (Xiaomi, Oppo, Vivo) mein Auto-start alag se enable karna padta hai:
```
Settings → Apps → MyPA → Auto-start → Enable
```

### 6.4 Lock Screen Display

Alarm lock screen pe dikhane ke liye:
```
Settings → Apps → MyPA → Display over other apps → Allow
Settings → Apps → MyPA → Show on lock screen → Allow
```

---

## PHASE 7: TESTING CHECKLIST

App install hone ke baad ye sab test karo:

### ✅ Basic Functionality
| Test | Steps | Expected |
|---|---|---|
| Login | Email/password se login karo | Dashboard dikhna chahiye |
| Create Alarm | New alarm banao (2 min baad ke liye) | Alarm list mein dikhna chahiye |
| Alarm Rings | 2 min wait karo | Alarm bajni chahiye with sound + vibration |
| Dismiss | "Dismiss" button dabbao | Alarm band ho jaye |
| Snooze | "Snooze" dabbao | 5 min baad fir baje |
| Medicine | Medicine reminder banao | List mein dikhna chahiye |
| Meeting | Meeting reminder banao | List mein dikhna chahiye |

### ✅ Background Alarm Tests
| Test | Steps | Expected |
|---|---|---|
| Screen Off | Alarm set karo → Screen lock karo → Wait | Alarm bajni chahiye, screen jaagni chahiye |
| App Killed | Alarm set karo → Recent apps se clear karo → Wait | Alarm bajni chahiye (native AlarmManager se) |
| Phone Restart | Alarm set karo → Phone restart karo → Wait | Alarm bajni chahiye |

### ✅ Network Tests
| Test | Steps | Expected |
|---|---|---|
| WiFi | WiFi pe app use karo | Sab kaam kare |
| Mobile Data | WiFi off karo, mobile data on karo | Sab kaam kare |
| Offline | Airplane mode mein alarm test karo | Native alarms chalein (server calls fail honge - normal) |

### Quick API Test (Terminal Se)
```bash
# Server health check
curl http://YOUR_SERVER_IP:5000/api/auth/user
# Expected: {"message":"Unauthorized"}

# Register new user
curl -X POST http://YOUR_SERVER_IP:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","firstName":"Test","lastName":"User"}'
```

---

## PHASE 8: MAINTENANCE

### 8.1 Server Monitoring

```bash
# SSH se server pe jaao
ssh ubuntu@YOUR_SERVER_IP

# App status check karo
pm2 status

# Live logs dekho
pm2 logs mypa

# Last 100 lines
pm2 logs mypa --lines 100

# Memory/CPU usage
pm2 monit
```

### 8.2 App Update Kaise Karo

Jab code mein changes karo:

```bash
# 1. Apne computer pe
cd "/Users/pragnesh/Downloads/All Downloads/Royal-Speaking-Alarm 2"

# 2. Code changes karo

# 3. Build karo
npm run build

# 4. Server pe upload karo
scp -r dist/ ubuntu@YOUR_SERVER_IP:~/mypa-app/

# 5. Server pe restart karo
ssh ubuntu@YOUR_SERVER_IP "cd ~/mypa-app && pm2 restart mypa"

# 6. Agar Android mein bhi changes hain:
npx cap sync android
# Android Studio se naya APK build karo
# Phone pe install karo (purana automatically replace ho jayega)
```

### 8.3 Database Backup

```bash
# Neon.tech: Automatic backup hota hai (free tier mein bhi)

# Local PostgreSQL backup:
ssh ubuntu@YOUR_SERVER_IP
pg_dump -U mypa_user mypa_db > ~/backup_$(date +%Y%m%d).sql

# Restore:
psql -U mypa_user mypa_db < ~/backup_YYYYMMDD.sql
```

### 8.4 Version Update (APK version badhana)

Jab naya APK banao, version badhao:

**File: `android/app/build.gradle`**
```gradle
defaultConfig {
    applicationId "com.mypa.app"
    versionCode 2        // ← Har update pe +1 karo (1, 2, 3, ...)
    versionName "1.1"    // ← User-visible version
}
```

---

## TROUBLESHOOTING

### ❌ "App Not Installed" Error

**Cause:** Purana debug APK installed hai, naya release APK conflict kar raha hai.
```bash
# Purana app uninstall karo pehle
adb uninstall com.mypa.app
# Fir naya install karo
adb install app-release.apk
```

### ❌ "No Connection" / White Screen

**Cause:** App server se connect nahi ho pa rahi.

1. **Server chal raha hai check karo:**
```bash
ssh ubuntu@YOUR_SERVER_IP
pm2 status    # "online" dikhna chahiye
```

2. **Phone se server accessible hai check karo:**
   - Phone ke browser mein kholo: `http://YOUR_SERVER_IP:5000`
   - Agar page load nahi ho raha → firewall/port issue

3. **Capacitor config mein sahi URL hai check karo:**
   - `capacitor.config.ts` mein `server.url` check karo
   - After changing: `npm run build && npx cap sync android` → rebuild APK

4. **Network security config mein IP added hai check karo:**
   - `android/app/src/main/res/xml/network_security_config.xml`

### ❌ "Alarm Not Ringing When App Killed"

1. Battery optimization disable kiya?
   - Settings → Apps → MyPA → Battery → Unrestricted
2. Auto-start enabled hai?
   - (Xiaomi/Oppo/Vivo) Settings → Apps → MyPA → Auto-start → ON
3. Exact alarm permission diya?
   - Settings → Apps → MyPA → Alarms & reminders → Allow

### ❌ Gradle Build Failed

```bash
# Clean build karo
cd android
./gradlew clean
./gradlew assembleDebug

# Agar Java error aaye:
# Android Studio → File → Invalidate Caches → Restart

# Agar dependency error aaye:
cd ..
npm install
npx cap sync android
```

### ❌ "INSTALL_FAILED_UPDATE_INCOMPATIBLE"

```bash
# Purana app completely uninstall karo
adb uninstall com.mypa.app
# Fir install karo
adb install app-release.apk
```

### ❌ Database Connection Error

```bash
# Server pe logs check karo
ssh ubuntu@YOUR_SERVER_IP
pm2 logs mypa --lines 50

# DATABASE_URL sahi hai check karo
cat ~/mypa-app/.env | grep DATABASE

# Database accessible hai check karo
# Neon.tech dashboard pe jaao → Connection test karo
```

### ❌ Push Notifications Not Working

- HTTPS (SSL) setup kiya hai? → Bina SSL ke push nahi chalenge
- VAPID keys .env mein hain? → `grep VAPID .env`
- Service worker registered hai? → Browser console mein check karo

> **Note:** Native alarms (sound + vibration + full-screen) bina push notifications ke bhi kaam karenge. Push notifications sirf extra backup hain.

---

## 📊 QUICK REFERENCE CARD

### Key URLs
| What | URL |
|---|---|
| Vercel App | `https://mypa-app.vercel.app` |
| Vercel Dashboard | https://vercel.com/dashboard |
| Server API (Vercel) | `https://mypa-app.vercel.app/api/` |
| Server API (VPS) | `http://YOUR_SERVER_IP:5000/api/` |
| Neon Dashboard | https://console.neon.tech |
| Oracle Cloud | https://cloud.oracle.com |

### Key Files to Edit for Production
| File | What to Change |
|---|---|
| `capacitor.config.ts` | Server URL (Vercel URL ya VPS IP) |
| `android/.../network_security_config.xml` | Server IP/domain |
| `vercel.json` | Vercel config (already configured) |
| `api/index.ts` | Vercel serverless entry (already created) |
| `.env` (server/Vercel) | DATABASE_URL, SESSION_SECRET, VAPID keys |
| `android/app/build.gradle` | Signing config, versionCode |

### Key Commands
```bash
# Build everything
npm run build && npx cap sync android

# ── Vercel Deployment ──
git add . && git commit -m "update" && git push   # Auto-deploy!

# ── VPS Deployment ──
pm2 start dist/index.cjs --name mypa
pm2 logs mypa

# Install APK
adb install -r android/app/build/outputs/apk/release/app-release.apk

# Database setup
npm run db:push
```

### Architecture Overview
```
┌──────────────┐    HTTP/HTTPS    ┌──────────────┐    SQL    ┌──────────────┐
│  Android App │ ───────────────→ │  Express     │ ────────→ │  PostgreSQL  │
│  (Capacitor) │ ←─────────────── │  Server      │ ←──────── │  (Neon.tech) │
│  WebView +   │    JSON APIs     │  (VPS/Cloud) │           │              │
│  Native Java │                  │  Port 5000   │           │  Tables:     │
│              │                  │              │           │  - users     │
│  AlarmManager│                  │  Features:   │           │  - alarms    │
│  (native)    │                  │  - Auth      │           │  - medicines │
│              │                  │  - CRUD APIs │           │  - meetings  │
│  Foreground  │                  │  - Scheduler │           │  - sessions  │
│  Service     │                  │  - Push      │           │              │
│  (sound+vib) │                  │  - Payments  │           │              │
└──────────────┘                  └──────────────┘           └──────────────┘
```

---

## ✅ FINAL CHECKLIST

Before handing to client or personal use:

- [ ] Server 24/7 chal raha hai (PM2 + auto-restart)
- [ ] Database connected hai aur tables created hain
- [ ] `.env` mein sab values sahi hain
- [ ] `capacitor.config.ts` mein production server URL hai
- [ ] `network_security_config.xml` mein server IP hai
- [ ] Release APK build kiya hai (signed)
- [ ] APK phone pe install ho gayi hai
- [ ] Notification permission diya hai
- [ ] Battery optimization disabled hai
- [ ] Auto-start enabled hai (Xiaomi/Oppo/Vivo)
- [ ] Test alarm properly ring ho rahi hai
- [ ] Screen off pe bhi alarm aati hai
- [ ] App kill karne ke baad bhi alarm aati hai
- [ ] Login/Register kaam kar raha hai
- [ ] Alarm create/edit/delete kaam kar raha hai

---

*Document created on 15 Feb 2026*
*For MyPA v1.0 - Royal Speaking Alarm*

