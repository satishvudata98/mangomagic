# MangoBulk

MangoBulk is a single-server mango ordering app with:

- Next.js App Router + Tailwind CSS
- Node.js + Express
- Firebase Authentication for phone OTP login
- Firebase Firestore for app data
- Razorpay for payments

The active frontend now lives in `mangomagic-next/`.
The old Vite frontend remains in `client/` as a rollback path during migration.

This project no longer uses Supabase.

## What Changed

Authentication now uses Firebase Phone Authentication.

- OTP is sent by Firebase Auth
- OTP verification signs the user in automatically
- The frontend sends Firebase ID tokens to the backend
- The backend verifies Firebase ID tokens with Firebase Admin
- User profiles are stored in Firestore
- Products, serviceable pincodes, and orders are also stored in Firestore

## Prerequisites

Install these first:

1. Node.js 20+
2. npm
3. A Firebase project
4. A Firestore database
5. Firebase Authentication with Phone enabled
6. A Firebase service account for the backend
7. A Razorpay account with test keys

Optional:

1. Docker Desktop
2. Render account for deployment

## Firebase Setup

Official docs used for this setup:

- Firebase Phone Auth for web: `https://firebase.google.com/docs/auth/web/phone-auth`
- Firebase test phone numbers: `https://firebase.google.com/docs/auth/web/test-phone-numbers`
- Firebase Admin SDK setup: `https://firebase.google.com/docs/admin/setup`
- Firestore quickstart: `https://firebase.google.com/docs/firestore/quickstart`

## 1. Create a Firebase Project

1. Go to `https://console.firebase.google.com`
2. Click `Create a project`
3. Complete the project wizard
4. Open the project after it is created

## 2. Add a Web App

1. In Firebase console, open project settings
2. Under `Your apps`, click the web icon
3. Register a web app
4. Copy the Firebase web config values

You will need these for `.env`:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## 3. Enable Phone Authentication

1. In Firebase console go to `Authentication`
2. Open `Sign-in method`
3. Enable `Phone`
4. Save changes

Important:

- This project uses Firebase-managed phone auth, so you do not configure Twilio, Fast2SMS, or Supabase OTP functions in this app
- This is the reason the app no longer needs your own SMS provider integration in code

## 4. Add Authorized Domains

In Firebase Authentication settings, make sure these are allowed:

- `localhost`
- your production domain later
- your Render domain later, if using Render

## 5. Create Firestore Database

1. In Firebase console go to `Firestore Database`
2. Click `Create database`
3. Choose `Production mode` or `Test mode`

Recommended:

- Use `Production mode`
- Keep client Firestore access locked down if you only want the backend to write data

This app’s backend writes and reads Firestore using Firebase Admin.

## 6. Create a Service Account for the Backend

1. In Firebase console open project settings
2. Go to `Service accounts`
3. Click `Generate new private key`
4. Download the JSON file

From that JSON you will use:

- `project_id`
- `client_email`
- `private_key`

These are used by the Express backend in `.env`.

## 7. Razorpay Setup

1. Go to `https://razorpay.com`
2. Create an account
3. Use Test Mode first
4. Generate:
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
5. Optionally create a webhook secret for `payment.captured`

## Environment Variables

Copy the template:

```powershell
Copy-Item .env.example .env
```

Then fill every value.

Example:

```env
# Firebase Admin (backend)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your-razorpay-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret

# App
PORT=10000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Next.js Web App (preferred frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef123456

# API
NEXT_PUBLIC_API_BASE_URL=http://localhost:10000
```

## Firestore Collections Used by This App

The backend uses these collections:

- `profiles`
- `products`
- `serviceable_pincodes`
- `orders`

Document structure overview:

- `profiles/{uid}`
  Stores `phone`, `full_name`, `delivery_address`, `pincode`
- `products/{productId}`
  Stores mango catalog and prices
- `serviceable_pincodes/{pincode}`
  Stores active delivery pincodes
- `orders/{orderId}`
  Stores order header and inline `order_items`

## Seed Firestore with Products and Pincodes

Seed data lives in:

- [seedData.js](D:/mangomagic/server/db/seedData.js)

Run this command after `.env` is ready:

```powershell
npm run seed --prefix server
```

This will create:

- sample mango products
- sample serviceable pincodes

You can edit the data in [seedData.js](D:/mangomagic/server/db/seedData.js) before seeding.

## Install Dependencies

Run from the project root:

```powershell
npm install
npm install --prefix client
npm install --prefix server
```

## Run the App Locally

Development mode:

```powershell
npm run dev
```

This starts:

- frontend at `http://localhost:3000`
- backend at `http://localhost:10000`

If you want them separately:

Frontend:

```powershell
npm run dev --prefix mangomagic-next
```

Backend:

```powershell
npm run dev --prefix server
```

## Production-style Local Run

Build the frontend:

```powershell
npm run build --prefix mangomagic-next
```

Start the API and Next frontend:

```powershell
npm run start
```

## Docker Run

Build:

```powershell
docker build -t mangobulk .
```

Run:

```powershell
docker run --env-file .env -p 10000:10000 mangobulk
```

Open:

- `http://localhost:10000`

## Phone OTP Flow

1. User enters mobile number
2. Firebase Phone Auth sends OTP
3. User enters OTP
4. Firebase verifies OTP
5. Firebase signs the user in automatically
6. Frontend sends Firebase ID token to the backend
7. Backend verifies the token with Firebase Admin
8. Backend loads or creates the user profile in Firestore

## Why This Avoids Your Previous SMS Provider Problem

Your old setup depended on custom SMS providers and custom OTP storage.

This Firebase version removes that.

What this means in practice:

- no Supabase Phone Auth
- no Twilio integration
- no Fast2SMS integration
- no custom OTP table
- no custom OTP verification edge functions

For India specifically:

- this app no longer requires you to manage an external SMS gateway integration inside your codebase
- this usually avoids the DLT/provider configuration burden you were trying to escape

Important note:

- compliance and telecom rules can change, so you should still verify your business/legal requirements before production launch

## Testing on Firebase Free Tier

For testing, use Firebase fictional phone numbers from the Firebase console.

This is the recommended low-cost testing path.

Setup:

1. Open Firebase console
2. Go to `Authentication`
3. Open the `Phone` provider settings
4. Add test phone numbers and OTP codes

Then test with those numbers in the app.

This lets you test:

- send OTP flow
- verify OTP flow
- automatic sign-in flow
- backend token verification flow

without paying for production SMS traffic.

## Important Reality for Real SMS

This README guarantees a Firebase-based implementation and a free-tier-friendly testing flow with fictional test numbers.

For real SMS delivery to real phones, Firebase quotas, pricing, and billing requirements can vary.

So:

- testing with Firebase test numbers works on the free tier
- production real-number SMS may require Firebase billing depending on current Firebase policy and quota

## Backend Authentication

The backend verifies Firebase ID tokens in:

- [verifyToken.js](D:/mangomagic/server/middleware/verifyToken.js)

It uses Firebase Admin SDK configured in:

- [firebaseAdmin.js](D:/mangomagic/server/db/firebaseAdmin.js)

## Main Auth Files

Frontend:

- [firebase.js](D:/mangomagic/client/src/lib/firebase.js)
- [AuthContext.jsx](D:/mangomagic/client/src/context/AuthContext.jsx)
- [LoginPage.jsx](D:/mangomagic/client/src/pages/LoginPage.jsx)
- [OtpPage.jsx](D:/mangomagic/client/src/pages/OtpPage.jsx)

Backend:

- [verifyToken.js](D:/mangomagic/server/middleware/verifyToken.js)
- [auth.js](D:/mangomagic/server/routes/auth.js)
- [firebaseAdmin.js](D:/mangomagic/server/db/firebaseAdmin.js)

## End-to-End Local Test

After setup:

1. Fill `.env`
2. Install dependencies
3. Seed Firestore with `npm run seed --prefix server`
4. Start the app with `npm run dev`
5. Open `http://localhost:3000`
6. Use a Firebase test phone number
7. Enter its matching test OTP
8. Confirm pincode
9. Add products to cart
10. Save address
11. Pay with Razorpay test mode
12. Verify the order appears in Firestore

Razorpay test card:

- Card: `4111 1111 1111 1111`
- Expiry: any future date
- CVV: any 3 digits
- OTP: `1221`

## Deploy to Render

1. Push the repo to GitHub
2. Create a Render Web Service
3. Use the Dockerfile
4. Add all `.env` values in Render
5. Set production frontend URL values correctly

Important:

- `FRONTEND_URL` should be your deployed frontend domain
- `NEXT_PUBLIC_API_BASE_URL` should be your deployed backend base URL

## Quick Start

1. Create Firebase project
2. Add Firebase web app
3. Enable Phone auth
4. Create Firestore database
5. Create service account
6. Fill `.env`
7. Install dependencies
8. Run `npm run seed --prefix server`
9. Run `npm run dev`
10. Test with Firebase fictional phone numbers

## Troubleshooting

### OTP is not sent

Check:

- Phone sign-in is enabled in Firebase
- your domain is authorized in Firebase Auth
- reCAPTCHA is allowed to render
- you are using a valid Indian phone number or Firebase test number

### OTP verifies but profile does not load

Check:

- backend Firebase Admin credentials in `.env`
- `FIREBASE_PRIVATE_KEY` formatting
- backend is running on port `10000`

### Products or pincodes are empty

Run:

```powershell
npm run seed --prefix server
```

### Backend returns 401

Check:

- Firebase login completed successfully
- frontend is sending the Firebase ID token
- backend Firebase Admin project matches the frontend Firebase project

### Razorpay works but order is missing

Check:

- `RAZORPAY_KEY_SECRET`
- backend logs
- Firestore permissions or service account configuration

## Final Note

This repo is now structured for Firebase-first authentication and Firestore-backed app data.

If you want, I can do one more pass and add a `FIREBASE-LAUNCH-CHECKLIST.md` file with a shorter exact checklist just for console setup and launch.  
