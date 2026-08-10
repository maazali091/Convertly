import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Formats } from '../assets/Formats'

import 'swiper/css';
import 'swiper/css/pagination';
import { Autoplay, Pagination } from 'swiper/modules';
function SuppFormats() {
  return (
    <div className='pt-20 pb-10 px-5 bg-gray-50'>
        <div className='text-center px-5'>
            <h2 className='text-[52px]/15 mb-3 font-bold'>Supported Formats</h2>
            <span className='font-medium text-[20px] text-slate-600'>Convert between 50+ file types</span>
        </div>
        <Swiper  modules={[Autoplay, Pagination]} spaceBetween={30}  slidesPerView={3} 
             loop='3' autoplay={{ delay: 1000, disableOnInteraction: false, }}
              breakpoints={{
                320: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 5 },
                1200: {slidesPerView: 6},
            }} className="mySwiper grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-6 gap-5 mt-15">
                {Formats.map((i) => (
                    <SwiperSlide key={i.id}>
                        <div  className='border a-full flex bg-white justify-center items-center border-slate-300 hover:shadow-lg transition-all duration-200 group rounded-lg px-5 py-5 flex-col gap-5 cursor-pointer'>
                            <i.icon size={40}/>
                            <h3 className='font-medium text-gray-600'>{i.name}</h3>
                        </div>
                    </SwiperSlide>  
                ))}
            </Swiper>
    </div>
  )
}

export default SuppFormats