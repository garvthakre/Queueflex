"use client"

import { BookingResponseData } from '@/app/api/interface'
import queueService from '@/app/services/queueservice'
import { NextPage } from 'next'
import { use, useEffect, useState } from 'react'

interface Props {}
//this page is for queuing the services and for booking
const Page: NextPage<Props> = ({}) => {
 const [queues,setqueues]=useState<BookingResponseData[]>([]);
 useEffect(()=>{
  const loadqueue = async()=>{
    try{
      const response = await queueService.Getqueue();
      setqueues(response);
    }catch(error){
      console.error("Error fetching queues:", error);
    }
  }
  loadqueue();
},[]);
  
  return <div className='p-6'>
    <div className='text-xl font-bold mb-4'>Queues</div>
    <ul>
      {queues.map((queue) => (
        <li key={queue.service_id}>{queue.name}</li>
      ))}
    </ul>
  </div>
}

export default Page