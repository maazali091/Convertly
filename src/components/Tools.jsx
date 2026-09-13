import { ArrowRight } from 'lucide-react';
import React from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom';
import { toolsData } from '../assets/toolsData';

function Tools() {
    const [selectCat, setSelectCat] = useState("all");
    return (
        <div className='pt-20 bg-gray-50 pb-10 px-5 lg:px-15 dark:bg-gray-900' id='tools'>
            <div className='text-center px-5'>
                <h2 className='text-5xl/15 xl:text-6xl dark:text-white mb-2 xl:mb-6  font-bold'>Popular Tools</h2>
                <span className='font-medium text-[20px] text-slate-600 dark:text-gray-400'>All the conversion tools you need in one place</span>
            </div>
            <div className='flex flex-wrap justify-center xl:text-2xl xl:font-bold gap-3 mt-10'>
                <button className={`px-5 py-2 xl:px-6 xl:py-2.5 rounded-full hover:shadow-lg cursor-pointer border-2 font-medium ${selectCat === 'all' ? 'bg-blue-700 shadow-lg border-blue-500 text-slate-100' : 'bg-gray-100 dark:bg-slate-700 border-gray-300 dark:border-gray-500'}`} onClick={() => setSelectCat('all')}>All Tools</button>
                <button className={`px-5 py-2 xl:px-6 xl:py-2.5 rounded-full hover:shadow-lg cursor-pointer border-2 font-medium ${selectCat === 'pdf' ? 'bg-blue-700  shadow-lg border-blue-500 text-slate-100' : 'bg-gray-100 dark:bg-slate-700 border-gray-300 dark:border-gray-500'}`} onClick={() => setSelectCat('pdf')}>PDF</button>
                <button className={`px-5 py-2 xl:px-6 xl:py-2.5 rounded-full hover:shadow-lg cursor-pointer border-2 font-medium ${selectCat === 'img' ? 'bg-blue-700 border-blue-500 text-slate-100' : 'bg-gray-100 dark:bg-slate-700 border-gray-300 dark:border-gray-500'}`} onClick={() => setSelectCat('img')}>Images</button>
                <button className={`px-5 py-2 xl:px-6 xl:py-2.5 rounded-full hover:shadow-lg cursor-pointer border-2 font-medium ${selectCat === 'office' ? 'bg-blue-700 border-blue-500 text-slate-100' : 'bg-gray-100 dark:bg-slate-700 border-gray-300 dark:border-gray-500'}`} onClick={() => setSelectCat('office')}>Office</button>
                <button className={`px-5 py-2 xl:px-6 xl:py-2.5 rounded-full hover:shadow-lg cursor-pointer border-2 font-medium ${selectCat === 'compress' ? 'bg-blue-700 border-blue-500 text-slate-100' : 'bg-gray-100 dark:bg-slate-700 border-gray-300 dark:border-gray-500'}`} onClick={() => setSelectCat('compress')}>Compress</button>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-10'>
                {toolsData
                    .filter((item) => selectCat === 'all' || item.cat.includes(selectCat))
                    .map((item, index) => (
                        <Link to={item.link} key={index} className='border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:shadow-lg transition-all duration-200 group rounded-lg px-5 py-8 flex flex-col gap-5 cursor-pointer'>
                            <item.icon className='text-zinc-500 dark:text-zinc-400 xl:size-13' size={40} />
                            <h3 className='font-bold text-gray-900 dark:text-white xl:mt-3 xl:text-3xl text-2xl'>{item.name}</h3>
                            <p className='text-lg text-slate-500 dark:text-gray-400 font-medium'>{item.desc}</p>
                            <span className='flex gap-1 group-hover:gap-2 text-blue-600 font-medium group-hover:opacity-100 opacity-0 transition-all duration-200 items-center'>Try now <ArrowRight size={20} /></span>
                        </Link>
                    ))}
            </div>
        </div>
    )
}

export default Tools