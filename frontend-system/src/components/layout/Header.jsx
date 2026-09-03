import { Link } from 'react-router-dom'
import { Avatar } from '../ui/index.js'

export default function Header() { return <header className="topbar"><Link className="brand" to="/"><span className="brand__mark">P</span><span>Payment Guardian</span></Link><Avatar initials="AS" size="sm" /></header> }
