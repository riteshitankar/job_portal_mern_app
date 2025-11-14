import React, { useState } from 'react'
import OtpInput from 'react-otp-input';
import { useNavigate } from 'react-router-dom';

import "./style/UserLoginRegisterForm.scss"

import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";

import { requestUserRegister, requestUserEmailOtpVerification, requestUserLogin } from "../../api/userAPI.js"

import { useMessage } from '../../context/messageContext';

import { useUser } from '../../context/userContext.jsx';

const UserLoginRegisterForm = () => {
  
  let navigate = useNavigate()

  let { fetchUserProfile } = useUser()

  let [openFormLogin, setOpenFormLogin] = useState(true)

  let [showPassword, setShowPassword] = useState(false)

  let [loading, setLoading] = useState(false)

  let [showOtpForm, setShowOtpForm] = useState(false)

  let [registerForm, setRegisterForm] = useState({
    name: "", phone: "", email: "", password: "", street: "", city: "", state: "", country: "", pincode: "", dob: ""
  })

  let [loginFrom, setLoginForm] = useState({
    email: "", password: ""
  })

  let [registerFormVerifyOtp, setRegisterFormVerifyOtp] = useState({
    email: "", userOtp: ""
  })

  let [otp, setOtp] = useState(0)

  let { triggerMessage } = useMessage()

  const handleLoginFormSubmit = async (e) => {
    try {
      e.preventDefault()

      setLoading(true)

      let result = await requestUserLogin(loginFrom)

      if (result.status != 202) throw ("Login Failed !")

      console.log("login successfull : ", result)

      setLoginForm({ email: "", password: "" })

      localStorage.setItem("token", result.data.token)

      triggerMessage("success", result.data.message ? result.data.message : "Login was successfull ! Redirecting to Dashboard.")

      await fetchUserProfile()

      navigate("/user/dashboard")

    } catch (err) {
      console.log("user login failed : ", err)
      setLoginForm({ email: "", password: "" })
      triggerMessage("danger", err.response.data.err ? err.response.data.err : err)
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  const handleLoginChange = (e) => {
    let { name, value } = e.target
    setLoginForm(prev => {
      return { ...prev, [name]: value }
    })
  }

  const handleRegisterFormSubmit = async (e) => {
    e.preventDefault()
    try {

      setLoading(true)

      let result = await requestUserRegister(registerForm)

      if (result.status != 202) throw ("unable to register user !")

      triggerMessage("success", result.data.message ? result.data.message : "Registered User Successfully !", true)

      setShowOtpForm(true)

      setRegisterFormVerifyOtp(prev => {
        return { ...prev, email: registerForm.email }
      })

      setRegisterForm({ name: "", phone: "", email: "", password: "", street: "", city: "", state: "", country: "", pincode: "", dob: "" })

    } catch (err) {
      console.log("register new user error : ", err)
      triggerMessage("danger", err.message ? err.message : err, true)
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterFormChange = (e) => {
    let { name, value } = e.target

    setRegisterForm(prev => {
      return { ...prev, [name]: value }
    })
  }

  const handleOtpFormSubmit = async (e) => {
    e.preventDefault()
    try {

      setLoading(true)

      // creating data

      setRegisterFormVerifyOtp(prev => {
        return { ...prev, userOtp: otp }
      })

      let result = await requestUserEmailOtpVerification(registerFormVerifyOtp)

      if (result.status != 202) throw ("unable to verify OTP !")

      triggerMessage("success", result.data.message ? result.data.message : "OTP verifed successfully !", true)

      setShowOtpForm(false)

      setRegisterFormVerifyOtp({ email: "", userOtp: "" })

      setOpenFormLogin(true)

    } catch (err) {
      console.log("verify otp error : ", err)
      triggerMessage("danger", err.message ? err.message : err, true)
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='login-register-form'>
      <div className='content'>
        <div className='login-register-section shadow-lg rounded overflow-hidden'>
          <div className='register'>
            {
              showOtpForm ?
                <form onSubmit={handleOtpFormSubmit} className='h-full flex flex-col justify-center items-center p-5 gap-3'>
                  <h1 className='text-2xl font-bold'>Verify <span className='text-primary'>Email</span></h1>
                  <span className='text-center'>An otp has been sent on email <span className='text-primary'>{registerFormVerifyOtp.email}</span></span>
                  <OtpInput
                    value={otp}
                    onChange={setOtp}
                    numInputs={4}
                    renderSeparator={<span className='mx-2'>-</span>}
                    isInputNum={true}
                    shouldAutoFocus={true}
                    inputStyle={{
                      border: "1px solid black",
                      borderRadius: "8px",
                      width: "54px",
                      height: "54px",
                      fontSize: "12px",
                      color: "#000",
                      fontWeight: "400",
                      caretColor: "blue"
                    }}
                    focusStyle={{
                      border: "1px solid #CFD3DB",
                      outline: "none"
                    }}
                    renderInput={(props) => <input {...props} />}
                  />
                  <button type='submit' className={`${loading ? "bg-gray-800 hover:bg-gray-800" : "bg-green-600"} hover:bg-green-700 text-light font-bold px-6 py-2 rounded transition-all`} disabled={loading}>
                    {loading ? "Processing..." : "Verify OTP"}
                  </button>
                </form>
                :
                <form onSubmit={handleRegisterFormSubmit} className='h-full flex flex-col justify-center p-5 gap-3'>
                  <h1 className='text-2xl font-bold'>Create New <span className='text-primary'>Account</span></h1>
                  <div className='flex gap-3'>
                    <div className='grow'>
                      <div>
                        <span className='opacity-70'>Name</span>
                      </div>
                      <input name='name' value={registerForm.name} onChange={handleRegisterFormChange} type="text" id="name" className="mt-2 bg-white border border-gray-300 text-dark text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="Name" required />
                    </div>
                    <div className='grow'>
                      <div>
                        <span className='opacity-70'>Phone</span>
                      </div>
                      <input name='phone' onChange={handleRegisterFormChange} value={registerForm.phone} type="tel" id="phone" className="mt-2 bg-white border border-gray-300 text-dark text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="Phone" required />
                    </div>
                  </div>
                  <div className='flex gap-3'>
                    <div>
                      <div>
                        <span className='opacity-70'>D.O.B.</span>
                      </div>
                      <input name='dob' onChange={handleRegisterFormChange} value={registerForm.dob} type="date" id="name" className="mt-2 bg-white border border-gray-300 text-dark text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="dob" required />
                    </div>
                    <div className='grow'>
                      <div>
                        <span className='opacity-70'>Email</span>
                      </div>
                      <input name='email' onChange={handleRegisterFormChange} value={registerForm.email} type="email" id="email" className="mt-2 bg-white border border-gray-300 text-dark text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="Email" required />
                    </div>
                  </div>
                  <div>
                    <div>
                      <span className='opacity-70'>Address</span>
                    </div>
                    <div className='address-fields w-full flex flex-col gap-3'>
                      <div className='w-full grow'>
                        <input name='street' onChange={handleRegisterFormChange} value={registerForm.street} type="text" id="name" className="grow mt-2 bg-white border border-gray-300 text-dark text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="Street" required />
                      </div>
                      <div className='flex gap-3'>
                        <input name='city' onChange={handleRegisterFormChange} value={registerForm.city} type="text" id="name" className="mt-2 bg-white border border-gray-300 text-dark text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="City" required />
                        <input name='state' onChange={handleRegisterFormChange} value={registerForm.state} type="text" id="name" className="mt-2 bg-white border border-gray-300 text-dark text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="State" required />
                      </div>
                      <div className='flex gap-3'>
                        <input name='country' onChange={handleRegisterFormChange} value={registerForm.country} type="text" id="name" className="mt-2 bg-white border border-gray-300 text-dark text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="Country" required />
                        <input name='pincode' onChange={handleRegisterFormChange} value={registerForm.pincode} type="number" id="name" className="mt-2 bg-white border border-gray-300 text-dark text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="Pincode" required />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className='flex justify-between opacity-70'>
                      <span>Create Password</span>
                    </div>
                    <div className='flex items-center gap-3'>
                      <input name='password' onChange={handleRegisterFormChange} value={registerForm.password} type={showPassword ? "text" : "password"} id="password" className="mt-2 bg-white border border-gray-300 text-dark text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="Please Enter Password" required />
                      <button type='button' onClick={() => setShowPassword(!showPassword)}>
                        {
                          showPassword ?
                            <FaEyeSlash size={25} /> :
                            <FaEye size={25} />
                        }
                      </button>
                    </div>
                  </div>
                  <div className='flex gap-3 flex-col justify-center'>
                    <button type='submit' className={`${loading ? "bg-gray-800 hover:bg-gray-800" : "bg-green-600"} hover:bg-green-700 text-light font-bold px-6 py-2 rounded transition-all`} disabled={loading}>
                      {loading ? "Processing..." : "Register User"}
                    </button>
                    <hr />
                    <button type='button' onClick={() => { setOpenFormLogin(true) }} className='bg-gray-300 hover:bg-gray-400 px-6 py-2 rounded transition-all'>Already Registered? Please Login</button>
                  </div>
                </form>
            }
          </div>
          <div className='login'>
            <form onSubmit={handleLoginFormSubmit} className='h-full flex flex-col justify-center p-5 gap-7'>
              <h1 className='text-2xl font-bold'>Login</h1>
              <div>
                <div>
                  <span className='opacity-70'>Email</span>
                </div>
                <input name='email' onChange={handleLoginChange} value={loginFrom.email} type="email" id="email" className="mt-2 bg-white border border-gray-300 text-dark text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="Please Enter Email" required />
              </div>
              <div>
                <div className='flex justify-between opacity-70'>
                  <span>Password</span>
                  <span className='text-primary'>Forgot Password ?</span>
                </div>
                <div className='flex items-center gap-3'>
                  <input name='password' onChange={handleLoginChange} value={loginFrom.password} type={showPassword ? "text" : "password"} id="password" className="mt-2 bg-white border border-gray-300 text-dark text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="Please Enter Password" required />
                  <button type='button' onClick={() => setShowPassword(!showPassword)}>
                    {
                      showPassword ?
                        <FaEyeSlash size={25} /> :
                        <FaEye size={25} />
                    }
                  </button>
                </div>
              </div>
              <div className='flex gap-3 flex-col justify-center'>
                <button type='submit' className={`${loading ? "bg-gray-800 hover:bg-gray-800" : "bg-green-600"} hover:bg-green-700 text-light font-bold px-6 py-2 rounded transition-all`} disabled={loading}>
                  {loading ? "Processing..." : "Login"}
                </button>
                <hr />
                <button type='button' onClick={() => { setOpenFormLogin(false) }} className='bg-gray-300 hover:bg-gray-400 px-6 py-2 rounded transition-all'>New Here? Please Register</button>
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