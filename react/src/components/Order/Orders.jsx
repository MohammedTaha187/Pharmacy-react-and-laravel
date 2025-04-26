import { useState, useEffect } from "react";
import axios from "../../axiosInstance"; 
import "./orders.css"; // استيراد ملف التصميم

const Orders = () => {
  const [orders, setOrders] = useState([]); // البيانات ستكون فارغة في البداية
  const [loading, setLoading] = useState(true); // حالة لتحميل البيانات
  const [error, setError] = useState(null); // حالة للتعامل مع الأخطاء

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token'); // تأكد من الحصول على التوكن من localStorage
        if (!token) {
          setError('You are not authenticated.');
          setLoading(false);
          return;
        }

        const response = await axios.get("http://127.0.0.1:8000/api/orders", {
          headers: {
            'Authorization': `Bearer ${token}` // إرسال التوكن مع الطلب
          }
        });
        setOrders(response.data); // تخزين البيانات في الـ state
      } catch (err) {
        setError('Error fetching orders');
        console.error(err);
      } finally {
        setLoading(false); // عند انتهاء تحميل البيانات
      }
    };

    fetchOrders();
  }, []); // تأكد من تشغيله مرة واحدة عند تحميل الـ component

  return (
    <section className="placed-orders">
      <h1 className="title">Placed Orders</h1>
      <div className="box-container">
        {loading ? (
          <p>Loading...</p> // عرض رسالة التحميل
        ) : error ? (
          <p className="error">{error}</p> // عرض رسالة الخطأ إذا كانت موجودة
        ) : orders.length > 0 ? (
          orders.map((order) => (
            <div key={order.order_id} className="box">
              <p>Ordered on: <span>{order.created_at}</span></p>
              <p>Name: <span>{order.name}</span></p>
              <p>Email: <span>{order.email}</span></p>
              <p>Payment Method: <span>{order.pay_method}</span></p>
              <p>Total Products: <span>{order.total_products}</span></p>
              <p>Total Price: <span>${order.total_price}/-</span></p>
              <p>Payment Status:
                <span style={{ color: order.payment_status === "pending" ? "red" : "green" }}>
                  {order.payment_status}
                </span>
              </p>

              {/* Rating Form */}
              <form>
                <label htmlFor={`rating-${order.order_id}`}>Rate this order:</label>
                <select id={`rating-${order.order_id}`} name="rating">
                  <option value="1">⭐ 1 Star</option>
                  <option value="2">⭐⭐ 2 Stars</option>
                  <option value="3">⭐⭐⭐ 3 Stars</option>
                  <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                  <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                </select>
                <button type="submit">Submit Rating</button>
              </form>

              {/* Display Rating */}
              <p>Rating: <span>{order.rating ? `${order.rating} ⭐` : "Not Rated Yet"}</span></p>
            </div>
          ))
        ) : (
          <p className="empty">No orders placed yet!</p> // عرض رسالة إذا لم تكن هناك طلبات
        )}
      </div>
    </section>
  );
};

export default Orders;
