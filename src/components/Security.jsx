import { Eye, Gauge, Info, Lock, Shield, Users } from 'lucide-react'
import React from 'react'

function Security() {
  return (
    <div className='pt-20 pb-10 px-5 md:px-10 xl:px-20 lg:flex justify-between w-full  items-center dark:bg-slate-900 xl:py-20'>
        <div>
            <h2 className='text-5xl mb-10 font-bold md:max-w-120 md:text-6xl/20 xl:text-[50px] xl:max-w-full'>Enterprise-Grade Security</h2>
        <div className='flex flex-col gap-5 md:grid md:grid-cols-2 lg:grid-cols-1'>
            <div className='flex gap-3 items-center'>
                <Lock size={27} className='text-green-500 xl:size-9 xl:mr-2' />
                <div>
                    <span className='font-bold text-md xl:text-lg mb-2'>End-to-End Encryption</span>
                    <p className='text-slate-500 font-medium xl:text-lg'>All data encrypted with AES-256</p>
                </div>
            </div>
            <div className='flex gap-3 items-center'>
                <Eye size={27} className='text-green-500  xl:size-9 xl:mr-2' />
                <div>
                    <span className='font-bold text-md xl:text-lg mb-2'>Zero-Knowledge</span>
                    <p className='text-slate-500 font-medium xl:text-lg'>We never see your files</p>
                </div>
            </div>
            <div className='flex gap-3 items-center'>
                <Gauge size={27} className='text-green-500 xl:size-9 xl:mr-2' />
                <div>
                    <span className='font-bold text-md xl:text-lg mb-2'>Auto-Delete</span>
                    <p className='text-slate-500 font-medium xl:text-lg'>Files deleted after 24 hours</p>
                </div>
            </div>
            <div className='flex gap-3 items-center'>
                <Info size={27} className='text-green-500 xl:size-9 xl:mr-2' />
                <div>
                    <span className='font-bold text-md xl:text-lg mb-2'>No Logging</span>
                    <p className='text-slate-500 font-medium xl:text-lg'>Your activity is private</p>
                </div>
            </div>
            <div className='flex gap-3 items-center'>
                <Shield size={27} className='text-green-500 xl:size-9 xl:mr-2' />
                <div>
                    <span className='font-bold text-md xl:text-lg mb-2'>GDPR Compliant</span>
                    <p className='text-slate-500 font-medium xl:text-lg'>Full GDPR, HIPAA, SOC 2 Type II</p>
                </div>
            </div>
            <div className='flex gap-3 items-center'>
                <Users size={27} className='text-green-500  xl:size-9 xl:mr-2' />
                <div>
                    <span className='font-bold text-md xl:text-lg mb-2'>Team Controls</span>
                    <p className='text-slate-500 font-medium xl:text-lg'>Manage users and permissions</p>
                </div>
            </div>
        </div>


        </div>
        <div className='border-2 border-gray-200 mt-10 w-full lg:w-100 h-85 md:w-120 xl:w-120 md:mx-auto md:h-100 xl:h-120 rounded-xl flex items-center dark:border-slate-500 bg-gray-50 dark:bg-slate-800 justify-center flex-col gap-5'>
            <Shield size={100} className='text-green-600 p-5 bg-slate-200 dark:bg-green-200 rounded-full' />
            <span className='xl:text-2xl xl:mt-3 dark:text-gray-400 font-medium'>Military-grade encryption</span>
        </div>
    </div>
  )
}

export default Security