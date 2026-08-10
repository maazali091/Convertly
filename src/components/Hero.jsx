import React from 'react'
import { StarIcon, UploadIcon, ArrowRight, Shield, Eye } from 'lucide-react'

function Hero() {
  return (
    <div className='px-5 py-12 flex items-start flex-col gap-5'>
        <span className='flex p-2 text-sm border text-indigo-700 font-medium  rounded-full items-center gap-2 justify-start'>
            <StarIcon size={18} /> AI-Powered Conversion
        </span>
        <h1 className='text-6xl/17 font-bold'>Convert Files <span className='text-indigo-700'>in Seconds</span></h1>
        <p className='text-lg/7 text-slate-400 tracking-wide'>Lightning-fast file conversion with military-grade security. No ads, no limits, no signup required.</p>
        <div className='flex flex-wrap gap-3'>
            <span className='px-5 py-2 border border-slate-300 hover:shadow-md transition duration-200 cursor-pointer rounded-full'>PDF</span>
            <span className='px-5 py-2 border border-slate-300 hover:shadow-md transition duration-200 cursor-pointer rounded-full'>Word</span>
            <span className='px-5 py-2 border border-slate-300 hover:shadow-md transition duration-200 cursor-pointer rounded-full'>Excel</span>
            <span className='px-5 py-2 border border-slate-300 hover:shadow-md transition duration-200 cursor-pointer rounded-full'>PowerPoint</span>
            <span className='px-5 py-2 border border-slate-300 hover:shadow-md transition duration-200 cursor-pointer rounded-full'>JPG</span>
            <span className='px-5 py-2 border border-slate-300 hover:shadow-md transition duration-200 cursor-pointer rounded-full'>PNG</span>
        </div>
        <button className='flex gap-3  py-5 bg-indigo-700 font-medium mt-5 rounded-2xl text-xl items-center text-slate-100 w-full justify-center'>
            <UploadIcon /> Upload File Now <ArrowRight className='' />
        </button>    
        <button className='flex gap-3  py-5 border border-slate-500 font-medium mt-2 rounded-2xl text-xl items-center dark:text-slate-100 w-full justify-center'>
            Explore Tools 
        </button>    
        <div className='flex gap-5 text-sm font-medium dark:text-slate-300 text-slate-700 mt-2'>
            <span className='flex gap-2 items-center'><Shield className='text-emerald-700' /> Military-grade encryption</span>
            <span className='flex gap-2 items-center'><Eye className='text-emerald-700' /> Zero data loging</span>
        </div>
    </div>
  )
}

export default Hero