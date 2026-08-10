import React from 'react'
import Hero from '../components/Hero'
import Navbar from '../components/Navbar'
import Security from '../components/Security'
import SuppFormats from '../components/SuppFormats'
import Tools from '../components/Tools'
import Trust from '../components/Trust'
import Whyus from '../components/Whyus'


function Home() {
  return (
    <div>
      <Hero />
      <Trust />
      <Tools />
      <Whyus />
      <SuppFormats />
      <Security />
    </div>
  )
}

export default Home