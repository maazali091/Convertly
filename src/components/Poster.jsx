import React from 'react'

function Poster() {
  return (
    <div className='px-15 py-25 bg-violet-600 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 justify-center items-center gap-10 text-center flex-col'>
        <div className='hover:scale-105 transition-all duration-200'>
            <h2 className='text-white text-5xl mb-2 font-bold'>500K+</h2>
            <span className='text-gray-100 font-medium text-lg'>Files Converted</span>
        </div>
        <div className='hover:scale-105 transition-all duration-200'>
            <h2 className='text-white text-5xl mb-2 font-bold'>99.9%</h2>
            <span className='text-gray-100 font-medium text-lg'>Success Rate</span>
        </div>
        <div className='hover:scale-105 transition-all duration-200'>
            <h2 className='text-white text-5xl mb-2 font-bold'>190+</h2>
            <span className='text-gray-100 font-medium text-lg'>Countries</span>
        </div>
        <div className='hover:scale-105 transition-all duration-200'>
            <h2 className='text-white text-5xl mb-2 font-bold'>24/7</h2>
            <span className='text-gray-100 font-medium text-lg'>Support</span>
        </div>
    </div>
  )
}

export default Poster