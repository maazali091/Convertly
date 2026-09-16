import React from 'react'
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <div className='bg-gray-50 pt-20 pb-5 px-10 dark:bg-slate-900'>
        <div className='grid grid-cols-2 xl:grid-cols-4 gap-10'>
            <div className='flex flex-col col-span-2 xl:col-span-4 gap-3'>
                {/* <span className='text-[26px] dark:text-slate-100 text-slate-700 font-bold tracking-wide'><span className='px-2 text-slate-100  text-[25px] py-0.5 mr-1 rounded-md bg-indigo-600'>C</span>onvertly</span> */}
                <span className='text-[26px] xl:text-[33px] dark:text-slate-100 text-slate-700 font-bold tracking-wide'><span className='px-2 xl:px-3 xl:py-2 text-slate-100  text-[25px] xl:text-[28px] py-0.5 mr-1 rounded-md bg-indigo-600'>C</span>onvertly</span>
                <span className='font-medium md:max-w-100 text-lg pr-10 text-gray-500 dark:text-gray-400 mt-2'>Fast, secure file conversion for everyone. No ads, no limits.</span>
            </div>
            <div className='flex flex-col gap-3'>
                <h2 className='font-bold text-xl'>Product</h2>
                <ul className='text-lg flex flex-col font-medium text-gray-500 dark:text-gray-400 gap-1.5'>
                    <li>Features</li>
                    <li>Pricing</li>
                    <li>Security</li>
                    <li>API</li>
                </ul>
            </div>
            <div className='flex flex-col gap-3'>
                <h2 className='font-bold text-xl'>Company</h2>
                <ul className='text-lg flex flex-col font-medium text-gray-500 dark:text-gray-400 gap-1.5'>
                    <li>About</li>
                    <li>Blog</li>
                    <li>Careers</li>
                    <li>Contact</li>
                </ul>
            </div>
            <div className='flex flex-col gap-3'>
                <h2 className='font-bold text-xl'>Resources</h2>
                <ul className='text-lg flex flex-col font-medium text-gray-500 dark:text-gray-400 gap-1.5'>
                    <li>Documentation</li>
                    <li>Status</li>
                    <li>Support</li>
                    <li>Developers</li>
                </ul>
            </div>
            <div className='flex flex-col gap-3'>
                <h2 className='font-bold text-xl'>Legal</h2>
                <ul className='text-lg flex flex-col font-medium text-gray-500 dark:text-gray-400 gap-1.5'>
                    <li><Link to="/privacy">Privacy</Link></li>
                    <li><Link to="/terms">Terms</Link></li>
                    <li><Link to="/refund">Refund</Link></li>
                    <li>Security</li>
                </ul>
            </div>
        </div>
        <div className='mt-10 text-center flex gap-3 flex-col'>
            <hr className='bg-gray-400 mb-5 h-0.5 xl:mt-10 xl:mb-5 border-0' />
            <span className='text-sm xl:text-lg text-gray-500 dark:text-gray-400'>&copy; 2026 Convertly. All rights reserved.</span>
            <div className='flex gap-3 font-medium xl:text-lg text-gray-600 dark:text-gray-400 justify-center'>
                <span>Twitter</span>
                <span>GitHub</span>
                <span>LinkedIn</span>
            </div>
        </div>
    </div>
  )
}

export default Footer