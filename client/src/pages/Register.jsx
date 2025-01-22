import React, { useState } from 'react'
import {Link, useNavigate} from 'react-router-dom'
import axios from 'axios'

const Register = () => {
    const [values, setValues] = useState({email: '', password: ''});
    const [fieldErrors, setFieldErrors] = useState({email: '', password: ''});
    const [statusMessage, setStatusMessage] = useState ('');
    const [messageType, setMessageType] = useState('');

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues({...values, [name]:value});
        setStatusMessage('');
        setMessageType('');

        if(name === 'email'){
            const emailRegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            setFieldErrors({
                ...fieldErrors,
                email: emailRegExp.test(value) ? '' : 'Invalid email format. Make sure it includes "@" and a domain.', 
            });
        }

        if(name === 'password'){
            const passwordErrors = [];

            if (!/[A-Z]/.test(value)) passwordErrors.push('Add at least one uppercase letter.');
            if (!/\d/.test(value)) passwordErrors.push('Add at least one digit.');
            if (!/[!@#$%^&*]/.test(value)) passwordErrors.push('Add at least one special character.');
            if (value.length < 8) passwordErrors.push('Password must be at least 8 characters long.');

            setFieldErrors({
                ...fieldErrors,
                password: passwordErrors.join(' '),
            });
        }
    }

    const isFormValid = () => {
        return !fieldErrors.email && !fieldErrors.password && values.email && values.password;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3003/auth/register', values);
            if(response.status === 201){
                setMessageType('success');
                setStatusMessage(response.data.message);
                setTimeout(() => navigate('/'), 1500);
            }
        } catch (error) {
            if (error.response && error.response.data.message){
              setMessageType('error');
              setStatusMessage(error.response.data.message);
            } else{
              setMessageType('error');
              setStatusMessage('An unexpected error occurred. Please try again.');
            }
        }
    }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="shadow-lg px-8 py-5 border w-72">
        <h2 className="text-lg font-bold mb-4">Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your mail"
              className={`w-full px-3 py-2 border ${fieldErrors.email ? "border-red-500" : "border-gray-300"}`}
              name="email"
              value={values.email}
              onChange={handleChange}
            />
            {fieldErrors.email && (<p className="text-red-500 text-sm">{fieldErrors.email}</p>)}
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              className={`w-full px-3 py-2 border ${ fieldErrors.password ? "border-red-500" : "border-gray-300"}`}
              name="password"
              value={values.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {fieldErrors.password && ( <p className="text-red-500 text-sm">{fieldErrors.password}</p> )}
          </div>

          {statusMessage && <p className={`mb-4 ${messageType === 'error' ? 'text-red-500' : 'text-green-500'}`}>{statusMessage}</p>}

          <button
            type="submit" 
            className={`mb-4 w-full py-2 ${!isFormValid() ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-200'}`} 
            disabled={!isFormValid()}> Submit
          </button>

        </form>

        <div className="text-center">
          <span>Already have an account?</span>
          <Link to="/login" className="text-gray-800 "> Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Register