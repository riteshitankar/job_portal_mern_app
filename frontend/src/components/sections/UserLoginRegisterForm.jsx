import React, { useState } from 'react'

// styling for user login register form 
import './style/UserLoginRegisterForm.scss'

// react icons 
import { FaEye, FaEyeSlash } from "react-icons/fa";

const UserLoginRegisterForm = () => {
  const [openFormLogin, setOpenFormLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className='login-register-form'>
      <div className='content'>
        <div className='login-register-section shadow-lg rounded overflow-hidden'>
          <div className='register'>
            <button onClick={() => setOpenFormLogin(true)} className='bg-black p-2 text-white'>Login</button>
          </div>
          <div className='login'>
            <form className='h-full flex flex-col justify-center p-5 gap-7'>
              <h1 className='text-2xl font-bold'>Login</h1>
              <div>
                <div>
                  <span className='opacity-70'>Email</span>
                </div>
                <input 
                  type="email" 
                  id="email" 
                  className="mt-2 bg-white border border-gray-300 text-dark text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
                  placeholder="Please Enter Email" 
                  required 
                />
              </div>

              <div>
                <div className='flex justify-between opacity-70'>
                  <span>Password</span>
                  <span className='text-primary'>Forgot Password ?</span>
                </div>
                <div className='flex items-center gap-3'>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    id="password" 
                    className="mt-2 bg-white border border-gray-300 text-dark text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
                    placeholder="Please Enter Password" 
                    required 
                  />
                  <button type='button' onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FaEyeSlash size={25} /> : <FaEye size={25} />}
                  </button>
                </div>
              </div>

              <div className='flex gap-3 flex-col justify-center'>
                <button className='bg-green-600 hover:bg-green-700 text-light font-bold px-6 py-2 rounded transition-all'>Login</button>
                <hr />
                <button 
                  type='button' 
                  onClick={() => setOpenFormLogin(false)} 
                  className='bg-gray-300 hover:bg-gray-400 px-6 py-2 rounded transition-all'
                >
                  New Here? Please Register
                </button>
              </div>
            </form>
          </div>

          <div className={`slider ${openFormLogin ? "login" : "register"}`}>
            <div className='text-data h-full flex flex-col justify-end gap-2 text-light p-6'>
              <span className='font-bold text-2xl'>Welcome</span>
              <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit.?</p>
              <span className='bg-primary p-2 font-bold w-fit rounded'>Get 20% Off</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserLoginRegisterForm
