// ✅ Navbar.tsx بعد التعديل الكامل لدعم عرض السلة في الموبايل + Wishlist
import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Heart } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { RootState } from '../app/store';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../features/auth/authSlice';
import { useLogoutMutation } from '../features/auth/authApi';
import {
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
} from '../features/cards/cardsSlice';
import { api } from '../app/apiSlice';
import SearchBox from '../services/searchBox';
import { useGetWishlistQuery } from '../features/wishlist/wishlistApi';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'Offers', to: '/offers' },
  { label: 'Contact', to: '/contact' },
  { label: 'My Orders', to: '/orders/my' },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const { data: wishlist = [] } = useGetWishlistQuery(undefined, {
    skip: !user || user.role !== 'user',
  });
  const [logoutApi, { isLoading: loggingOut }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
      dispatch(setUser(null));
      api.util.invalidateTags(['AuthUser']);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  useEffect(() => {
    document.documentElement.dir = 'ltr';
    const handleClickOutside = (e: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
        setShowCart(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (user?.role === 'admin' || user?.role === 'seller') return null;

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur text-black dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <img src="/logo.png" alt="Logo" className="w-8 h-8" />
          <span className="text-xl font-bold">Shop</span>
        </div>

        {/* Center Section */}
        <div className="flex-1 flex items-center justify-center gap-6 max-w-3xl">
          <div className="flex-1">
            <SearchBox />
          </div>
          <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive
                    ? 'border-b-2 border-black dark:border-white pb-1'
                    : 'hover:text-black dark:hover:text-white transition'
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right Section - Desktop */}
        <div className="hidden md:flex items-center gap-4 relative">
          <ThemeToggle />

          {/* Wishlist Icon */}
          <NavLink to="/wishlist" className="relative">
            <Heart className="w-6 h-6 hover:text-red-600 transition" />
            {wishlist.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-xs rounded-full px-1.5 text-white">
                {wishlist.length}
              </span>
            )}
          </NavLink>

          {/* Cart Icon */}
          <div className="relative">
            <button onClick={() => setShowCart(!showCart)} className="relative">
              <ShoppingCart className="w-6 h-6" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-xs rounded-full px-1.5 text-white">
                  {cartItems.length}
                </span>
              )}
            </button>
            {showCart && (
              <div
                ref={cartRef}
                className="absolute right-0 top-10 z-50 w-80 bg-white dark:bg-gray-800 rounded shadow-lg p-4"
              >
                <h3 className="font-semibold mb-2">Cart</h3>
                {cartItems.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Your cart is empty.</p>
                ) : (
                  <ul className="space-y-3 max-h-64 overflow-y-auto">
                    {cartItems.map((item, index) => (
                      <li key={index} className="flex justify-between items-center text-sm">
                        <div className="flex flex-col">
                          <span className="font-medium">{item.name}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              onClick={() => dispatch(decreaseQuantity(item.productId))}
                              className="px-2 bg-gray-200 dark:bg-gray-700 rounded"
                            >
                              -
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              onClick={() => dispatch(increaseQuantity(item.productId))}
                              className="px-2 bg-gray-200 dark:bg-gray-700 rounded"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span>${item.price * item.quantity}</span>
                          <button
                            onClick={() => dispatch(removeFromCart(item.productId))}
                            className="text-xs text-red-500 mt-1"
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  onClick={() => navigate('/orders/create')}
                  className="mt-4 w-full bg-black text-white px-3 py-2 rounded hover:bg-neutral-800 text-sm"
                >
                  Go to Checkout
                </button>
              </div>
            )}
          </div>

          {user ? (
            <>
              <NavLink
                to="/profile"
                className="flex items-center gap-1 text-sm hover:text-black dark:hover:text-white"
              >
                <User className="w-5 h-5" /> Profile
              </NavLink>
              <button onClick={handleLogout} className="text-sm hover:text-red-500">
                {loggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="text-sm hover:text-black dark:hover:text-white">
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="text-sm bg-black text-white px-3 py-1 rounded hover:bg-neutral-800"
              >
                Sign Up
              </NavLink>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden relative">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 text-black dark:text-white px-4 py-4 space-y-2 border-t dark:border-gray-700">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="block border-b pb-1 border-gray-200 dark:border-gray-700"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}

          <ThemeToggle />

          <NavLink to="/wishlist" className="flex items-center gap-2">
            <Heart className="w-5 h-5" /> Wishlist
          </NavLink>

          <div className="relative">
            <button onClick={() => setShowCart(!showCart)} className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" /> Cart
              {cartItems.length > 0 && (
                <span className="ml-1 bg-red-600 text-white text-xs rounded-full px-1.5">
                  {cartItems.length}
                </span>
              )}
            </button>

            {showCart && (
              <div
                ref={cartRef}
                className="mt-3 z-50 w-full bg-white dark:bg-gray-800 rounded shadow-lg p-4"
              >
                <h3 className="font-semibold mb-2">Cart</h3>
                {cartItems.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Your cart is empty.</p>
                ) : (
                  <ul className="space-y-3 max-h-64 overflow-y-auto">
                    {cartItems.map((item, index) => (
                      <li key={index} className="flex justify-between items-center text-sm">
                        <div className="flex flex-col">
                          <span className="font-medium">{item.name}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              onClick={() => dispatch(decreaseQuantity(item.productId))}
                              className="px-2 bg-gray-200 dark:bg-gray-700 rounded"
                            >
                              -
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              onClick={() => dispatch(increaseQuantity(item.productId))}
                              className="px-2 bg-gray-200 dark:bg-gray-700 rounded"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span>${item.price * item.quantity}</span>
                          <button
                            onClick={() => dispatch(removeFromCart(item.productId))}
                            className="text-xs text-red-500 mt-1"
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  onClick={() => {
                    navigate('/orders/create');
                    setMenuOpen(false);
                    setShowCart(false);
                  }}
                  className="mt-4 w-full bg-black text-white px-3 py-2 rounded hover:bg-neutral-800 text-sm"
                >
                  Go to Checkout
                </button>
              </div>
            )}
          </div>

          {user ? (
            <>
              <NavLink to="/profile" className="flex items-center gap-2">
                <User className="w-5 h-5" /> Profile
              </NavLink>
              <button onClick={handleLogout} className="text-red-500 text-sm">
                {loggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="text-sm">
                Login
              </NavLink>
              <NavLink to="/register" className="text-sm">
                Sign Up
              </NavLink>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
