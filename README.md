# MangoBulk

MangoBulk is a single-container mango ordering app with:

- Next.js App Router + Tailwind CSS
- Node.js + Express
- Firebase Authentication for phone OTP login
- Supabase for app data
- Razorpay for payments

The active frontend lives in `mangomagic-next/` and the backend lives in `server/`.
The production Docker setup runs both inside one container, with Express exposing a single public port and proxying frontend requests to the internal Next server.

The production image is built as a minimal runtime image:

- Express API server
- production-only server dependencies
- Next.js standalone output for the frontend
- a small supervisor process that keeps both internal services in sync

## What Changed

Authentication uses Firebase Phone Authentication.

- OTP is sent by Firebase Auth
- OTP verification signs the user in automatically
- The frontend sends Firebase ID tokens to the backend
- The backend verifies Firebase ID tokens with Firebase Admin
- User profiles, products, serviceable pincodes, and orders are stored in Supabase

## Prerequisites

Install these first:

1. Node.js 20+
2. npm
3. A Firebase project
4. A Supabase project
5. Firebase Authentication with Phone enabled
6. A Firebase service account for the backend
7. A Razorpay account with test keys

Optional:

1. Docker Desktop
2. An AWS EC2 instance for deployment

## Firebase Setup

Official docs used for this setup:

- Firebase Phone Auth for web: `https://firebase.google.com/docs/auth/web/phone-auth`
- Firebase test phone numbers: `https://firebase.google.com/docs/auth/web/test-phone-numbers`
- Firebase Admin SDK setup: `https://firebase.google.com/docs/admin/setup`
- Supabase project setup: `https://supabase.com/docs/guides/getting-started`

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
- your EC2-backed production domain later

## 5. Create Supabase Project

1. In Supabase create a project
2. Copy the project URL
3. Copy the service role key
4. Run the schema in `server/db/supabaseSchema.sql`

This app’s backend writes and reads order, profile, product, and pincode data through Supabase.

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

# Supabase
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your-razorpay-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret

# App
APP_DOMAIN=example.com
PORT=10000
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

## Supabase Tables Used by This App

The backend uses these tables:

- `profiles`
- `products`
- `serviceable_pincodes`
- `orders`

## Seed Products and Pincodes

Seed data lives in:

- [server/db/seedData.js](server/db/seedData.js)

Run this command after `.env` is ready:

```powershell
npm run seed --prefix server
```

This will create:

- sample mango products
- sample serviceable pincodes

You can edit the data in [server/db/seedData.js](server/db/seedData.js) before seeding.

## Install Dependencies

Run from the project root:

```powershell
npm install
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
docker build -t mangobulk ^
  --build-arg NEXT_PUBLIC_API_BASE_URL=http://localhost:10000 ^
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key ^
  --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain ^
  --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id ^
  --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket ^
  --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id ^
  --build-arg NEXT_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id ^
  .
```

Run:

```powershell
docker run --env-file .env -p 10000:10000 mangobulk
```

Open:

- `http://localhost:10000`

How this works now:

- Express listens on port `10000`
- Next runs internally on port `3000`
- Express proxies all non-`/api` requests to the internal Next server

This means you only need to publish port `10000` from the container.

Important:

- `NEXT_PUBLIC_*` values must be passed during `docker build`
- backend secrets such as `FIREBASE_*`, `SUPABASE_*`, and `RAZORPAY_*` stay in `--env-file` at `docker run` time
- if your local `.env` still contains `NODE_ENV=development`, the container startup now overrides it to `production`
- the container healthcheck now verifies both Express and the internal Next.js process

## Temporary EC2 IP Testing

If you do not have a domain yet and only need an EC2 public-IP deployment for testing, use the dedicated IP-test path instead of the Caddy/HTTPS stack.

Use these files:

- `docker-compose.aws.ip-test.yml`
- `deploy/aws-ec2-ip-test.md`

This path is designed for temporary testing only:

- the app container is published directly
- Caddy is not started
- the app runs over HTTP, not HTTPS
- the server allows a non-HTTPS `FRONTEND_URL` only for this explicit testing profile

Important limitations:

- this is not the final production deployment path
- Firebase Google sign-in may still reject the EC2 public IP as an unauthorized origin
- desktop popup auth is the best first check; mobile redirect auth is more fragile on temporary origins

## AWS EC2 Deployment

The recommended AWS path for this app is a single EC2 host running Docker Compose with Caddy in front of the app container.

Why this is the default recommendation here:

- it matches the app’s current architecture
- it keeps deployment simple enough to operate without ECS overhead
- it avoids exposing the app container directly to the internet
- it gives you automatic HTTPS with a small reverse proxy footprint

Use these files:

- `docker-compose.aws.yml`
- `deploy/Caddyfile`
- `deploy/aws-ec2.md`

If you are still testing on the raw EC2 public IP, use `docker-compose.aws.ip-test.yml` and `deploy/aws-ec2-ip-test.md` instead.

The full step-by-step runbook is in `deploy/aws-ec2.md`.

Production expectations:

- `APP_DOMAIN`, `FRONTEND_URL`, and `NEXT_PUBLIC_API_BASE_URL` should all use your real HTTPS domain
- Docker build args for `NEXT_PUBLIC_*` values are required and will fail fast if missing
- Razorpay API keys now fail fast at app startup instead of falling back to placeholders
- the app container runs as a non-root user with a read-only filesystem and no Linux capabilities
- restrict `22` to your IP only
- keep Docker and the OS updated
- do not store `.env` in git
- use a separate non-root SSH user on the instance

The app container is not published directly in that setup.

## Phone OTP Flow

1. User enters mobile number
2. Firebase Phone Auth sends OTP
3. User enters OTP
4. Firebase verifies OTP
5. Firebase signs the user in automatically
6. Frontend sends Firebase ID token to the backend
7. Backend verifies the token with Firebase Admin
8. Backend loads or creates the user profile in Supabase

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

- [server/middleware/verifyToken.js](server/middleware/verifyToken.js)

It uses Firebase Admin SDK configured in:

- [server/db/firebaseAdmin.js](server/db/firebaseAdmin.js)

## Main Auth Files

Frontend:

- [mangomagic-next/src/lib/firebase.js](mangomagic-next/src/lib/firebase.js)
- [mangomagic-next/src/context/AuthContext.jsx](mangomagic-next/src/context/AuthContext.jsx)
- [mangomagic-next/src/page-components/LoginPage.jsx](mangomagic-next/src/page-components/LoginPage.jsx)
- [mangomagic-next/src/page-components/OtpPage.jsx](mangomagic-next/src/page-components/OtpPage.jsx)

Backend:

- [server/middleware/verifyToken.js](server/middleware/verifyToken.js)
- [server/routes/auth.js](server/routes/auth.js)
- [server/db/firebaseAdmin.js](server/db/firebaseAdmin.js)

## End-to-End Local Test

After setup:

1. Fill `.env`
2. Install dependencies
3. Seed Supabase with `npm run seed --prefix server`
4. Start the app with `npm run dev`
5. Open `http://localhost:3000`
6. Use a Firebase test phone number
7. Enter its matching test OTP
8. Confirm pincode
9. Add products to cart
10. Save address
11. Pay with Razorpay test mode
12. Verify the order appears in Supabase

Razorpay test card:

- Card: `4111 1111 1111 1111`
- Expiry: any future date
- CVV: any 3 digits
- OTP: `1221`

## Quick Start

1. Create Firebase project
2. Add Firebase web app
3. Enable Phone auth
4. Create Supabase project and schema
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
- Supabase credentials and table schema

## Final Note

This repo is now structured for Firebase-first authentication, Supabase-backed app data, and single-port Docker deployment.

If you want, I can do one more pass and add a `FIREBASE-LAUNCH-CHECKLIST.md` file with a shorter exact checklist just for console setup and launch.  
