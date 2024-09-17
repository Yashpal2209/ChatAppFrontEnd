import { useState } from 'react'
import './App.css'
import Form from "./modules/Form/Form"
import Dashboard from './modules/Dashboard/Dashboard'
import { Routes,Route, redirect, Navigate } from 'react-router-dom'


const ProtectedRoutes=({children,auth=false})=>{
  const isLoggedIn=localStorage.getItem('user:token')!==null|| false;
 
  if(!isLoggedIn && auth){
    return <Navigate to="/user/sign_in"/>
  }
  if(isLoggedIn && ['/user/sign_in','/user/sign_up'].includes(window.location.pathname) ){
    return <Navigate to={"/"} />
  }

  return children


}

function App() {
  return (
    <>
    <Routes>
      <Route path="/" element={
        <ProtectedRoutes auth={true}>
          <Dashboard />
        </ProtectedRoutes>
      }/>
      <Route path="/user/sign_in" element={
        <ProtectedRoutes>
          <Form isSignInPage={true}/>
        </ProtectedRoutes>
        
      }/>
      <Route path="/user/sign_up" element={
        <ProtectedRoutes>
          <Form isSignInPage={false}/>
        </ProtectedRoutes>
      }/>
      
    </Routes>
    </>
  )
}

export default App
