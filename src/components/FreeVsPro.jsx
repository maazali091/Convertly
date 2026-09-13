import { Check, X } from 'lucide-react'
import React from 'react'

function FreeVsPro() {
    return (
        <div className='pt-30 pb-10 xl:pb-25 px-5 md:px-10 xl:px-20 bg-gray-50 dark:bg-slate-900 lg:px-15'>
            <div className='text-center px-5'>
                <h2 className='text-[45px]/15 md:text-[60px]/16 mb-3 xl:mb-4 font-bold'>
                    Compare Free & Pro
                </h2>

                <span className='font-medium text-[20px] xl:text-[23px] text-slate-600 dark:text-gray-400'>
                    See why teams choose Convertly
                </span>
            </div>

            <div className='max-w-5xl mx-auto my-10 overflow-hidden border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-950'>
                <table className='w-full border-collapse text-left'>
                    <thead>
                        <tr className='border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'>
                            <th className='py-4 px-6 font-semibold'>
                                Feature
                            </th>
                            <th className='py-4 px-6 font-semibold text-slate-700 dark:text-slate-300'>
                                Free
                            </th>
                            <th className='py-4 px-6 font-semibold text-indigo-600 dark:text-indigo-400'>
                                Pro
                            </th>
                        </tr>
                    </thead>

                    <tbody className='divide-y divide-slate-200 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300'>
                        <tr className='hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors'>
                            <td className='py-4 px-6'>
                                Conversions
                            </td>
                            <td className='py-4 px-6 text-amber-500'>
                                Limited
                            </td>
                            <td className='py-4 px-6 text-indigo-600 dark:text-indigo-400'>
                                Higher
                            </td>
                        </tr>
                        <tr className='hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors'>
                            <td className='py-4 px-6'>
                                Batch Processing
                            </td>
                            <td className='py-4 px-6 text-slate-400 dark:text-slate-500'>
                                <X />
                            </td>
                            <td className='py-4 px-6 text-indigo-600 dark:text-indigo-400'>
                                <Check />
                            </td>
                        </tr>
                        <tr className='hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors'>
                            <td className='py-4 px-6'>
                                Advanced Tools
                            </td>
                            <td className='py-4 px-6 text-slate-400 dark:text-slate-500'>
                                <X />
                            </td>
                            <td className='py-4 px-6 text-indigo-600 dark:text-indigo-400'>
                                <Check />
                            </td>
                        </tr>
                        <tr className='hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors'>
                            <td className='py-4 px-6'>
                                API access
                            </td>
                            <td className='py-4 px-6 text-slate-400 dark:text-slate-500'>
                                <X />
                            </td>
                            <td className='py-4 px-6 text-indigo-600 dark:text-indigo-400'>
                                <Check />
                            </td>
                        </tr>
                        <tr className='hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors'>
                            <td className='py-4 px-6'>
                                Usage History
                            </td>
                            <td className='py-4 px-6 text-amber-500'>
                                Limited
                            </td>
                            <td className='py-4 px-6 text-indigo-600 dark:text-indigo-400'>
                                Full
                            </td>
                        </tr>
                        <tr className='hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors'>
                            <td className='py-4 px-6'>
                                Priority support
                            </td>
                            <td className='py-4 px-6 text-slate-400 dark:text-slate-500'>
                                <X />
                            </td>
                            <td className='py-4 px-6 text-indigo-600 dark:text-indigo-400'>
                                <Check />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default FreeVsPro