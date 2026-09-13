import React from 'react'

function Articles() {
  return (
    <div className='pt-20 pb-10 xl:pb-30 px-5 md:px-10 xl:px-20 dark:bg-slate-900'>
        <div className='text-center px-5'>
            <h2 className='text-[45px]/15 xl:text-[55px]/15 mb-3 font-bold'>Latest Articles</h2>
            <span className='font-medium text-[20px] dark:text-gray-400 text-slate-600'>Tips, updates and best practices</span>
        </div>
        <div className='p-2 flex flex-col md:grid md:grid-cols-2  xl:grid-cols-3 gap-8 mt-10'>
            <div className='border-2 border-gray-200 font-medium rounded-lg py-6 px-7 dark:bg-slate-800 dark:border-slate-600 xl:px-9 xl:py-10  transition-all duration-300 hover:shadow-md hover:scale-101'>
                <span className='flex gap-2 items-baseline text-neutral-500'>
                    <b className='text-blue-600 uppercase font-bold text-md xl:text-lg'>Productivity</b>
                    <span className='text-sm xl:text-md dark:text-gray-300 text-gray-500'>Mar 15, 2026</span>
                </span>
                <h3 className='text-gray-900 text-2xl xl:text-[25px] xl:tracking-wide dark:text-white xl:py-4 font-bold py-2 md:py-3'>How to Batch Convert 1000 PDFs in Minutes</h3>
                <span className='font-normal text-gray-500 dark:text-gray-300'>5 min read</span>
            </div>
            
            <div className='border-2 border-gray-200 font-medium rounded-lg py-6 px-7 dark:bg-slate-800 dark:border-slate-600 xl:px-9 xl:py-10 transition-all duration-300 hover:shadow-md hover:scale-101'>
                <span className='flex gap-2 items-baseline text-neutral-500'>
                    <b className='text-blue-600 uppercase font-bold text-md xl:text-lg'>Security</b>
                    <span className='text-sm  xl:text-md dark:text-gray-300'>Mar 12, 2024</span>
                </span>
                <h3 className='text-gray-900 text-2xl xl:text-[25px] xl:tracking-wide dark:text-white xl:py-4  font-bold py-2 md:py-3'>PDF Security: What you need to know</h3>
                <span className='font-normal xl:text-md dark:text-gray-300 text-gray-500'>7 min read</span>
            </div>

            <div className='border-2 border-gray-200 font-medium rounded-lg py-6 px-7 dark:bg-slate-800 dark:border-slate-600 xl:px-9 xl:py-10 transition-all duration-300 hover:shadow-md hover:scale-101'>
                <span className='flex gap-2 items-baseline text-neutral-500'>
                    <b className='text-blue-600 uppercase font-bold text-md xl:text-lg'>AI & Tech</b>
                    <span className='text-sm  xl:text-md dark:text-gray-300'>Mar 11, 2026</span>
                </span>
                <h3 className='text-gray-900 text-2xl xl:text-[25px] xl:tracking-wide dark:text-white xl:py-4  font-bold py-2 md:py-3'>The Future of File conversion Technology</h3>
                <span className='font-normal xl:text-md dark:text-gray-300 text-gray-500'>6 min read</span>
            </div>
        </div>
    </div>
  )
}

export default Articles