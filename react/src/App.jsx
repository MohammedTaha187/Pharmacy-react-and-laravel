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
import Products from './components/Producys/Products';
import QuickView from './components/QuickView/QuickView';
import Checkout from './components/Checkout/Checkout';
import SocialAuth from './SocialAuth';
import AdminLayout from './components/dashboard/Layout/AdminLayout';
import AdminHome from './components/dashboard/Home/AdminHome';
import AdminProduct from './components/dashboard/Product/AdminProduct';
import AdminOrder from './components/dashboard/Orders/AdminOrders';
import AdminUsers from './components/dashboard/User/AdminUsers';
import AdminMessages from './components/dashboard/Contact/AdminContact';

const routes = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "", element: <Login /> },
      { path: "home", element: <Home /> },
      { path: "Medications", element: <Categories /> },
      { path: "products", element: <Products /> },
      { path: "orders", element: <Orders /> },
      { path: "about", element: <About /> },
      { path: "contact", element: <Contact /> },
      { path: "cart", element: <ShoppingCart /> },
      { path: "profile", element: <UpdateProfile /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "quickView/:productId", element: <QuickView /> },
      { path: "checkout", element: <Checkout /> },
      { path: "social-auth", element: <SocialAuth /> },
    ],
  },
  {
    path: "/admin", element: <AdminLayout />, children: [
      { path: "", element: <AdminHome /> },
      { path: "products", element: <AdminProduct /> },
      {path: "orders", element: <AdminOrder /> },
      {path: "users", element: <AdminUsers /> },
      {path: "messages", element: <AdminMessages /> },
    ],
  },
]);

function App() {
    return <RouterProvider router={routes} />;
}

export default App;
