# MyPA Android App Build Instructions

## Screen Off पर Alarm के लिए Native Android App बनाना

### Option 1: Android Studio (Computer पर)

1. **Android Studio Download करें**
   - https://developer.android.com/studio से download करें
   - Install करें (Windows/Mac/Linux)

2. **Project Download करें**
   - Replit से "Download as ZIP" करें
   - या `git clone` से repository clone करें

3. **Build Steps**
   ```bash
   # Terminal में project folder में जाएं
   cd mypa-project
   
   # Web assets build करें
   npm install
   npm run build
   
   # Android sync करें
   npx cap sync android
   ```

4. **Android Studio में Open करें**
   - File → Open → `android` folder select करें
   - Gradle sync होने दें (5-10 minutes)
   - Build → Build Bundle(s) / APK(s) → Build APK(s)

5. **APK Location**
   - `android/app/build/outputs/apk/debug/app-debug.apk`

### Option 2: Cloud Build Service (Codemagic)

1. **Codemagic Account बनाएं**
   - https://codemagic.io पर जाएं
   - Free account create करें

2. **GitHub पर Push करें**
   - Project को GitHub repository में push करें

3. **Build Setup**
   - Codemagic में GitHub connect करें
   - Repository select करें
   - Android build configure करें
   - Build start करें

4. **APK Download**
   - Build complete होने पर APK download link मिलेगी

### Important Settings After Install

APK install करने के बाद:

1. **Notification Permission**
   - App open करें
   - Notification permission allow करें

2. **Battery Optimization Disable**
   - Settings → Apps → MyPA → Battery → "Don't optimize"
   - यह बहुत important है screen off पर alarm के लिए

3. **Auto-Start Enable (Xiaomi/Oppo/Vivo)**
   - Settings → Apps → MyPA → Autostart → Enable

### Technical Details

**Capacitor Plugins Used:**
- @capacitor/local-notifications - Native Android alarms
- @capacitor/push-notifications - Push notifications
- @capacitor/splash-screen - App splash screen
- @capacitor/status-bar - Status bar customization

**Android Permissions:**
- SCHEDULE_EXACT_ALARM - Screen off पर भी alarm
- WAKE_LOCK - Phone को wake करने के लिए
- RECEIVE_BOOT_COMPLETED - Restart पर alarms restore
- POST_NOTIFICATIONS - Notification permission

### Support

Problems होने पर:
- Android Studio में "Sync Project with Gradle Files" try करें
- "Invalidate Caches / Restart" try करें
- `npm run build && npx cap sync android` run करें
