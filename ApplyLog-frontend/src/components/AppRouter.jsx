import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';

import Home from '../pages/Home';
import Applications from '../pages/Applications';
import Stats from '../pages/Stats';
import Timeline from '../pages/Timeline';
import ApplicationDetails from '../pages/ApplicationDetails';
import ApplicationForm from '../pages/ApplicationForm';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/applications/new" element={<ApplicationForm />} />
            <Route path="/applications/:id" element={<ApplicationDetails />} />
            <Route path="/applications/:id/edit" element={<ApplicationForm isEdit={true} />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/timeline" element={<Timeline />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
