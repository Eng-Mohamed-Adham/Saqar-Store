import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/SellersideBar'; // تأكد من المسار الصحيح
import { AppProvider } from './providers/AppProviders';


import { getSocket } from './socket';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from './app/store';

import Login from './features/auth/login';
import Register from './features/auth/register';
import Unauthorized from './services/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';
import ProductList from './components/products/productList';
import ProductAdd from './components/products/productAdd';
import ProductEdit from './components/products/productEdit';
import ProductDelete from './components/products/productDelete';
import OfferList from './components/offers/offersList';
import OfferAdd from './components/offers/offerAdd';
import OfferEdit from './components/offers/offerEdit';
import ProductDetails from './components/products/productDetails';
import CreateOrderPage from './components/orders/ordersAdd';
import MyOrdersPage from './components/orders/ordersList';
import SellerOrders from './components/orders/sellerOrders';
import UpdateOrderStatus from './components/orders/UpdateOrderStatus';
import DeleteOrder from './components/orders/ordersDelete';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccess from './pages/paymentSuccess';
import PaymentCancel from './pages/paymentCancle';
import ProfilePage from './components/users/profilePage';
import UserList from './components/users/userList';
import UserAdd from './components/users/UserAdd';
import UserEdit from './components/users/UserEdit';
import UserDelete from './components/users/UserDelete';
import AdminSideBar from './components/AdmiSideBar';
import StripeSuccess from './pages/StripeSuccess';
import Home from './pages/Home';
import ContactPage from './pages/contactPage';
import AdminContactList from './pages/AdminContactList';
import ConnectStripeButton from './pages/ConnectStripePage';
import AdminDashboard from './pages/adminDashboard';
import NotificationListener from './pages/NotificationListener';
import { Toaster } from 'react-hot-toast';
import AdminSellersPage from './pages/adminSellerBand';
import SellerPage from './pages/sellerPage';
import WishlistPage from './pages/WishlistPage';


function App() {
    const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const socket = getSocket();

    if (user && user.role === 'seller') {
      socket.emit('join', user.id);
    }

    // ✅ تنظيف الاتصال عند إغلاق الصفحة
    return () => {
      socket.disconnect();
    };
  }, [user?.id]);

  return (
    <AppProvider>
                    <Toaster position="top-left" reverseOrder={false} />

      <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white font-cairo">
        <Navbar />

        <NotificationListener /> {/* إضافة مكون الاستماع للإشعارات */}
        <div className="flex">
          <Sidebar />
          <AdminSideBar />
          
          <main className="flex-1 p-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/offers" element={<OfferList />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/profile" element={<ProtectedRoute allowedRoles={['user', 'seller', 'admin']}><ProfilePage /></ProtectedRoute>} />
              <Route path="/contact" element={<ProtectedRoute allowedRoles={['user', 'seller']}><ContactPage /></ProtectedRoute>} />
              <Route path="/sellers/:id" element={<ProtectedRoute allowedRoles={['user']} ><SellerPage /></ProtectedRoute>} />
              <Route path="/wishlist" element={<ProtectedRoute allowedRoles={['user']}><WishlistPage /></ProtectedRoute>} />
              
              {/* صلاحيات المستخدم */}
              {/* صلاحيات seller/admin */}
              <Route path="/products/add" element={<ProtectedRoute allowedRoles={['seller', 'admin']}><ProductAdd /></ProtectedRoute>} />
              <Route path="/products/edit/:id" element={<ProtectedRoute allowedRoles={['seller', 'admin']}><ProductEdit /></ProtectedRoute>} />
              <Route path="/products/delete/:id" element={<ProtectedRoute allowedRoles={['seller', 'admin']}><ProductDelete /></ProtectedRoute>} />

              <Route path="/offers/add" element={<ProtectedRoute allowedRoles={['seller']}><OfferAdd /></ProtectedRoute>} />
              <Route path="/offers/edit/:id" element={<ProtectedRoute allowedRoles={['seller', 'admin']}><OfferEdit /></ProtectedRoute>} />

              <Route path="/orders/create" element={<ProtectedRoute allowedRoles={['user', 'seller', 'admin']}><CreateOrderPage /></ProtectedRoute>} />
              <Route path="/orders/my" element={<ProtectedRoute  allowedRoles={['user', 'seller', 'admin']}><MyOrdersPage /></ProtectedRoute>} />
              <Route path="/orders/seller" element={<ProtectedRoute allowedRoles={['seller']}><SellerOrders /></ProtectedRoute>} />
              <Route path="/orders/:id" element={<ProtectedRoute allowedRoles={['seller']}><UpdateOrderStatus /></ProtectedRoute>} />
              <Route path="/orders/:id/delete" element={<ProtectedRoute allowedRoles={['seller', 'user']}><DeleteOrder /></ProtectedRoute>} />
              {/* <Route path="/orders/my/:id" element={<ProtectedRoute allowedRoles={['user', 'seller', 'admin']}><MyOrdersPage /></ProtectedRoute>} /> */}

              {/* صلاحيات admin */}
              <Route index path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']}><UserList /></ProtectedRoute>} />
              <Route path="/users/add" element={<ProtectedRoute allowedRoles={['admin']}><UserAdd /></ProtectedRoute>} />
              <Route path="/users/edit/:id" element={<ProtectedRoute allowedRoles={['admin']}><UserEdit /></ProtectedRoute>} />
              <Route path="/users/delete/:id" element={<ProtectedRoute allowedRoles={['admin']}><UserDelete /></ProtectedRoute>} />
              <Route path="/admin/messages" element={<ProtectedRoute allowedRoles={['admin']}><AdminContactList /></ProtectedRoute>} />
              <Route path="admin/sellers" element={<ProtectedRoute allowedRoles={['admin']}><AdminSellersPage /></ProtectedRoute>} />

              {/* الصفحات الأخرى */}
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/stripe/connect" element={<ProtectedRoute allowedRoles={['seller']}><ConnectStripeButton /></ProtectedRoute>} />
                <Route path="/success" element={<StripeSuccess />} />

              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/payment-cancel" element={<PaymentCancel />} />
             

            </Routes>
          </main>
        </div>
      </div>
    </AppProvider>
  );
}

export default App;
