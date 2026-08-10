import { Menu, Moon, Sun, X } from 'lucide-react'
import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'

function Navbar({isDark, setIsDark}) {
  const [sidebar, setSidebar] = useState(false)
  useEffect(() => {
    if(isDark){
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark')
    }else{
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light')
    }
  }, [isDark]);
  return (
    <div className='w-full font-medium h-20 bg-slate-100 dark:bg-slate-700 flex justify-between px-5 lg:px-15 items-center'>
        <div >
          <span className='text-[26px] dark:text-slate-100 text-slate-700 font-bold tracking-wide'><span className='px-2 text-slate-100 dark:text-slate-700 text-[25px] py-0.5 mr-1 rounded-md bg-indigo-600'>C</span>onvertly</span>
        </div>
        <div className={`absolute top-20 left-0 px-5 pb-6 w-full dark:bg-slate-700  bg-slate-100 transition-all duration-300 ease-in-out md:relative md:top-0 md:left-0 md:p-0 md:w-2/3 md:flex md:justify-between md:items-center md:bg-transparent overflow-hidden ${sidebar ? "max-h-60 opacity-100 shadow-lg" : "max-h-0 opacity-0 md:max-h-full md:opacity-100"}`}>
        {/* <div className={`absolute top-20 right-0 px-5 w-full transition-all duration-200  md:relative bg-slate-700 md:bg-transparent md:w-2/3 md:flex justify-between items-center ${sidebar ? "h-auto" : "h-0 hidden"}`}> */}
          <ul className='flex border-t-1 border-slate-300 flex-col pt-5 mt-2 gap-4 text-slate-300 dark:text-slate-900 '>
            <li className='hover:text-slate-200 text-2xl'><a href="#">Tools</a></li>
            <li className='hover:text-slate-200 text-2xl'><a href="#">Pricing</a></li>
            <li className='hover:text-slate-200 text-2xl'><a href="#">Features</a></li>
            <li className='hover:text-slate-200 text-2xl'><a href="#">FAQ</a></li>
          </ul>
          <div className="flex flex-col mt-6 md:mt-0 md:flex-row items-start gap-3">
            <button className='hidden px-4 py-2 text-slate-100 dark:text-slate-900'>Sign in</button>
            <button className='hidden p-4 py-2 text-slate-100 bg-indigo-600 rounded-lg'>Get Started</button>
          </div>

        </div>
        
        <div className='flex items-center gap-3 z-10'>
            <button className='absolute  right-15 ml-5 text-slate-100 px-5 py-2 cursor-pointer bg-slate-400 rounded-full' onClick={() => setIsDark(!isDark)}>{isDark ?  <Sun /> : <Moon/>}</button>
            <div className='md:hidden text-slate-900 dark:text-slate-100 cursor-pointer z-11' onClick={() => setSidebar(!sidebar)}> {sidebar ? <X size={30} /> : <Menu size={30}/>} </div>
          </div>
    </div>
  )
}

export default Navbar