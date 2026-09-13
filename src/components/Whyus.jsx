import React from 'react'
import { WhyusData } from '../assets/WhyusData'

function Whyus() {
  return (
    <div className='pt-20 pb-10 px-5 lg:px-15 bg:  xl:py-30 dark:bg-gray-900'>
        <div className='text-center px-5'>
            <h2 className='text-[52px]/15 xl:text-[62px]/15 mb-3 xl:mb-6 font-bold'>Why Choose Convertly</h2>
            <span className='font-medium text-[20px] xl:text-[23px] text-slate-600 dark:text-gray-400'>Built for speed, security and simplicity</span>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5 xl:gap-8 mt-10'>
            {WhyusData.map((i) => (
                <div key={i.id} className='border bg-white border-slate-300 hover:shadow-lg xl:gap-7 dark:bg-slate-800 dark:border-slate-600 transition-all duration-200 group rounded-lg px-5 xl:px-8 py-8 xl:py-10 flex flex-col gap-5 cursor-pointer'>
                    <i.icon className='text-blue-500 w-15 p-3 h-15 bg-blue-100 rounded-lg  dark:text-blue-600 dark:bg-slate-600 xl:size-18' size={40} />
                    <h3 className='font-bold text-gray-900 text-2xl dark:text-white xl:text-3xl'>{i.name}</h3>
                    <p className='text-lg text-slate-500 font-medium dark:text-gray-300 xl:text-xl'>{i.desc}</p>
                </div>
            ))}
        </div>
        
    </div>
  )
}

export default Whyus