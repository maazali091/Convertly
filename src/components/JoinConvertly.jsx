import { ArrowRight, Upload } from 'lucide-react'
import React from 'react'

function JoinConvertly() {
  return (
    <div className='px-5 lg:px-15 py-25 bg-violet-600 grid grid-cols-1 md:grid-cols-5 lg:grid-cols-3  xl:grid-cols-5 justify-center items-center gap-10 text-center flex-col'>
      <div className='text-center md:text-left  md:col-span-3 lg:col-span-2 xl:col-span-3 xl:max-w-150'>
        <h2 className='text-[45px]/15 md:text-[55px]/15 xl:text-[65px]/20 text-white mb-3 font-bold'>Ready to convert?</h2>
        <span className='font-medium text-[20px] xl:text-[23px]/10 text-blue-100'>Join thousands of users converting files with Convertly every day. Start free, no credit card needed.</span>
      </div>
      <a href='#tools' className='flex gap-3 py-5 bg-white font-bold mt-5 md:col-span-2 rounded-2xl lg:col-span-1 text-lg xl:text-2xl xl:col-span-2 xl:mx-auto xl:px-10 items-center text-violet-600 w-full md:w-auto justify-center'>
        <Upload /> Start Converting Now <ArrowRight className='md:hidden' />
      </a>
    </div>
  )
}

export default JoinConvertly