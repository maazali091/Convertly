import React from 'react'
import {} from "lucide-react"
import { FaGoogle, FaMicrosoft, FaSlack, FaSpotify, FaStripe } from 'react-icons/fa'
import 'swiper/css';
import 'swiper/css/pagination';
import { Autoplay, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react'

function Trust() {
  return (
    <div className='pt-20 pb-20 border-t border-gray-400 px-5 dark:bg-slate-900'>
        <div className='text-center font-bold'>
            <span className='uppercase text-gray-400 text-lg'>trusted by Millions</span>
            <h2 className='font-bold text-[30px]/12'>500,000+ Users Worldwide</h2>
        </div>
        <Swiper modules={[Autoplay, Pagination]} spaceBetween={25}  slidesPerView={4} loop={true} 
              autoplay={{
                delay: 3000, disableOnInteraction: false,
              }}
              breakpoints={{
                320: { slidesPerView: 2 }, 768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 }, 1200: { slidesPerView: 4 },
              }} 
              className="mySwiper flex  items-center mt-10">
              <SwiperSlide>
                <div className='pb-5 flex  gap-0 text-gray-400 xl:text-4xl py-5 font-bold text-lg items-center justify-center mx-auto'>
                    <FaGoogle />oogle
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className='pb-5 flex  gap-2 text-gray-400 xl:text-4xl py-5  font-bold text-lg items-center justify-center mx-auto'>
                    <FaMicrosoft size={30} />Microsoft
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className='pb-5 flex  gap-2 text-gray-400 xl:text-4xl py-5  font-bold text-lg items-center justify-center mx-auto'>
                    <FaSlack  size={30} />Slack
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className='pb-5 gap-2  text-gray-400 xl:text-4xl py-5  font-bold text-lg flex items-center justify-center mx-auto'>
                    <FaSpotify size={30} />Spotify
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className='pb-5 flex -mt-3 xl:-mt-6  text-gray-400 xl:text-6xl py-5  gap-2 font-bold text-lg items-center justify-center mx-auto'>
                    <FaStripe className='size-13 md:mt-0.5 xl:size-23' />
                </div>
              </SwiperSlide>
        </Swiper>
    </div>
  )
}

export default Trust