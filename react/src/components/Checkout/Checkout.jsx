import React, { useState, useEffect } from 'react';
import axios from '../../axiosInstance';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import styles from './Checkout.module.css';

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [address, setAddress] = useState({
    flat: '',
    city: '',
    country: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartItems = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('/api/cart', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const items = response.data.cart || [];
      setCartItems(items);
    };

    fetchCartItems();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('status');
    const hasSubmitted = sessionStorage.getItem('order_submitted');

    if (paymentStatus === 'success' && !hasSubmitted) {
      sessionStorage.setItem('order_submitted', 'true');
      toast.success('تم الدفع بنجاح عبر PayPal 🎉');
      setCartItems([]);
      sessionStorage.removeItem('checkout_address');
      setTimeout(() => {
        navigate('/orders');
      }, 1500);
    } else if (paymentStatus === 'cancelled') {
      toast.error('تم إلغاء الدفع عبر PayPal');
    } else if (paymentStatus === 'unauthorized') {
      toast.error('لم يتم التعرف على المستخدم');
    } else if (paymentStatus === 'empty_cart') {
      toast.error('السلة فارغة');
    } else if (paymentStatus === 'missing_address') {
      toast.error('لم يتم إرسال العنوان إلى PayPal');
    }
  }, []);

  const handleOrderSubmit = async (event) => {
    if (event) event.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (!address.flat || !address.city || !address.country) {
      toast.error('يرجى إدخال العنوان بالكامل');
      return;
    }

    const formattedAddress = `${address.flat}, ${address.city}, ${address.country}`;
    if (cartItems.length === 0) return;

    const orderData = {
      order_number: `ORD-${Date.now()}`,
      address: formattedAddress,
      delivery_address: formattedAddress,
      payment_method: paymentMethod,
      payment_status: 'unpaid',
      status: 'pending',
      items: cartItems.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      })),
    };

    const response = await axios.post('/api/orders', orderData, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (response && response.data) {
      await axios.post('/api/cart/clear', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      setCartItems([]);
      sessionStorage.removeItem('order_submitted');

      toast.success('تم إنشاء الطلب بنجاح 🎉', {
        duration: 4000,
        style: {
          border: '1px solid #4CAF50',
          padding: '16px',
          color: '#4CAF50',
          background: '#f0fff0',
        },
        iconTheme: {
          primary: '#4CAF50',
          secondary: '#fff',
        },
      });

      setTimeout(() => {
        navigate('/orders');
      }, 1500);
    }
  };

  const handlePayWithPaypal = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('يرجى تسجيل الدخول أولاً');
      navigate('/login');
      return;
    }
  
    if (!address.flat || !address.city || !address.country) {
      toast.error('يرجى إدخال العنوان بالكامل قبل الدفع');
      return;
    }
  
    sessionStorage.setItem('checkout_address', JSON.stringify(address));
  
    try {
      const formattedAddress = `${address.flat}, ${address.city}, ${address.country}`;
  
      const res = await axios.get('/api/paypal/payment', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        params: {
          address: formattedAddress,
        },
      });
  
      const approvalUrl = res.data.approval_url;
      if (approvalUrl) {
        window.location.href = approvalUrl;
      } else {
        toast.error('لم يتم الحصول على رابط الدفع من PayPal');
      }
    } catch (error) {
      console.error(error);
      toast.error('حدث خطأ أثناء معالجة الدفع');
    }
  };

  return (
    <div className={styles.checkoutPage}>
      <div className={styles.container}>
        <h2>إتمام الطلب</h2>

        <form onSubmit={(e) => handleOrderSubmit(e)} className={styles.checkoutForm}>
          <div className={styles.formGroup}>
            <label>طريقة الدفع</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              required
            >
              <option value="">اختار طريقة الدفع</option>
              <option value="paypal">PayPal</option>
              <option value="cash_on_delivery">الدفع عند الاستلام</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>العنوان</label>
            <input
              type="text"
              name="flat"
              placeholder="رقم الشقة"
              value={address.flat}
              onChange={(e) =>
                setAddress((prev) => ({ ...prev, flat: e.target.value }))
              }
              required
            />
            <input
              type="text"
              name="city"
              placeholder="المدينة"
              value={address.city}
              onChange={(e) =>
                setAddress((prev) => ({ ...prev, city: e.target.value }))
              }
              required
            />
            <input
              type="text"
              name="country"
              placeholder="الدولة"
              value={address.country}
              onChange={(e) =>
                setAddress((prev) => ({ ...prev, country: e.target.value }))
              }
              required
            />
          </div>

          {paymentMethod === 'paypal' ? (
            <div>
              <button type="button" onClick={handlePayWithPaypal}>
                الدفع عبر PayPal
              </button>
            </div>
          ) : (
            <div>
              <button type="submit">تأكيد الطلب</button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Checkout;
