import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../../axiosInstance";
import styles from "./ShoppingCart.module.css";

const ShoppingCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get("api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const items = response.data.cart.map((item) => ({
        id: item.id,
        cartItemId: item.id,
        productId: item.product.id,
        name: item.product.name.en,
        price: item.product.price,
        image: item.product.image,
        quantity: item.quantity,
      }));

      setCartItems(items);
    } catch (error) {
      console.error("❌ Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const grandTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const updateQuantity = async (cartItemId, newQty) => {
    try {
      const token = localStorage.getItem("token");
  
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
        )
      );
  
      await axios.put(`/api/cart/${cartItemId}`, {
        quantity: newQty,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
  
      fetchCart();
    } catch (error) {
      console.error("❌ Error updating quantity:", error);
    }
  };
  
  const removeFromCart = async (cartItemId) => {
    try {
      const token = localStorage.getItem("token");
  
      setCartItems(prevItems =>
        prevItems.filter(item => item.cartItemId !== cartItemId)
      );
  
      await axios.delete(`/api/cart/${cartItemId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
  
      fetchCart();
    } catch (error) {
      console.error("❌ Error removing item:", error);
    }
  };
  
  const clearCart = async () => {
    try {
      const token = localStorage.getItem("token");
  
      await axios.post("/api/cart/clear", {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
  
      setCartItems([]);
    } catch (error) {
      console.error("❌ Error clearing cart:", error);
    }
  };

  if (loading) {
    return (
      <div className="text-center">
        <div className={styles.loadingSpinner}></div>
        <p>Loading cart...</p>
      </div>
    );
  }

  return (
    <section className={styles.shoppingCart}>
      <h1 className={styles.title}>Shopping Cart</h1>

      <div className={styles.boxContainer}>
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <div key={item.cartItemId} className={styles.box}>
              <Link to={`/quickView/${item.productId}`} className="fas fa-eye"></Link>

              <img src={item.image} alt={item.name} />
              <div className={styles.name}>{item.name}</div>
              <div className={styles.price}>{item.price} EGP</div>
              <div className={styles.flexBtn}>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  className={styles.qty}
                  onChange={(e) => updateQuantity(item.cartItemId, Number(e.target.value))}
                />
                <button
                  className={styles.deleteBtn}
                  onClick={() => removeFromCart(item.cartItemId)}
                >
                  Remove
                </button>
              </div>
              <div className={styles.subTotal}>
                Subtotal: <span>{item.price * item.quantity} EGP</span>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.empty}>Your cart is empty</p>
        )}
      </div>

      <div className={styles.cartTotal}>
        <p>Total: <span>{grandTotal} EGP</span></p>
        <Link to="/medications" className={styles.optionBtn}>Continue Shopping</Link>

        {cartItems.length > 0 ? (
          <>
            <button
              className={styles.deleteBtn}
              onClick={clearCart}
            >
              Clear Cart
            </button>
            <Link
              to="/checkout"
              className={styles.btn}
            >
              Checkout
            </Link>
          </>
        ) : (
          <>
            <button className={`${styles.deleteBtn} ${styles.disabled}`} disabled>
              Clear Cart
            </button>
            <button className={`${styles.btn} ${styles.disabled}`} disabled>
              Checkout
            </button>
          </>
        )}
      </div>
    </section>
  );
};

export default ShoppingCart;
