"use client"
import { NextPage } from 'next'
import React from 'react'
import { loginData } from '../../api/interface';
import authService from '@/app/services/Authservices';
import { useRouter } from 'next/navigation';

interface Props {}

const Page: NextPage<Props> = ({}) => {
  const router = useRouter();
  const [formdata, setformdata] = React.useState<loginData>({
    email: "",
    password: "",
  });
  const [errors, seterrors] = React.useState<loginData>({
    email: "",
    password: "",
  });
  const [isSubmitting, setisSubmitting] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setformdata({
      ...formdata,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setisSubmitting(true);
    try {
       const response = await authService.Login(formdata);
       console.log("Login success:", response);
      console.log("Login form submitted:", formdata);
      if(response.is_admin==true){
        router.push('/provider/dashboard');
      }else{
        router.push('/client/Booking');
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setisSubmitting(false);
    }
  };

  return <div>Login
    <form>
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formdata.email}
        onChange={handleChange}
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formdata.password}
        onChange={handleChange}
      />
      <button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? "Logging in..." : "Login"}
      </button>
    </form>
  </div>
}

export default Page