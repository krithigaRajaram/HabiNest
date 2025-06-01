import './App.css'
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard'; 
import Login from './pages/Login';
import Logout from './components/Logout'
import ProtectedRoutes from './utils/ProtectedRoutes' 
function App() {
  return (
    <Router>
      <Routes>
       <Route path="/register" element={<RegisterPage />} /> 
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoutes />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/logout" element={<Logout />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
