# MiniBot 🤖

MiniBot is a smart, AI-powered chatbot that allows users to interact in a clean, intuitive chat interface. Integrated with Google Authentication and Gemini AI (via API), this bot handles login, chat messaging, and real-time AI response generation. It also saves user chats securely using Firebase Firestore.

---

## 🧠 Architecture

Here’s a visual breakdown of how the system works:

![image](https://github.com/user-attachments/assets/74585c22-c546-4874-bd21-bda6bcbe8596)

---

## 🚀 Features

- 🔐 Google Sign-In using Firebase
- 💬 Real-time AI interaction using Gemini AI
- 🗂 Chat history saved with Firestore
- 🧱 Modular backend with Auth and Chat services
- 💻 Clean and simple UI with chat input, display, and history

---

## 🛠 Tech Stack

- **Frontend**: HTML/CSS, JavaScript
- **Backend**: Node.js / Express
- **AI Integration**: Gemini AI
- **Database**: Firebase Firestore
- **Auth**: Google Auth via Firebase

---

## 📂 Project Structure

```bash
MiniBot-main/
│
├── backend/
│   ├── authService.js       # Handles Google Sign-In
│   ├── chatService.js       # Manages chat and AI integration
│
├── frontend/
│   ├── index.html           # Login Page
│   ├── chat.html            # Chat Interface
│   ├── style.css            # UI Styling
│   └── script.js            # Handles UI logic
│
├── firebase/
│   └── firebase.js          # Firebase config
│
├── assets/
│   └── architecture.jpg     # System architecture diagram
│
├── .gitignore
├── README.md
└── package.json
