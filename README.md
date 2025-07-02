#PATOOWORLD OMNI o1 - Your AI-Powered Assistant

Welcome to OMNI, a modern, full-stack web application that showcases the power of generative AI. This application serves as a versatile chat interface powered by Google's Gemini models through Genkit, featuring real-time conversation, image analysis, image generation, and a suite of tools to enhance user interaction.

<img src="https://placehold.co/800x450.png" alt="OMNI Screenshot" data-ai-hint="app screenshot">

*A placeholder for the application's screenshot.*

## ✨ Core Features

- **AI-Powered Chat**: Engage in contextual conversations with an AI assistant powered by Gemini.
- **Image Analysis**: Upload or capture an image and ask questions about its content.
- **Image Generation**: Create unique images from text prompts using the `/imagine` command.
- **Interactive AI Tools**:
    - **Rephrase**: Adjust the AI's tone to be simpler or more formal.
    - **Translate**: Instantly translate responses to other languages (e.g., Spanish).
    - **Expand**: Elaborate on ideas and get more detailed explanations.
    - **Improve Prompt**: Get suggestions on how to refine your prompts for better AI responses.
- **User Authentication**: Secure sign-up and login functionality using Firebase Authentication.
- **Persistent Chat History**: Your conversations are saved locally, allowing you to resume them at any time. Manage your chats with options to rename or delete sessions.
- **Profile & Settings Management**: A dedicated page to manage your user profile and application preferences, including theme selection (light/dark/system).
- **Responsive Design**: A clean, modern UI built with Tailwind CSS and ShadCN UI that looks great on both desktop and mobile devices.

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **UI**: [React](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Component Library**: [ShadCN UI](https://ui.shadcn.com/)
- **AI Integration**: [Genkit](https://firebase.google.com/docs/genkit) with [Google's Gemini Models](https://ai.google.dev/)
- **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🏁 Getting Started

To get this project running on your local machine, follow these steps.

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### 1. Set Up Environment Variables

You need to configure your Firebase and Gemini API keys.

1.  Create a new file named `.env` in the root of the project.
2.  Add your Firebase project configuration and your Gemini API key to the `.env` file. You can get your Firebase config from the Firebase console (`Project settings > General > Your apps > Web app`). You can get a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

```.env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key
```

### 2. Install Dependencies

Install the project dependencies using npm:

```bash
npm install
```

### 3. Run the Development Server

Start the Next.js development server:

```bash
npm run dev
```

The application should now be running at [http://localhost:3000](http://localhost:3000).

## 🔧 Available Scripts

- `npm run dev`: Starts the application in development mode.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts a production server.
- `npm run lint`: Lints the code for errors and style issues.

---

This project was built in Firebase Studio.
