import React from 'react'
import { useState } from 'react'
import { Routes, Route } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import CompressPdf from './pages/CompressPdf';
import ExcelToPdf from './pages/ExcelToPdf';
import Home from './pages/Home'
import JpgToPdf from './pages/JpgToPdf';
import MergePdf from './pages/MergePdf';
import PdfToExcel from './pages/PdfToExcel';
import PdfToJpg from './pages/PdfToJpg';
import PdfToWord from './pages/PdfToWord';
import RotatePdf from './pages/RotatePdf';
import SplitPdf from './pages/SplitPdf';
import WordToPdf from './pages/WordToPdf';
import { supabase } from './lib/supabase'
import { useEffect } from 'react';
import Signup from './pages/SignUp';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoutes from './components/ProtectedRoutes';
import PricingPage from './pages/PricingPage';

function App() {
  const [isDark, setIsDark] = useState(false);

  const [user, setUser] = useState(null);

  // Prevent UI flicker while checking session
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // -----------------------------------------
    // Get current logged-in session
    // -----------------------------------------
    const getCurrentSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Session error:", error);
      }

      if (!mounted) return;

      setUser(session?.user ?? null);
      setAuthLoading(false);
    };

    getCurrentSession();

    // -----------------------------------------
    // Listen for auth changes
    // -----------------------------------------
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // -----------------------------------------
  // Logout
  // -----------------------------------------
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return;
    }

    setUser(null);
  };

  return (
    <>
      <Navbar isDark={isDark} setIsDark={setIsDark} user={user} onLogout={handleLogout} authLoading={authLoading} />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/jpg-to-pdf' element={<JpgToPdf />} />
        <Route path='/pdf-to-jpg' element={<PdfToJpg />} />
        <Route path='/word-to-pdf' element={<WordToPdf />} />
        <Route path='/pdf-to-word' element={<PdfToWord />} />
        <Route path='/merge-pdf' element={<MergePdf />} />
        <Route path='/split-pdf' element={<SplitPdf />} />
        <Route path='/compress-pdf' element={<CompressPdf />} />
        <Route path='/excel-to-pdf' element={<ExcelToPdf />} />
        <Route path='/pdf-to-excel' element={<PdfToExcel />} />
        <Route path='/rotate-pdf' element={<RotatePdf />} />
        <Route path='/sign-up' element={<Signup />} />
        <Route path='/log-in' element={<Login />} />
        <Route path='/dashboard' element={
          <ProtectedRoutes user={user} loading={authLoading}>
            <Dashboard />
          </ProtectedRoutes>
        } />
        <Route path='/pricing' element={<PricingPage />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App