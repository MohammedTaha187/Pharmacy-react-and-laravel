import { useState, useEffect } from "react";
import axios from "../../axiosInstance";
import "./Orders.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);  // State للتحقق من التحميل
  const [error, setError] = useState(null);
  const [ratings, setRatings] = useState({}); // لتخزين كل Rating لكل أوردر

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You are not authenticated.');
          setLoading(false);
          return;
        }

        const response = await axios.get("http://127.0.0.1:8000/api/orders", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Response:', response.data);

        if (response.data && response.data.data) {
          setOrders(response.data.data); // ✅ تصحيح هنا
        } else {
          setOrders([]);
        }

      } catch (err) {
        setError('Error fetching orders');
        console.error(err.response?.data || err.message);
      } finally {
        setLoading(false); // تأكد من إيقاف اللودينج بعد تحميل البيانات
      }
    };

    fetchOrders();
  }, []);

  const handleRatingChange = (orderId, value) => {
    setRatings((prev) => ({
      ...prev,
      [orderId]: value
    }));
  };

  const handleRatingSubmit = async (e, orderId) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      await axios.post(`http://127.0.0.1:8000/api/orders/${orderId}/rate`, {
        rating: ratings[orderId],
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      alert("Rating submitted successfully!");

    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Failed to submit rating.");
    }
  };

  const handleCancelOrder = async (orderId) => {
    const token = localStorage.getItem('token');

    try {
      const response = await axios.delete(`http://127.0.0.1:8000/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        setOrders((prevOrders) => prevOrders.filter(order => order.id !== orderId));
        alert("Order cancelled successfully!");
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Failed to cancel the order.");
    }
  };

  return (
    <section className="placed-orders">
      <h1 className="title">Placed Orders</h1>

      {/* في حالة التحميل */}
      {loading ? (
        <div className="loadingContainer">
          <div className="loadingSpinner"></div>
          <p>Loading orders...</p>
        </div>
      ) : (
        <div className="box-container">
          {error ? (
            <p className="error">{error}</p>
          ) : orders.length > 0 ? (
            orders.map((order) => (
              <div key={order.id} className="box">
                <p>Ordered on: <span>{order.created_at}</span></p>
                <p>Order Number: <span>{order.order_number}</span></p>
                <p>Status: <span>{order.status}</span></p>
                <p>Payment Method: <span>{order.payment_method}</span></p>
                <p>Payment Status:
                  <span style={{ color: order.payment_status === "unpaid" ? "red" : "green" }}>
                    {order.payment_status}
                  </span>
                </p>

                <div className="products">
                  <h3>Products:</h3>
                  {order.products && order.products.length > 0 ? (
                    order.products.map((product, index) => (
                      <div key={index} className="product-item">
                        <p>Product Name: <span>{JSON.parse(product.name).en}</span></p>
                        <p>Quantity: <span>{product.quantity}</span></p>
                        <p>Price: <span>${product.price}</span></p>
                      </div>
                    ))
                  ) : (
                    <p>No products found.</p>
                  )}
                </div>

                {/* Rating Form */}
                <form onSubmit={(e) => handleRatingSubmit(e, order.id)}>
                  <label htmlFor={`rating-${order.id}`}>Rate this order:</label>
                  <select
                    id={`rating-${order.id}`}
                    name="rating"
                    value={ratings[order.id] || ''}
                    onChange={(e) => handleRatingChange(order.id, e.target.value)}
                  >
                    <option value="">Select Rating</option>
                    <option value="1">⭐ 1 Star</option>
                    <option value="2">⭐⭐ 2 Stars</option>
                    <option value="3">⭐⭐⭐ 3 Stars</option>
                    <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                    <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                  </select>
                  <button type="submit">Submit Rating</button>
                </form>

                {/* Show Rating if exists */}
                <p>Rating: <span>{order.rating ? `${order.rating} Stars` : "Not Rated Yet"}</span></p>

                {/* Cancel Order Button */}
                <button onClick={() => handleCancelOrder(order.id)} className="cancel-btn">
                  Cancel Order
                </button>

              </div>
            ))
          ) : (
            <p className="empty">No orders placed yet!</p>
          )}
        </div>
      )}
    </section>
  );
};

export default Orders;
