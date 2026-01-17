import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './components/Home/Home';
import Orders from './components/Order/Orders';
import About from './components/About-Us/About';
import Contact from './components/Contact/Contact';
import Categories from './components/Medications/Categories';
import ShoppingCart from './components/ShoppingCart/ShoppingCart';
import UpdateProfile from './components/UpdateProfile/UpdateProfile';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Products from './components/Products/Products';
import QuickView from './components/QuickView/QuickView';
import Checkout from './components/Checkout/Checkout';
import SocialAuth from './SocialAuth';
import AdminLayout from './components/dashboard/Layout/AdminLayout';
import AdminHome from './components/dashboard/Home/AdminHome';
import AdminProduct from './components/dashboard/Product/AdminProduct';
import AdminOrder from './components/dashboard/Orders/AdminOrders';
import AdminUsers from './components/dashboard/User/AdminUsers';
import AdminMessages from './components/dashboard/Contact/AdminContact';
import ProtectedRoute from './components/ProtectedRoute';

const routes = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "", element: <Login /> },
      { path: "home", element: <ProtectedRoute><Home /></ProtectedRoute> },
      { path: "Medications", element: <ProtectedRoute><Categories /></ProtectedRoute> },
      { path: "products", element: <ProtectedRoute><Products /></ProtectedRoute> },
      { path: "orders", element: <ProtectedRoute><Orders /></ProtectedRoute> },
      { path: "about", element: <ProtectedRoute><About /></ProtectedRoute> },
      { path: "contact", element: <ProtectedRoute><Contact /></ProtectedRoute> },
      { path: "cart", element: <ProtectedRoute><ShoppingCart /></ProtectedRoute> },
      { path: "profile", element: <ProtectedRoute><UpdateProfile /></ProtectedRoute> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "quickView/:productId", element: <ProtectedRoute><QuickView /></ProtectedRoute> },
      { path: "checkout", element: <ProtectedRoute><Checkout /></ProtectedRoute> },
      { path: "social-auth", element: <SocialAuth /> },
    ],
  },
  {
    path: "/admin", element: <ProtectedRoute><AdminLayout /></ProtectedRoute>, children: [
      { path: "", element: <ProtectedRoute><AdminHome /></ProtectedRoute> },
      { path: "products", element: <ProtectedRoute><AdminProduct /></ProtectedRoute> },
      { path: "orders", element: <ProtectedRoute><AdminOrder /></ProtectedRoute> },
      { path: "users", element: <ProtectedRoute><AdminUsers /></ProtectedRoute> },
      { path: "messages", element: <ProtectedRoute><AdminMessages /></ProtectedRoute> },
    ],
  },
]);

function App() {
  return <RouterProvider router={routes} />;
}

export default App;
