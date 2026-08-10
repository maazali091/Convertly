import { Eye, Gauge, Info, Lock, Shield, Users } from 'lucide-react'
import React from 'react'

function Security() {
  return (
    <div className='pt-20 pb-10 px-5'>
        <div>
            <h2 className='text-5xl mb-10 font-bold'>Enterprise-Grade Security</h2>
        </div>
        <div className='flex flex-col gap-5'>
            <div className='flex gap-3 items-center'>
                <Lock size={27} className='text-green-500' />
                <div>
                    <span className='font-bold text-md mb-2'>End-to-End Encryption</span>
                    <p className='text-slate-500 font-medium'>All data encrypted with AES-256</p>
                </div>
            </div>
            <div className='flex gap-3 items-center'>
                <Eye size={27} className='text-green-500' />
                <div>
                    <span className='font-bold text-md mb-2'>Zero-Knowledge</span>
                    <p className='text-slate-500 font-medium'>We never see your files</p>
                </div>
            </div>
            <div className='flex gap-3 items-center'>
                <Gauge size={27} className='text-green-500' />
                <div>
                    <span className='font-bold text-md mb-2'>Auto-Delete</span>
                    <p className='text-slate-500 font-medium'>Files deleted after 24 hours</p>
                </div>
            </div>
            <div className='flex gap-3 items-center'>
                <Info size={27} className='text-green-500' />
                <div>
                    <span className='font-bold text-md mb-2'>No Logging</span>
                    <p className='text-slate-500 font-medium'>Your activity is private</p>
                </div>
            </div>
            <div className='flex gap-3 items-center'>
                <Shield size={27} className='text-green-500' />
                <div>
                    <span className='font-bold text-md mb-2'>GDPR Compliant</span>
                    <p className='text-slate-500 font-medium'>Full GDPR, HIPAA, SOC 2 Type II</p>
                </div>
            </div>
            <div className='flex gap-3 items-center'>
                <Users size={27} className='text-green-500' />
                <div>
                    <span className='font-bold text-md mb-2'>Team Controls</span>
                    <p className='text-slate-500 font-medium'>Manage users and permissions</p>
                </div>
            </div>
        </div>


        <div className='border-2 border-gray-200 mt-10 w-full h-85 rounded-xl flex items-center bg-gray-50 justify-center flex-col gap-5'>
            <Shield size={100} className='text-green-500 p-5 bg-slate-200 rounded-full' />
            <span>Military-grade encryption</span>
        </div>
    </div>
  )
}

export default Security