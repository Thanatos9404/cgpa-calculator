# CGPA Calculator 📊

A modern, feature-rich CGPA (Cumulative Grade Point Average) calculator built with **Next.js 14** and **FastAPI**. Track your academic performance, analyze trends, compare with peers, and manage your grades with a beautiful, responsive interface.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=flat-square&logo=fastapi)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Python](https://img.shields.io/badge/Python-3.10+-yellow?style=flat-square&logo=python)

## ✨ Features

### Core Features
- 📚 **Semester Management** - Add, edit, and organize semesters with courses
- 📝 **Course Tracking** - Track course names, credits, and grades
- 🧮 **Automatic CGPA Calculation** - Real-time CGPA and SGPA computation
- 💾 **Data Persistence** - Auto-saves to localStorage (works offline)

### Advanced Features
- 🔐 **Authentication** - Email/password signup & Google OAuth
- 📊 **Analytics Dashboard** - Charts, trends, and performance insights
- 👥 **Peer Comparison** - Compare your CGPA with friends
- 🎯 **Target Calculator** - Calculate required grades to achieve target CGPA
- 🌓 **Dark/Light Mode** - Beautiful themes with smooth transitions
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.10+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Thanatos9404/cgpa-calculator.git
   cd cgpa-calculator
   ```

2. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local  # Add your Firebase config for Google OAuth
   npm run dev
   ```

3. **Setup Backend** (optional - for advanced features)
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

4. **Open in browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Auth**: Firebase (Google OAuth)
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.10+
- **Database**: SQLite with SQLAlchemy
- **Auth**: JWT + bcrypt
- **PDF Generation**: WeasyPrint

## 📁 Project Structure

```
cgpa-calculator/
├── frontend/               # Next.js frontend
│   ├── app/               # App router pages
│   ├── components/        # React components
│   ├── lib/               # Utilities & hooks
│   └── public/            # Static assets
├── backend/               # FastAPI backend
│   ├── app/
│   │   ├── auth/         # Authentication
│   │   ├── database/     # SQLAlchemy models
│   │   └── routes/       # API endpoints
│   └── requirements.txt
└── README.md
```

## � Environment Variables

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000

# Firebase (for Google OAuth)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
```

### Backend (`backend/.env`)
```env
SECRET_KEY=your-secret-key-min-32-chars
ALLOWED_ORIGINS=http://localhost:3000
```

## 📖 Usage

### Adding Semesters & Courses
1. Click **"Add Semester"** to create a new semester
2. Add courses with name, credits, and grade
3. CGPA updates automatically in real-time

### Authentication
- **Guest Mode**: Use without logging in (data saved locally)
- **Email Signup**: Create account for cloud sync
- **Google OAuth**: Quick sign-in with Google

### Peer Comparison
1. Navigate to **Compare** section
2. Add peers with their CGPA
3. View rankings and charts

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍� Author

**Thanatos9404**  
GitHub: [@Thanatos9404](https://github.com/Thanatos9404)

---

⭐ **Star this repo** if you find it helpful!
