# Al-Khidmat Blood Donor Matching System

A Next.js application that bridges the gap between those in urgent need of blood and eligible donors within Karachi, powered by an AI-integrated chat search, and a WhatsApp notification bridge.

## 🚀 Approach & Architecture

### 1. AI-Powered Needs Matching (Gemini)
Instead of relying strictly on traditional form drop-downs to describe complex or urgent situations, we implemented a natural language chat interface using the **Google Gemini API**.
- Users can type their requests naturally (e.g., *"As-salamu alaykum! Mujhay O- khoon chahiye"*). 
- The backend parses these requests using a prompt to extract the needed exactly: `bloodGroup` and confirms details via a conversational format.

### 2. Donor Data Parsing & Fetching
- Donor data is read from a CSV database (`Karachi_Eligible_Donors_Database.csv`), holding details like City, Area, Phone, Blood Group, and Last Donation Date.
- For optimal performance and ease, this parsed data is cached into a local JSON store so future searches are blazing fast without continuously parsing thousands of rows from the CSV.

### 3. Asynchronous WhatsApp Integration (Baileys Bridge)
Rather than using a costly third-party provider or unreliable APIs, we chose a direct WhatsApp Web client implementation using libraries built around Reverse-Engineering WhatsApp Web (`@whiskeysockets/baileys`).
- **Initiation:** The Next.js API automatically initializes a WhatsApp socket connection. For new connections, it logs a QR code to the terminal for linking.
- **Outgoing (`/api/notify`):** Extracts matched donors and blasts asynchronous WhatsApp Template/Text messages directly requesting a "YES" or "NO" response using their phone number converted to a `.whatsapp.net` JID.
- **Incoming Webhook (Sockets):** Since it runs a continuous WebSocket to WhatsApp, incoming messages are intercepted inside the app. Once a user replies `YES` or `NO`, the Baileys socket strips the content and automatically maps it to their pending 'Session ID'.

### 4. Live Dashboard Updates (Polling)
- We maintain temporary session states in memory or a lightweight `state.json`.
- The dashboard transitions seamlessly into a **Live Polling Phase** when notifications are blasted. It queries `/api/status` every 3 seconds.
- As `YES`/`NO` responses come back through the WhatsApp Socket integration, the data updates in the JSON store. The client immediately updates the UI with "Accepted" or "Declined" visual badges and recalculates stats (Total Accepted vs Refused).

### 5. ngrok Support for Local Dev
For users testing WhatsApp webhook deliveries and other integrations locally, we've updated `next.config.ts` to explicitly whitelist local proxy tunneled URL sources (`allowedDevOrigins`) so development HMR (Hot Module Reloading) features aren't severed by protective NextJS security protocols.

## 🎯 Getting Started

Ensure you have `.env.local` populated with your required keys:
```env
GEMINI_API_KEY=YOUR_GEMINI_KEY
```

Install packages and run:

```bash
npm install
npm run dev
```

Watch the terminal for your **WhatsApp QR Code**, open WhatsApp on your phone -> **Linked Devices** -> **Link a Device**. Once verified, the dashboard will seamlessly communicate with the world!
