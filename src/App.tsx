// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';

import Profile from './components/Profile';
import Admin from './components/Admin';
import CreateResume from './components/CreateResume';
import AboutUs from './components/AboutUs';
import UserProfile from './components/UserProfile';
import LogsProfile from './components/LogsPage';
import DeleteInPackage from './components/DeleteInPackage';


const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<Login />} /> 
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/resume/:email" element={<Profile />} />
        <Route path="/create-resume" element={<CreateResume />} />
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path="/logi" element={<LogsProfile />} />
        <Route path="/package" element={<DeleteInPackage />} />
        
      </Routes>
    </Router>
  );
};

export default App;
