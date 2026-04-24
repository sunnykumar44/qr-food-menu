# QR Food Menu System (React + Firebase)

Complete web application for QR-based food menus with:

- Multi-shop admin panel
- Categories (Tiffins, Lunch, Dinner)
- Add/edit/delete menu items
- Price setup for selected items
- Shop details with multi-image upload
- Unique menu URL and QR code generation
- QR download and WhatsApp share
- Customer menu page (live updates)
- Multi-language support (English + Telugu)

## Tech Stack

- React + Vite
- Firebase Firestore
- ImgBB API (image hosting)
- Firebase Hosting
- qrcode.react

## Project Structure

```text
qr-food-menu/
  src/
    components/
      LanguageSwitcher.jsx
      MenuEditor.jsx
      QrActions.jsx
      ShopForm.jsx
      ShopList.jsx
    pages/
      AdminPage.jsx
      CustomerMenuPage.jsx
    App.jsx
    firebase.js
    i18n.jsx
    main.jsx
    styles.css
    utils.js
  .env.example
  firebase.json
  firestore.rules
  index.html
  package.json
  vite.config.js
```

## Step 1: Install Requirements

1. Install Node.js 18 or above.
2. Open terminal in this project folder.

```bash
npm install
```

## Step 2: Create Firebase Project

1. Open Firebase Console.
2. Click Create project.
3. Enable Firestore Database.
4. Add a Web App in Project Settings.
5. Copy Firebase config values.
6. Create an ImgBB account and generate an API key.

## Step 3: Configure Environment

1. Create a new file named .env in project root.
2. Copy values from .env.example and replace placeholders.

Example:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_IMGBB_API_KEY=your_imgbb_api_key
```

## Step 4: Run Locally

```bash
npm run dev
```

Open the URL shown in terminal.

## Step 5: Firebase Rules Setup

This project includes starter rules:

- firestore.rules

Deploy rules with Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
firebase init
```

When prompted in firebase init:

1. Select Firestore and Hosting.
2. Use existing project.
3. Firestore rules file: firestore.rules
4. Hosting public directory: dist
5. Configure as single-page app: Yes
6. Set up GitHub Action: No

## Step 6: Build and Deploy

### Option 1: Deploy to Vercel (Recommended)

1. Push your project to GitHub.
2. Go to [Vercel.com](https://vercel.com) and sign in with your GitHub account.
3. Click "Add New Project" and select your repository.
4. In Environment Variables section, add the following from your .env file:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_IMGBB_API_KEY`
5. Click Deploy. Vercel will automatically build and deploy your app.
6. After deployment, your app will be live at: `https://your-project-name.vercel.app`

**Features:**
- Admin panel: `/admin`
- Customer menu page: `/menu/:shopId`
- Print-ready QR poster with shop details
- Edit Details shortcut for quick tweaks before printing

### Option 2: Deploy to Firebase Hosting

```bash
npm run build
firebase deploy
```

After deploy, Firebase Hosting URL will work for:

- Admin panel: /admin
- Customer menu page: /menu/:shopId

## How It Works

## Admin Panel

- Create multiple shops
- Select any shop to edit
- Enter shop details and upload multiple images
- Edit menu by category
- Enable or disable any item using checkbox
- Add new item dynamically
- Delete unwanted items
- Enter price for each item

## QR and Sharing

- For selected shop, unique URL is generated: `/menu/{shopId}`
- QR is generated automatically
- Download QR as PNG image or full print-ready poster
- Share menu URL via WhatsApp button
- Edit Details shortcut to jump back to shop info section

## Customer View

- Scanning QR opens shop menu page
- Shows shop name, images, description
- Menu grouped by Tiffins, Lunch, Dinner
- Shows item prices
- Updates live when admin edits

## Language Support

- Switch language using dropdown
- Included languages:
  - English
  - Telugu

## Important Note

This starter keeps rules open for quick setup and demo use.
For production, add Firebase Authentication and secure Firestore rules by user role.
