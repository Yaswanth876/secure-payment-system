import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Send from './pages/Send.jsx'
import Activity from './pages/Activity.jsx'
import Profile from './pages/Profile.jsx'

function App() {
  return <BrowserRouter><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/send" element={<Send />} />
    <Route path="/activity" element={<Activity />} />
    <Route path="/profile" element={<Profile />} />
  </Routes></BrowserRouter>
}

export default App
