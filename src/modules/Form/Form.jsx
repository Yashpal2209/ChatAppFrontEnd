import React, { useState } from 'react'
import Input from '../../components/Input/Input'
import Button from '../../components/Button/Button'
import { useNavigate } from 'react-router-dom'

function Form({
  isSignInPage=false,
}) {

  const [data,setData]=useState({
    ...(!isSignInPage && {
      fullName:''
    }),
    email:'',
    password:''
  })

  const navigate=useNavigate();


  async function handleSubmit(){
    console.log(data);
    const response=await fetch(`http://localhost:3000/api/${isSignInPage?'login':'register'}`,{
      method:"POST",
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify(data)
    });
    if(response.status!==200){
      console.log(response);
      alert("Invalid Credentials");
    }else{
      const resdata=await response.json();
      if(resdata.token){
        localStorage.setItem('user:token',resdata.token);
        localStorage.setItem('user:detail',JSON.stringify(resdata.user));

        navigate('/');
      }
    }
    
  }
  
  return (
    <div className="bg-light h-screen flex items-center justify-center">
      <div className="bg-white w-[600px] h-[600px] border shadow-lg rounded-lg flex flex-col justify-center items-center h-50%">
      <div className="text-4xl font-extrabold">
        Welcome {isSignInPage && "Back"}
      </div>
      <div className="text-2xl font-bold mb-10">
        {isSignInPage ? "Sign In" : "Sign Up"}
      </div>
      <form 
      className="flex flex-col items-center w-full"
      onSubmit={(event)=>{
        event.preventDefault();
        console.log("hello");
        handleSubmit();
      }}>
        {!isSignInPage && <Input label="Full Name" name="name" placeholder="Enter Your Name" className="mb-6" value={data.fullName}
          onChange={(e)=>{
            setData({...data,fullName:e.target.value})
          }}
          isRequired:true
        />}
        <Input label="Email" name="email" placeholder="Enter Your Email" type="email" className="mb-6" value={data.email}
          onChange={(e)=>{
            setData({...data,email:e.target.value})
          }}
          isRequired:true
        />
        <Input label="Password" name="password" placeholder="Enter Your Password" type="password" className="mb-6" value={data.password}
          onChange={(e)=>{
            setData({...data,password:e.target.value})
          }}
          isRequired:true
        />
        <Button label={isSignInPage ? "Sign IN":"Sign Up"} type="submit" className="" />
        
      </form>
      <div>
        {isSignInPage ? "Don't have an account":"Already have an account?"}
         <span className='text-primary cursor-pointer underline' onClick={()=>{
           navigate(isSignInPage?"/user/sign_up":"/user/sign_in")
         }} >{isSignInPage?"Sign Up":"Sign In"}</span>
      </div>
    </div>
    </div>
  ) 
}

export default Form


