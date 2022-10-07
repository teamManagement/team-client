import { FC } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import ForgotPassword from './pages/Login/SubPages/ForgotPassword'
import RegistryAccount from './pages/Login/SubPages/RegistryAccount'

const App: FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/login/forgotPassword" element={<ForgotPassword />} />
        <Route path="/login/registryAccount" element={<RegistryAccount />} />
        <Route path="/home/*" element={<Home />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </HashRouter>
  )
}

export default App
