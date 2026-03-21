# Push Notifications — How It Works

A plain-English guide to the push notification system in Bookhushly. No prior knowledge required.

---

## What are push notifications?

Push notifications are the little pop-ups you see at the top of your screen (or in your notification centre) even when you're not actively using an app. On a website, these are called **Web Push Notifications**. They work in Chrome, Edge, Firefox, and Android browsers. Safari on iPhone requires iOS 16.4+ and the site must be added to the Home Screen as a PWA.

---

## The Big Picture

Here's the full flow from "user enables notifications" to "notification pops up on screen":

```
User clicks "Enable notifications"
        ↓
Browser asks for permission
        ↓
Browser registers a unique Push Subscription (endpoint + encryption keys)
        ↓
App sends subscription to our server → saved in database (push_subscriptions table)
        ↓
Something happens (booking confirmed, payment received, etc.)
        ↓
Server looks up the user's saved subscriptions
        ↓
Server sends an encrypted push message to the browser's push service (Google/Mozilla/Apple)
        ↓
Browser's push service delivers it to the user's device
        ↓
Service Worker wakes up, reads the message, shows the notification
        ↓
User clicks the notification → browser opens/focuses the app at the right page
```

---

## Key Concepts

### VAPID Keys
VAPID (Voluntary Application Server Identification) is a security standard. It's a pair of keys (public + private) that prove our server is who it claims to be when talking to browser push services. Think of it like a signature on a letter.

- The **public key** is safe to share — it goes into the browser during subscription
- The **private key** is secret — it lives only on the server in `.env.local`

### Push Subscription
When a user enables notifications, the browser generates a unique **subscription object** containing:
- `endpoint` — a unique URL at Google/Mozilla/Apple's servers for this specific browser on this device
- `p256dh` — an encryption key so only our server can decrypt messages sent to this endpoint
- `auth` — a secret shared between the browser and our server for authentication

This subscription is stored in our database so we can reach this device whenever we want.

### Service Worker
A Service Worker is a JavaScript file that runs in the background, separately from the webpage. It can receive push messages even when the user has the tab closed. Our service worker has two jobs:
1. **Receive the push** — wake up, read the message
2. **Show the notification** — display the OS-level notification pop-up

---

## File-by-File Breakdown

### 1. Environment Variables (`.env.local`)
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...   ← safe to expose to the browser
VAPID_PRIVATE_KEY=...              ← SECRET, server only
VAPID_SUBJECT=mailto:hello@bookhushly.com  ← identifies us to browser push services
```
Generate these once with: `npx web-push generate-vapid-keys`

---

### 2. Database Table (`supabase/migrations/20260320_push_subscriptions.sql`)

A single table stores every user's push subscription(s). A user can have multiple subscriptions (phone + laptop + tablet).

```
push_subscriptions
├── id          (unique row ID)
├── user_id     (links to the user in auth.users)
├── endpoint    (the browser push service URL — unique per device/browser)
├── p256dh      (encryption key)
├── auth        (auth secret)
└── created_at
```

**Row Level Security (RLS)** is enabled — users can only see and delete their own rows. The server uses an admin client to send to any user's subscriptions.

---

### 3. The UI Banner (`components/shared/customer/PushNotificationOptIn.jsx`)

This is the card that appears in the customer dashboard prompting users to enable notifications. It:
- Only shows if the browser supports push notifications
- Only shows if the user hasn't already granted permission
- Disappears permanently if dismissed (stores this in `localStorage`)
- Shows a "re-enable" prompt if the user previously opted out

---

### 4. The React Hook (`hooks/use-push-notifications.js`)

This hook is the brain of the client-side notification logic. When a user clicks "Enable notifications":

1. **Requests permission** from the browser (`Notification.requestPermission()`)
2. **Creates a subscription** — asks the browser's `PushManager` to subscribe using our VAPID public key
3. **Saves it to our server** — POSTs the subscription object to `/api/push/subscribe`
4. **Updates UI state** — marks as subscribed so the banner disappears

When a user unsubscribes:
1. Cancels the subscription in the browser
2. Sends DELETE to `/api/push/subscribe` to remove it from the database
3. Saves `bh_push_opted_out = true` in `localStorage` to remember their preference

---

### 5. The API Routes (`app/api/push/subscribe/route.js`)

Two endpoints:

**`POST /api/push/subscribe`**
- Receives the subscription object from the browser
- Validates the user is logged in
- Saves `endpoint`, `p256dh`, `auth` to the `push_subscriptions` table
- Uses `upsert` so re-subscribing on the same device doesn't create duplicates

**`DELETE /api/push/subscribe`**
- Receives the endpoint to remove
- Deletes that row from the database

---

### 6. The Service Worker (`public/push-sw.js` + `public/sw.js`)

`sw.js` is auto-generated by next-pwa (a Next.js PWA plugin). It handles caching for the app to work offline. It automatically imports `push-sw.js`.

`push-sw.js` is our custom file with two event listeners:

**`push` event** — fires when a push message arrives from the server:
```
Receives encrypted message → decodes JSON → calls showNotification()
```
The notification includes: title, body text, icon (logo.png), a tag (to prevent duplicates), and the URL to open when clicked.

**`notificationclick` event** — fires when the user taps/clicks the notification:
```
Closes the notification → tries to focus an existing browser tab →
if none found, opens a new tab at the URL from the notification
```

---

### 7. The Push Sender (`lib/push-service.js`)

This is a server-only utility. It's called whenever something happens that warrants a push notification.

```javascript
sendPushToUser(userId, {
  title: "Booking Confirmed",
  body: "Your booking at Sunrise Hotel has been confirmed.",
  url: "/dashboard/customer/bookings"
})
```

What it does internally:
1. Looks up all subscriptions for the given `userId` in the database
2. Encrypts and sends the payload to each subscription's endpoint using the `web-push` library
3. If any endpoint returns a `410 Gone` or `404` error (device unsubscribed), it cleans up that row from the database automatically

---

### 8. The Notification Manager (`lib/notification-manager.js` / `lib/notifications.js`)

This is where push notifications get triggered automatically. Every time a significant event happens in the app — a booking is confirmed, a payment succeeds, a listing is approved — a `notify()` call is made. Internally it:

1. Saves an **in-app notification** to the `notifications` table (shown in the notification bell inside the app)
2. Checks if this event type is "push-worthy" (23 types trigger pushes, e.g. booking events, payments, wallet changes)
3. Calls `sendPushToUser()` in the background (non-blocking, so it doesn't slow down the response)

Examples of what triggers a push:
- `notifyBookingConfirmed(userId, ...)` — customer books a listing
- `notifyPaymentSuccessful(userId, ...)` — payment goes through
- `notifyVendorNewBooking(vendorId, ...)` — vendor gets a new booking
- `notifyListingApproved(vendorId, ...)` — admin approves a vendor's listing

---

## How next-pwa Wires It Together (`next.config.js`)

```javascript
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",           // outputs sw.js to /public
  workboxOptions: {
    importScripts: ["/push-sw.js"],  // ← bundles our push handler into the SW
  },
});
```

The `importScripts` line is critical — it tells the generated service worker to also run our custom `push-sw.js` file. Without this, push events would arrive at the service worker and be silently ignored.

---

## Testing It

### Step 1 — Check env vars are set
Make sure `.env.local` has all three VAPID keys.

### Step 2 — Apply the database migration
Run in Supabase SQL editor: copy and run `supabase/migrations/20260320_push_subscriptions.sql`

### Step 3 — Subscribe
Log in as a customer → look for the "Stay in the loop" banner → click **Enable notifications** → accept the browser permission prompt.

Verify it worked:
```sql
-- Run in Supabase SQL editor
SELECT * FROM push_subscriptions WHERE user_id = 'YOUR_USER_UUID';
```
You should see a row with an `endpoint` URL.

### Step 4 — Send a test push
Use the temporary test route at `app/api/test-push/route.js`:
```
http://localhost:3000/api/test-push?userId=YOUR_USER_UUID
```
A notification should pop up on your device within seconds. **Delete this file when done** — it has no auth guard.

### Step 5 — Test end-to-end
Make a booking or trigger a payment in the app. The notification should fire automatically through the notification manager.

---

## Common Issues

| Problem | Likely Cause | Fix |
|---|---|---|
| Banner never appears | Browser doesn't support Web Push | Use Chrome, Edge, or Firefox |
| Permission prompt doesn't show | Already denied in browser settings | Go to browser → Site Settings → Notifications → Reset |
| Subscribed but no notification received | VAPID keys wrong or missing | Double-check all three env vars, restart dev server |
| Works locally, not on production | Push API requires HTTPS | Ensure your production domain uses HTTPS |
| `push_subscriptions` table missing | Migration not applied | Run the SQL migration in Supabase dashboard |
| iOS not working | Safari requires PWA install | User must add the site to Home Screen on iOS 16.4+ |

---

## Security Notes

- Push payloads are **end-to-end encrypted** between the server and the browser — no one (not even Google/Mozilla whose servers relay the message) can read the content
- The `VAPID_PRIVATE_KEY` must **never** be exposed to the browser or committed to git
- Row Level Security ensures users can only access their own subscriptions
- The server-side push sender uses the admin Supabase client (bypasses RLS) only to read subscriptions, never to write on behalf of users
