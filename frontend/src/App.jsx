import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import Home from './pages/Home';
import About from './pages/About';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Routes>
      {/* Routes with Main Navbar and Sidebar */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* Auth Routes (no sidebar/navbar) */}
      <Route element={<AuthLayout />}>
        {/* Placeholder for login/register routes */}
        {/* <Route path="/login" element={<Login />} /> */}
      </Route>
      
      {/* Catch all */}
      <Route path="*" element={<div className="p-10 text-center">404 - Not Found</div>} />
    </Routes>
  );
}

export default App;
