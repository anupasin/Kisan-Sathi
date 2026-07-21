# Shipping Kisan Sathi to the Google Play Store (TWA)

The Android app is a **Trusted Web Activity** — a thin wrapper around the deployed
PWA. One codebase; web deploys update the app instantly with no Play review.

## Prerequisites (one-time)

1. **Deployed HTTPS domain** on Vercel with the PWA passing Lighthouse
   installability (service worker + manifest + icons are already in this repo).
2. **Google Play Console developer account** — $25 one-time at
   https://play.google.com/console/signup
3. Node.js installed (you have it). Bubblewrap will offer to auto-install
   JDK 17 and the Android SDK on first run — accept both.

## Build steps

```powershell
npm i -g @bubblewrap/cli

# Initialize from the LIVE manifest (replace with your real domain):
bubblewrap init --manifest https://<your-domain>/manifest.webmanifest
#  - applicationId: com.kisansathi.app   (must match public/.well-known/assetlinks.json)
#  - keep defaults for display/orientation; icons come from the manifest
#  - it generates a signing keystore — SAVE the keystore file + both passwords
#    somewhere safe (password manager). Losing them means losing app updates.

bubblewrap build
# Produces app-release-bundle.aab (upload this) and an .apk (local testing)
```

## Digital Asset Links (removes the browser URL bar)

1. In Play Console → your app → **Test and release → Setup → App signing**,
   copy the **SHA-256 certificate fingerprint** (the *App signing key
   certificate*, not the upload key).
2. Paste it into `public/.well-known/assetlinks.json` in this repo (replacing
   `REPLACE_WITH_PLAY_APP_SIGNING_SHA256_FINGERPRINT`), deploy.
3. Verify: `https://<your-domain>/.well-known/assetlinks.json` loads, and
   `adb shell pm get-app-links com.kisansathi.app` shows `verified` after
   installing the app.

## Play Console submission

1. Create the app (English + add Hindi/Telugu/Kannada/Tamil store listings).
2. Upload the `.aab` to **Internal testing** first; add your own Gmail as tester.
3. Complete Data safety form: the app collects email (auth), approximate
   location (user-granted), photos (plant scans, processed then discarded),
   and payment status. Data is stored with Supabase (ap-south-1).
4. Content rating questionnaire → Utility. Target audience: adults.
5. After internal testing works (camera, mic, sign-in, notifications), promote
   to Production.

## Billing compliance (India)

The ₹199/year purchase currently happens via Razorpay on the web checkout.
Under Google Play's India rules (post-CCI, updated March 2026), apps serving
Indian users may offer **alternative billing / user-choice billing**, and the
March-2026 policy update also allows directing users to your website for
purchases. Before submission, confirm the current state of:
https://support.google.com/googleplay/android-developer/answer/13306652
If required, enroll the app in the user-choice billing program in Play Console.

## Re-releasing after web changes

Nothing to do — the TWA loads the live site. Only rebuild/re-upload the AAB if
you change the app id, icons, splash, or manifest-level settings.
