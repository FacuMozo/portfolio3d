import React from 'react'
import { extend   } from '@react-three/fiber'
import {Html}from '@react-three/drei'
extend({Html});

const Loader = () => {
  return (
    <html>
        <div className=' flex justify-center items-center'>
            <div className='w-20 h-20 border-2 border-opacity-20 border-blue-500 bordet-t-blue-500 rounded-full animate-spin'>

            </div>
        </div>
    </html>
  )
}

export default Loader