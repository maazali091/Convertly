import React from 'react'
import {} from "lucide-react"
import { FaGoogle, FaMicrosoft, FaSlack, FaSpotify, FaStripe } from 'react-icons/fa'
import 'swiper/css';
import 'swiper/css/pagination';
import { Autoplay, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react'

function Trust() {
  return (
    <div className='mt-20 mb-10 px-5'>
        <div className='text-center font-medium'>
            <span className='uppercase text-lg'>trusted by Millions</span>
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
              className="mySwiper flex items-center items-center mt-10">
              <SwiperSlide>
                <div className='pb-5 flex  gap-0 font-bold text-lg items-center justify-center mx-auto'>
                    <FaGoogle />oogle
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className='pb-5 flex  gap-2 font-bold text-lg items-center justify-center mx-auto'>
                    <FaMicrosoft size={30} />Microsoft
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className='pb-5 flex  gap-2 font-bold text-lg items-center justify-center mx-auto'>
                    <FaSlack  size={30} />Slack
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className='pb-5 gap-2 font-bold text-lg flex items-center justify-center mx-auto'>
                    <FaSpotify size={30} />Spotify
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className='pb-5 flex -mt-3  gap-2 font-bold text-lg items-center justify-center mx-auto'>
                    <FaStripe  size={50} />
                </div>
              </SwiperSlide>
        </Swiper>
    </div>
  )
}

export default Trust