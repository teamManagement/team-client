import { FC } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import './index.scss'
import ContentComments from '../ContentComments'
import ContentContact from '../ContentContact'
import ContentApplicationCenter from '../ContentApplicationCenter'

export const Content: FC = () => {
  return (
    <div className="content-wrapper">
      <Routes>
        <Route path="comments" element={<ContentComments />} />
        <Route path="contact" element={<ContentContact />} />
        <Route path="applicationCenter" element={<ContentApplicationCenter />} />
        <Route path="*" element={<Navigate to="/home/comments" />} />
      </Routes>
    </div>
  )
}

export default Content
