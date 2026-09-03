import Header from './Header.jsx'
import BottomNavigation from './BottomNavigation.jsx'
export default function AppShell({ children }) { return <div className="app-page"><Header /><main className="main-content">{children}</main><BottomNavigation /></div> }
