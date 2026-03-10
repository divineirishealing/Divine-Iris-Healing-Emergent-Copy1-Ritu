import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import ProgramDetailPage from './pages/ProgramDetailPage';
import SessionDetailPage from './pages/SessionDetailPage';
import AllProgramsPage from './pages/AllProgramsPage';
import AllSessionsPage from './pages/AllSessionsPage';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/programs" element={<AllProgramsPage />} />
          <Route path="/program/:id" element={<ProgramDetailPage />} />
          <Route path="/sessions" element={<AllSessionsPage />} />
          <Route path="/session/:id" element={<SessionDetailPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
