import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LogOut, User, Menu, ShoppingBag,
  PackagePlus, PackageSearch, Percent,ChartAreaIcon
} from 'lucide-react';
import { useLogoutMutation } from '../features/auth/authApi';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { setUser } from '../features/auth/authSlice';
import { api } from '../app/apiSlice';
import ThemeToggle from './ThemeToggle';
import NotificationDropdown from './NotificationDropdown';
const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false); // مغلق افتراضياً
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();
const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      api.util.invalidateTags(['AuthUser'])
      
      dispatch(setUser(null))

      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (!user || user.role !== 'seller') return null;

  const links = [
    { to: '/orders/seller', label: 'Orders', icon: <ShoppingBag size={20} /> },
    { to: '/offers', label: 'Offers', icon: <Percent size={20} /> },
    { to: '/offers/add', label: 'Add Offer', icon: <PackagePlus size={20} /> },
    { to: '/products', label: 'Products', icon: <PackageSearch size={20} /> },
    { to: '/products/add', label: 'Add Product', icon: <PackagePlus size={20} /> },
    { to: '/profile', label: 'Porfile', icon: <User size={20} /> },
  ];

  return (
      <div
        className={`bg-gray-100 dark:bg-gray-800 text-black dark:text-white shadow-md transition-all duration-300
        ${isOpen ? 'w-64' : 'w-16'} flex flex-col`}
      >
        <div className="flex justify-center p-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-700 dark:text-white"
          >
            <Menu />
          </button>
        </div>
                            <NotificationDropdown />

        <nav className="flex-1 flex flex-col space-y-2 px-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              title={link.label}
            >
              {link.icon}
              {isOpen && <span className="text-sm">{link.label}</span>}
            </NavLink>
          ))}

        </nav>
          <ThemeToggle />
        {/* تسجيل الخروج */}
        <div className="px-2 pb-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 text-red-500 hover:text-red-600 rounded transition"
            title="Logout"
          >
            <LogOut size={20} />
            {isOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </div>
  );
};

export default Sidebar;
