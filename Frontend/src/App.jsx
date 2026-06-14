import { useState } from 'react'
import { BrowserRouter } from "react-router-dom";
import './index.css'
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage.jsx'
import Login from './pages/auth/Login.jsx';
import RegisterPage from './pages/auth/Register.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import Chatbot from './components/Chatbot/Chatbot.jsx';
import { InterviewContext, InterviewProvider } from './features/Resume/Interview.context.jsx';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <InterviewProvider>
        <AppRoutes />
        <Chatbot />
        </InterviewProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App
