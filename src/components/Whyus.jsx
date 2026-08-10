import React from 'react'
import { WhyusData } from '../assets/WhyusData'

function Whyus() {
  return (
    <div className='pt-20 pb-10 px-5'>
        <div className='text-center px-5'>
            <h2 className='text-[52px]/15 mb-3 font-bold'>Why Choose Convertly</h2>
            <span className='font-medium text-[20px] text-slate-600'>Built for speed, security and simplicity</span>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-10'>
            {WhyusData.map((i) => (
                <div key={i.id} className='border bg-white border-slate-300 hover:shadow-lg transition-all duration-200 group rounded-lg px-5 py-8 flex flex-col gap-5 cursor-pointer'>
                    <i.icon className='text-blue-500 w-15 p-3 h-15 bg-blue-100 rounded-lg ' size={40} />
                    <h3 className='font-bold text-gray-900 text-2xl'>{i.name}</h3>
                    <p className='text-lg text-slate-500 font-medium'>{i.desc}</p>
                </div>
            ))}
        </div>
        
    </div>
  )
}

export default Whyus