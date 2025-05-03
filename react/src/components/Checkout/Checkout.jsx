import React, { useState, useEffect } from 'react';
import axios from '../../axiosInstance'; // تأكد إن ده المسار الصحيح للـ axiosInstance
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; // للتنبيه في حالة حدوث أي خطأ
import styles from './Checkout.module.css';

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
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

        const response = await axios.get('http://127.0.0.1:8000/api/cart', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        const items = response.data.cart || [];
        setCartItems(items);

        const total = items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
        setCartTotal(total);
      } catch (error) {
        console.error('Error fetching cart items:', error);
      }
    };

    fetchCartItems();
  }, []);

  const handleOrderSubmit = async (event, paymentStatusFromPayPal = null) => {
    if (event) event.preventDefault();

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const formattedAddress = `${address.flat}, ${address.city}, ${address.country}`;
      if (!formattedAddress || !address.city || !address.country || !address.flat) {
        console.error('Address is incomplete');
        return;
      }

      if (cartItems.length === 0) {
        console.error('Cart is empty');
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
        payment_status: paymentStatus, // دايمًا موجود
        status: 'pending',
        items: cartItems.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
      };

      console.log('Order Data:', orderData);

      const response = await axios.post('http://127.0.0.1:8000/api/orders', orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (response && response.data) {
        console.log('Order Response:', response.data);

        await axios.post('/cart/clear', {}, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        setCartItems([]);
        navigate('/orders');
      } else {
        console.error('Unexpected response format:', response);
      }
    } catch (error) {
      console.error('Order submission failed:', error.response?.data?.errors || error.message);
    }
  };

  const handlePayWithPaypal = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://127.0.0.1:8000/api/paypal/payment', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400,
      });

      if (res.status === 302 && res.headers.location) {
        window.location.href = res.headers.location; // إعادة التوجيه إلى PayPal
      } else {
        toast.error('فشل بدء عملية الدفع');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء الاتصال بـ PayPal');
      console.error(error);
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
