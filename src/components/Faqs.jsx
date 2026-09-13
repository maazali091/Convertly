import { ChevronDown, ChevronLeftCircleIcon, ChevronUp } from 'lucide-react'
import React, { useState } from 'react'
import { faqs } from '../assets/faqs';
function Faqs() {
  const [openIndex, setOpenIndex] = useState(null);
  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  return (
    <div className='pt-30 pb-10 xl:pb-20  px-5 md:px-20 lg:px-30 dark:bg-slate-900' id='faq'>
      <div className='text-center'>
        <h2 className='text-[47px]/15 mb-3 font-bold'>Frequently Asked Questions</h2>
        <span className='font-medium text-[20px] xl:text-[23px] dark:text-gray-400 text-slate-600'>Everything you need to know</span>
      </div>
      <div className="mt-15 flex flex-col gap-5 max-w-230 mx-auto">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} onClick={() => toggleFaq(index)} className={`border-2 border-gray-300 dark:border-slate-700 p-5 rounded-2xl cursor-pointer transition-all duration-300 ${isOpen ? 'bg-white dark:bg-slate-800 shadow-sm' : 'bg-transparent'}`}>
              <div className='flex justify-between items-center '>
                <h3 className={`font-bold text-md xl:text-lg ${isOpen ? "text-blue-600" : "text-gray-900 dark:text-gray-200"}`}>
                  {faq.question}
                </h3>
                {isOpen ? <ChevronUp className='text-blue-600 w-5 h-5 shrink-0' /> : <ChevronDown className='text-blue-600 w-5 h-5 shrink-0' />}
              </div>
              {isOpen && <p className='mt-3 font-medium xl:text-lg text-gray-700 dark:text-gray-400 animate-fade-in'>All files are encrypted with AES-256. Files are automatically deleted after 24 hours. We never store or log your data.</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default Faqs