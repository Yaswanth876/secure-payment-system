import { NavLink } from 'react-router-dom'
const items = [['/', 'Home', 'H'], ['/activity', 'Activity', 'A'], ['/profile', 'Profile', 'P']]
export default function BottomNavigation() { return <nav className="bottom-nav" aria-label="Primary navigation">{items.map(([to, label, icon]) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => isActive ? 'nav-item nav-item--active' : 'nav-item'}><span className="nav-item__icon" aria-hidden="true">{icon}</span><span>{label}</span></NavLink>)}</nav> }
