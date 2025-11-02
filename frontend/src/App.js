import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TeamManagement from "./pages/TeamManagement";
import Projects from "./pages/Projects";
import Calendar from "./pages/Calendar";
import LeaveManagement from "./pages/LeaveManagement";
import ContentStudio from "./pages/ContentStudio";
import AILab from "./pages/AILab";
import CloudPanel from "./pages/CloudPanel";
import ResearchHub from "./pages/ResearchHub";
import AcademyZone from "./pages/AcademyZone";
import PersonalPlanner from "./pages/PersonalPlanner";
import Finance from "./pages/Finance";
import Attendance from "./pages/Attendance";
import { Toaster } from "sonner";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="App">
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/" element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/team" element={user ? <TeamManagement user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/projects" element={user ? <Projects user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/calendar" element={user ? <Calendar user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/leave" element={user ? <LeaveManagement user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/content" element={user ? <ContentStudio user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/ai-lab" element={user ? <AILab user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/cloud" element={user ? <CloudPanel user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/research" element={user ? <ResearchHub user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/academy" element={user ? <AcademyZone user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/planner" element={user ? <PersonalPlanner user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/finance" element={user ? <Finance user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/attendance" element={user ? <Attendance user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
