import React from 'react'
import Header from '../../layout/Header/Header'
import { Outlet } from 'react-router-dom'

const Default = () => {
  return (
    <>
    <Header/>
    <Outlet/>
    </>
  )
}

export default Default