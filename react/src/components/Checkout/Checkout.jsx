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
      try {
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
      } catch (error) {
        console.error('Error fetching cart items:', error);
      }
    };

    fetchCartItems();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');

    if (paymentStatus === 'paypal_success') {
      handleOrderSubmit(null, 'paid');
    } else if (paymentStatus === 'paypal_error') {
      toast.error('فشل الدفع عبر PayPal');
    }
  }, []);

  const handleOrderSubmit = async (event, paymentStatusFromPayPal = null) => {
    if (event) event.preventDefault();

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const formattedAddress = `${address.flat}, ${address.city}, ${address.country}`;
      if (!formattedAddress || !address.city || !address.country || !address.flat) {
        return;
      }

      if (cartItems.length === 0) {
        return;
      }

      let paymentStatus = 'unpaid';

      if (paymentStatusFromPayPal) {
        paymentStatus = paymentStatusFromPayPal;
      }

      const orderData = {
        order_number: `ORD-${Date.now()}`,
        address: formattedAddress,
        delivery_address: formattedAddress,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
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
        await axios.post('/cart/clear', {}, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        setCartItems([]);
        navigate('/orders');
      }
    } catch (error) {
      console.error('Order submission failed:', error.response?.data?.errors || error.message);
    }
  };

  const handlePayWithPaypal = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('يرجى تسجيل الدخول أولاً');
        navigate('/login');
        return;
      }

      const res = await axios.get('/api/paypal/payment', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        validateStatus: (status) => status >= 200 && status < 400,
      });

      if (res.status === 302 && res.headers.location) {
        window.location.href = res.headers.location;
      } else {
        toast.error('فشل بدء عملية الدفع');
      }
    } catch (error) {
      if (error.response && error.response.status === 302 && error.response.headers.location) {
        window.location.href = error.response.headers.location;
      } else {
        toast.error('حدث خطأ أثناء الاتصال بـ PayPal');
      }
    }
  };

  return (
    <div className={styles.checkoutPage}>
      <div className={styles.container}>
        <h2>إتمام الطلب</h2>

        <form
          onSubmit={(e) => handleOrderSubmit(e)}
          className={styles.checkoutForm}
        >
          <div className={styles.formGroup}>
            <label>طريقة الدفع</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              required
            >
              <option value="">اختار طريقة الدفع</option>
              <option value="cash_on_delivery">الدفع عند الاستلام</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>العنوان</label>
            <input
              type="text"
              placeholder="مثال: 123 Main Street, New York"
              value={address.flat}
              onChange={(e) =>
                setAddress({ ...address, flat: e.target.value })
              }
              required
            />
          </div>

          <div className={styles.formGroup}>
            <input
              type="text"
              placeholder="المدينة"
              value={address.city}
              onChange={(e) =>
                setAddress({ ...address, city: e.target.value })
              }
              required
            />
          </div>

          <div className={styles.formGroup}>
            <input
              type="text"
              placeholder="الدولة"
              value={address.country}
              onChange={(e) =>
                setAddress({
                  ...address,
                  country: e.target.value,
                })
              }
              required
            />
          </div>

          {paymentMethod !== 'paypal' && (
            <button type="submit" className={styles.btn}>
              إتمام الطلب
            </button>
          )}
        </form>

        {paymentMethod === 'paypal' && (
          <button onClick={handlePayWithPaypal} className={styles.btn}>
            الدفع عبر PayPal
          </button>
        )}
      </div>
    </div>
  );
};

export default Checkout;
