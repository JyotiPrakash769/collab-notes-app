# 📔 Colab Note – Real-time Collaborative Workspace

**Colab Note** is a premium, high-performance collaborative note-taking application designed for focus and seamless teamwork. Built with a modern tech stack, it features a cinematic user experience, real-time synchronization, and a beautiful dark-mode interface.

🚀 **[View Live Demo](https://collab-notes-app-eta.vercel.app)**

---

## ✨ Features

- **🎬 Cinematic Experience**: Immersive Home Screen with scroll-triggered animations and responsive typography.
- **👥 Real-time Collaboration**: Shared editing sessions with zero-latency feeling using database-backed synchronization.
- **🟢 Live Presence**: Visual indicators showing active collaborators with pulsing "Live" status and user avatar groups.
- **🛡️ Secure Sessions**: Private collaboration via 4-digit access codes for invite-only access.
- **📚 Library Management**: Organize your workspace with a centralized library, featuring "Manage mode" with interactive note deletion.
- **📱 PWA Ready**: Install Colab Note as a native app on Desktop, Android, or iOS.
- **☁️ Cloud Database**: Persistence powered by Prisma and Neon (PostgreSQL) for global accessibility.
- **💅 Premium Design**: Built with Material UI and Framer Motion for glassmorphism effects and smooth transitions.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Database**: [PostgreSQL (Neon)](https://neon.tech/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Styling**: [Material UI (MUI)](https://mui.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Editor Core**: [Tiptap](https://tiptap.dev/)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 🚀 Local Setup

Follow these steps to run Colab Note on your machine:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_GITHUB_USERNAME/collab-notes-app.git
   cd collab-notes-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
   ```

4. **Initialize the Database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 PWA Support

Colab Note is a fully functional Progressive Web App.
- **Desktop**: Click the "Install" icon in the Chrome/Edge address bar.
- **Mobile**: Use "Add to Home Screen" from your browser menu.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🤝 Contributing

Contributions are welcome!
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

Designed with ❤️ for modern collaboration.
