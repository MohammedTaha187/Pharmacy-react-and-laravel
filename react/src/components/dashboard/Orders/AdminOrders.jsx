import React, { useState, useEffect } from "react";
import axios from "../../../axiosInstance";
import { Toaster, toast } from "react-hot-toast";
import styles from "./AdminOrder.module.css";

const AdminOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // جلب البيانات من الـ API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/orders");
      setOrders(res.data.data);
    } catch (err) {
      toast.error("فشل في تحميل الطلبات");
      console.error(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId, status) => {
    setLoading(true);
    try {
      const response = await axios.put(`/api/orders/status/${orderId}`, {
        status,
      });
      if (response.data.message) {
        toast.success("تم تحديث حالة الطلب!");
        fetchOrders();
      }
    } catch (err) {
      toast.error("فشل في تحديث الحالة");
      console.error(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الطلب؟")) return;
    try {
      await axios.delete(`/api/orders/${orderId}`);
      toast.success("تم حذف الطلب بنجاح"); // التوستر عند الحذف بنجاح
      fetchOrders();
    } catch (err) {
      toast.error("فشل في حذف الطلب"); // التوستر عند فشل الحذف
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <div className={styles.dashboard}>
      <Toaster />
      <h1 className={styles.title}>الطلبات المقدمة</h1>
      {loading ? (
        <div className={styles.loader}>جاري تحميل البيانات...</div>
      ) : (
        <div className={styles["placed-orders"]}>
          <div className={styles["box-container"]}>
            {orders.map((order) => (
              <div key={order.id} className={`${styles.box} ${styles.fadeIn}`}>
                <p className={styles["order-number"]}>
                  رقم الطلب: {order.order_number}
                </p>
                <p className={styles["payment-method"]}>
                  طريقة الدفع: {order.payment_method}
                </p>
                <p className={styles["price"]}>
                  السعر: ${order.products?.reduce((sum, product) => {
                    return sum + parseFloat(product.price) * product.quantity;
                  }, 0).toFixed(2)}
                </p>
                <p className={styles["payment-status"]}>
                  حالة الدفع:{" "}
                  <span
                    style={{
                      color: order.payment_status === "unpaid" ? "red" : "green",
                    }}
                  >
                    {order.payment_status}
                  </span>
                </p>
                <div
                  className={`${styles.status} ${styles[`status_${order.status.toLowerCase()}`]}`}
                >
                  {order.status}
                </div>
                <div className={styles.actions}>
                  <button
                    className={styles["option-btn"]}
                    onClick={() =>
                      updateOrderStatus(
                        order.id,
                        order.status === "pending" ? "shipped" : "delivered"
                      )
                    }
                  >
                    {order.status === "pending"
                      ? "تحديد كـ في الطريق"
                      : "تحديد كمكتمل"}
                  </button>
                  <button
                    className={styles["delete-btn"]}
                    onClick={() => deleteOrder(order.id)} // التفعيل هنا
                  >
                    حذف
                  </button>
                </div>

                <div>
                  <h4>تفاصيل المنتجات:</h4>
                  <ul>
                    {order.products?.map((product, index) => {
                      let name = "";
                      try {
                        const parsed = JSON.parse(product.name);
                        name = parsed.ar || parsed.en || product.name;
                      } catch (e) {
                        name = product.name;
                      }

                      return (
                        <li key={index}>
                          {name} × {product.quantity} = $
                          {(parseFloat(product.price) * product.quantity).toFixed(2)}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrder;
