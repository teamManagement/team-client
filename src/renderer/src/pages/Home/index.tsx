import { FC } from 'react'
import Nav from './components/Nav'
import Content from './components/Content'
import WindowToolbar from './components/WindowToolbar'
import './index.scss'

export const Home: FC = () => {
  //   const location = useLocation()
  //   const transitions = useTransition(location, {
  //     from: { opacity: 0, transform: 'translate3d(-100px, 0, 0)' },
  //     enter: { opacity: 1, transform: 'translate3d(0, 0, 0)' },
  //     leave: { opacity: 0, transform: 'translate3d(-100px, 0, 1)' }
  //   })
  return (
    <div className="home match-parent">
      <WindowToolbar />
      <div className="content">
        <Nav />
        <Content />
      </div>
    </div>
  )
}

export default Home
