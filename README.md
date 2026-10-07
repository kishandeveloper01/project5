# Healthyfy AI — corrected runnable build

Healthyfy AI is a React + Express health-management demo with Gemini-powered report analysis, AI chat, nutrition planning, family records, doctor discovery/booking, fitness demo data, notifications, and account settings.

## Requirements
- Node.js 20+ (22 LTS recommended)
- npm 10+
- A Gemini API key for AI features

## Run locally

1. Extract the ZIP.
2. Open a terminal in the project folder.
3. Install dependencies:

   `npm install`

4. If the supplied ZIP already contains `.env`, **do not overwrite it**. The existing `.env` values are preserved in this build.
5. If you are setting up from scratch, use `.env.example` and fill in your own secrets.
6. Start:

   `npm run dev`

7. Open `http://localhost:3000`.

The server runs the Vite development middleware and Express API together.

## Production build

`npm install`

`npm run build`

Set:

- `NODE_ENV=production`
- `JWT_SECRET=<long-random-secret>`
- `GEMINI_API_KEY=<your-key>`
- `PORT=3000`

Then run:

`npm start`

Open `http://localhost:3000`.

## Demo account

- Email: `kartik@healthyfy.ai`
- Password: `healthyfy123`

Create a new account if you prefer. Authentication is required for protected APIs; the server no longer silently logs unauthenticated requests in as the demo user.

## Important corrected behavior

- Family members, reports, AI context, notifications, and appointments are scoped to the authenticated user.
- Invalid/expired JWTs return 401.
- PDF and image reports are sent to Gemini as binary inline data instead of being incorrectly read as text.
- AI failure no longer invents medical lab values.
- Gemini 503/429/5xx transient failures use bounded exponential-backoff retries and fallback Flash models before reporting an outage.
- Report uploads support images and PDFs (including PDFs whose browser MIME type is blank but whose filename ends in `.pdf`).
- Signing out clears user-specific frontend state so another account cannot briefly see the previous account's family/health data.
- Doctor booking uses a server endpoint and rejects conflicting slots.
- Profile and notification preferences are saved through the API.
- Fitness data remains explicitly demo/simulated data.
- The Gemini API key stays server-side; it is never placed in the React bundle.

## Medical disclaimer

Healthyfy AI is a software demo and educational health-information tool. AI output is not a diagnosis and must not replace a qualified clinician. Do not use the demo in an emergency; call local emergency services or seek urgent medical care.


## MongoDB setup

This version stores application data in MongoDB instead of keeping accounts and health records only in server memory.

1. Create a MongoDB Atlas cluster (or use a local MongoDB server).
2. Create a database user and allow your development IP in Atlas Network Access.
3. If `.env` is already present, keep it unchanged. Otherwise create it from `.env.example`.
4. Set:
   - `MONGODB_URI` to your MongoDB connection string.
   - `MONGODB_DB_NAME=healthyfy`
5. Run `npm install`.
6. Run `npm run dev`.

The first startup creates the `healthyfy.app_state` document with the existing Kartik demo account and demo data. Later registrations, family members, medical reports, notifications, appointments, and fitness sync settings are persisted to MongoDB.

### Authentication behavior

- Sign Up creates a new account only from the Sign Up form.
- Sign Up confirms the Healthyfy password before sending the registration request.
- The Healthyfy password is separate from a Gmail/Google password; Healthyfy never attempts to collect or verify a user's Google password.
- Sign In checks the stored bcrypt password hash.
- A wrong password is rejected with `Invalid email or password.` and cannot create an account.
- An existing email cannot be registered twice.
- Email addresses are normalized to lowercase.

