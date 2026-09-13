import React from 'react'
import Articles from '../components/Articles'
import Faqs from '../components/Faqs'
import Features from '../components/Features'
import FreeVsPro from '../components/FreeVsPro'
import Hero from '../components/Hero'
import JoinConvertly from '../components/JoinConvertly'
import Navbar from '../components/Navbar'
import Poster from '../components/Poster'
import Pricing from '../components/Pricing'
import Reviews from '../components/Reviews'
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
      <Features />
      <Articles />
      <Poster />
      <Reviews />
      <Pricing />
      <FreeVsPro />
      <Faqs />
      <JoinConvertly />
    </div>
  )
}

export default Home