import { useState } from 'react'
import Login from './Components/Login'
import { Routes, Route } from 'react-router-dom'
function App() {


  return (
    <>
      <div>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>

    </>
  )
}

export default App
