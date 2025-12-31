
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Assessments from './pages/Assessments';
import Projects from './pages/Projects';
import Analytics from './pages/Analytics';
import AccessManagement from './pages/AccessManagement';
import GradingHub from './pages/GradingHub';
import SystemLogs from './pages/SystemLogs';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import { User } from './types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  // Simple mock session check
  useEffect(() => {
    const storedUser = localStorage.getItem('edu_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('edu_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('edu_user');
  };

  return (
    <HashRouter>
      <div className="min-h-screen flex bg-slate-50">
        {isAuthenticated && <Sidebar user={user} onLogout={handleLogout} />}
        
        <div className={`flex-1 flex flex-col ${isAuthenticated ? 'md:ml-64' : ''}`}>
          {isAuthenticated && <Navbar user={user} />}
          
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route 
                path="/login" 
                element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} 
              />
              <Route 
                path="/register" 
                element={!isAuthenticated ? <Register onRegister={handleLogin} /> : <Navigate to="/" />} 
              />
              <Route 
                path="/" 
                element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/courses" 
                element={isAuthenticated ? <Courses /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/assessments" 
                element={isAuthenticated ? <Assessments /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/projects" 
                element={isAuthenticated ? <Projects /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/analytics" 
                element={isAuthenticated ? <Analytics /> : <Navigate to="/login" />} 
              />
              
              {/* Trainer Only Route */}
              <Route 
                path="/grading" 
                element={isAuthenticated && user?.role === 'trainer' ? <GradingHub /> : <Navigate to="/" />} 
              />

              {/* Admin Only Routes */}
              <Route 
                path="/users" 
                element={isAuthenticated && user?.role === 'admin' ? <AccessManagement /> : <Navigate to="/" />} 
              />
              <Route 
                path="/logs" 
                element={isAuthenticated && user?.role === 'admin' ? <SystemLogs /> : <Navigate to="/" />} 
              />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
