import React, { useState } from 'react'
import {Link, useNavigate} from 'react-router-dom'
import axios from 'axios'

const Login = () => {
    const [values, setValues] = useState({
        email: '',
        password: '',
    })

    const navigate = useNavigate()

    const handleChange = (event) => {
        setValues({...values, [event.target.name]:event.target.value})
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        try {
            const response = await axios.post('http://localhost:3001/auth/login', values)
            if(response.status === 201){
                localStorage.setItem('token', response.data.token)
                navigate('/')
            }
        } catch (error) {
            console.log(error)
        }
    }

  return (
    <div className='flex justify-center items-center h-screen'>
    <div className='shadow-lg px-8 py-5 border w-72'>
        <h2 className='text-lg font-bold mb-4'>Login</h2>
        <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <label htmlFor="email" className='block text-gray-700'>Email</label>
                <input type="email" placeholder='Enter your mail' className='w-full px-3 py-2 border'
                name="email" onChange={handleChange}/>
            </div>
            <div className="mb-4">
                <label htmlFor="password" className='block text-gray-700'>Password</label>
                <input type="password" placeholder='Enter your password' className='w-full px-3 py-2 border'
                name="password" onChange={handleChange}/>
            </div>
            <button className="w-full bg-green-200 py-2 ">Submit</button>
        </form>
        <div className="text-center">
            <span>Don't have an account?</span>
            <Link to='/register' className='text-gray-800'>Register</Link>
        </div>
    </div>
</div>
  )
}

export default Login