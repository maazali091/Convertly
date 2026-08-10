import React from 'react'
import { useState } from 'react'
import Navbar from './components/Navbar';
import Home from './pages/Home'

function App() {
  const [isDark, setIsDark] = useState(false);
  return (
    <>
      <Navbar isDark={isDark} setIsDark={setIsDark} />
      <Home/>
    </>
  )
}

export default App