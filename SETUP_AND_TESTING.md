# NaijaMart Hub Self-Tracking — Setup & Testing Documentation

**Project Tagline:** *Protect Your Phone Today. Find It Yourself Tomorrow.*

## 1. Project Overview & Architecture
NaijaMart Hub Self-Tracking is a mobile-first phone protection and self-recovery web application built with React, TypeScript, Tailwind CSS, and the Firebase v10+ modular SDK.

### Core Security & Privacy Foundations:
1. **Zero Fake Location Data:** Real GPS coordinates are acquired exclusively through the browser's Geolocation API (`navigator.geolocation.watchPosition` with `enableHighAccuracy: true`) upon explicit user consent.
2. **Strict Firestore Data Ownership:** Devices are stored in `registeredPhones/{deviceId}` with random document IDs. Read, update, and delete operations are restricted by security rules to the authenticated owner (`resource.data.ownerUid == request.auth.uid`).
3. **Luhn Algorithm Verification:** Every entered 15-digit IMEI is validated mathematically using the official Luhn checksum formula before being stored.
4. **Duplicate Prevention:** Existing IMEIs are verified to prevent unauthorized cross-account claims without physical proof of purchase or police affidavit.
5. **No Password Phishing:** Official recovery options for Android and Apple route directly to official `google.com/android/find` and `icloud.com/find`. NaijaMart never asks for or stores third-party passwords.

---

## 2. Page & Route Structure
- **`/` (Homepage):** Landing page with brand tagline, core action buttons (*Protect My Phone Now*, *Track My Lost Phone*, *How It Works*), 3 core workflow cards, and clear privacy disclaimer regarding mobile network limitations.
- **`/register` (Device Registration):** Authenticated registration form with 15-digit Luhn validation, Nigerian `+234` phone format validation, owner email, device model, consent checkbox, and duplicate prevention.
- **`/protect` (Location Protection Console):** Authenticated device protection page that monitors GPS position via `watchPosition`, checks browser permission status (`granted`, `prompt`, `denied`), reads hardware battery percentage when legitimately supported, throttles cloud sync to every 2 minutes, and provides Start/Stop protection controls.
- **`/track` (Recovery Tracker Dashboard):** Authenticated self-service recovery page for device owners. Renders real Leaflet / OpenStreetMap interactive view with coordinates, accuracy radius in meters, timestamp, Refresh Location, Open Directions, Copy Recovery Report, and browser Audio Siren.
- **`/how-it-works` (How It Works):** Step-by-step guide explaining device registration, location consent, cross-device recovery, and generating Nigerian Police Force (NPF) / DPO recovery extracts.

---

## 3. Firebase Console Configuration Guide

To deploy this project to your production Firebase project (`zangamarket1` or custom project):

### 1. Enable Firebase Authentication Providers
In your [Firebase Console](https://console.firebase.google.com/):
1. Navigate to **Build > Authentication > Sign-in method**.
2. **Email/Password:** Enable Email/Password.
3. **Anonymous:** Enable Anonymous authentication (used for quick guest verification testing).
4. **Phone Authentication (Optional):** Enable Phone Authentication. Under **Phone numbers for testing**, add your test phone numbers (e.g. `+2348012345678` with SMS code `123456`) so you can test without consuming SMS quotas.

### 2. Deploy Firestore Security Rules
Deploy `firestore.rules` using the Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

Or copy the rules from `firestore.rules` directly into **Firebase Console > Firestore Database > Rules** and click **Publish**.

### 3. Deploy PWA & Frontend Hosting
Build the application:
```bash
npm run build
```
Deploy to Firebase Hosting:
```bash
firebase deploy --only hosting
```

---

## 4. Test Verification Checklist

| # | Test Scenario | Expected Result | Status |
|---|---|---|---|
| 1 | **New User Sign Up & Sign In** | Email/password account created; active session stored in AuthContext. | ✅ Verified |
| 2 | **15-digit Luhn Checksum** | Correct IMEI passes; mistyped or invalid check digit displays clear warning. | ✅ Verified |
| 3 | **Duplicate Device Handling** | Attempting to register an already claimed IMEI returns cross-account security block. | ✅ Verified |
| 4 | **Location Permission (Granted/Denied)** | Browser prompt is respected; denial displays actionable browser settings guide. | ✅ Verified |
| 5 | **Active GPS Stream & Throttling** | `watchPosition` updates coordinates; Firestore updates are throttled to 2 mins. | ✅ Verified |
| 6 | **Firestore Persistence on Refresh** | Page reloads retrieve registered devices and last known coordinates. | ✅ Verified |
| 7 | **Unauthorized Cross-Account Access** | Non-owners cannot read or modify another user's `registeredPhones` documents. | ✅ Verified |
| 8 | **Missing Location State** | Newly registered devices without active protection display clean "No Location Reported Yet". | ✅ Verified |
| 9 | **Sign Out & Session Expiration** | Signing out immediately clears authenticated views and requires re-login on `/track`. | ✅ Verified |
| 10 | **PWA Installation & Offline Manifest** | `manifest.json` and `sw.js` are registered; Install prompt triggers on mobile/Chromium. | ✅ Verified |
| 11 | **Copy Police Recovery Report** | Generates standardized extract with IMEI, model, coordinates, accuracy, and Google Maps URL. | ✅ Verified |
| 12 | **Open Directions & Map Recenter** | Launches navigation directly to reported coordinates in mapping application. | ✅ Verified |

---

## 5. Contact & Support
- **Support Hotline:** +2348167258121
- **Platform:** NaijaMart Hub Self-Tracking
- **Theme Color:** `#168447` (Forest Green)
