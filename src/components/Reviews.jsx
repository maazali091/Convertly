import { Star, StarHalf } from 'lucide-react'
import React from 'react'

function Reviews() {
  return (
    <div className='pt-20 pb-10 mt-10 px-5 md:px-10 lg:px-15 dark:text-slate-900'>
        <div className='text-center px-5'>
            <h2 className='text-[45px]/15 mb-3 font-bold dark:text-white'>Loved by Teams</h2>
            <span className='font-medium text-[20px] text-slate-600 dark:text-gray-400'>Join thousands of satisfied customers</span>
        </div>
        <div className='mt-10 grid grid-cols-1  md:grid-cols-2 xl:grid-cols-3 gap-10 '>
            <div className='border rounded-lg hover:scale-105 lg:hover:scale-103 dark:border-slate-500 dark:bg-slate-800 xl:px-8 xl:py-9 hover:shadow-lg transition-all duration-200 px-6 py-7 flex flex-col gap-6'>
                <span className='flex gap-1 text-yellow-400'><Star /> <Star /> <Star /> <Star /> <Star /></span>
                <p className='text-[17px] xl:text-2xl dark:text-gray-400 xl:py-2 text-gray-600 font-medium'>"Convertly saved our team hours every week. Unmatched speed and reliability."</p>
                <hr className='bg-gray-900 my-2 dark:bg-gray-100 xl:my-5' />
                <div className='flex gap-5 items-center'>
                    <span className='w-13 h-13 flex font-bold text-xl text-white justify-center items-center rounded-full bg-violet-600'>SC</span>
                    <div>
                        <h3 className='font-bold text-lg dark:text-white'>Sarah Chen</h3>
                        <span className='text-md font-medium text-gray-500 dark:text-gray-400'>Product Manager at Acme Inc</span>
                    </div>
                </div>
            </div>

            <div className='border rounded-lg hover:scale-105 lg:hover:scale-103 dark:border-slate-500 dark:bg-slate-800 xl:px-8 xl:py-9 hover:shadow-lg transition-all duration-200  px-6 py-7 flex flex-col gap-6'>
                <span className='flex gap-1 text-yellow-400'><Star /> <Star /> <Star /> <Star /> <StarHalf /></span>
                <p className='text-[17px] xl:text-2xl xl:py-2 dark:text-gray-400 text-gray-600 font-medium'>"The cleanest interface I've seen. Zero learning curve, instantly productive."</p>
                <hr className='bg-gray-900 my-2 dark:bg-gray-100 xl:my-5' />
                <div className='flex gap-5 items-center'>
                    <span className='w-13 h-13 flex font-bold text-xl text-white justify-center items-center rounded-full bg-violet-600'>JM</span>
                    <div>
                        <h3 className='font-bold text-lg dark:text-white'>James Mitchell</h3>
                        <span className='text-md font-medium text-gray-500 dark:text-gray-400'>Freelance Designer at Independent</span>
                    </div>
                </div>
            </div>

            <div className='border rounded-lg hover:scale-105 lg:hover:scale-103 dark:border-slate-500 dark:bg-slate-800 xl:px-8 xl:py-9 hover:shadow-lg transition-all duration-200  px-6 py-7 flex flex-col gap-6'>
                <span className='flex gap-1 text-yellow-400'><Star /> <Star /> <Star /> <Star /> <Star /></span>
                <p className='text-[17px] xl:text-2xl xl:py-2 dark:text-gray-400 text-gray-600 font-medium'>"Batch processing is a game-changer. We process hundreds of files daily now."</p>
                <hr className='bg-gray-900 my-2 dark:bg-gray-100 xl:my-5' />
                <div className='flex gap-5 items-center'>
                    <span className='w-13 h-13 flex font-bold text-xl text-white justify-center items-center rounded-full bg-violet-600'>LR</span>
                    <div>
                        <h3 className='font-bold text-lg dark:text-white'>Lisa Rodriguez</h3>
                        <span className='text-md font-medium text-gray-500 dark:text-gray-400'>Operations Director at Global Tech</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Reviews