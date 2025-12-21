# 🩸 Blood Donation App (Client)

Frontend for the Blood Donation App built with **React (Vite)** and deployed on **Firebase Hosting**.

## 🚀 Live Site
- https://blood-donation-app11189.web.app

## 🛠 Tech Stack
- React + Vite
- Tailwind CSS
- Fetch API
- Firebase Hosting

## ✨ Features
- User authentication UI (login/register)
- View public blood requests
- Protected pages (token-based access)
- Responsive UI

---

## ⚙️ Environment Variables

Create these files in the project root (same folder as `package.json`):

### `.env.development`
VITE_API_BASE_URL=http://localhost:5000
### `.env.production`
VITE_API_BASE_URL=https://blood-donation-server-rosy.vercel.app
###Deploy to Firebase Hosting
npm i -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy --only hosting
