import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User } from "lucide-react";
import axios from "../../axiosInstance";
import styles from "./header.module.css";

const Header = () => {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const profileDropdownRef = useRef(null);
  const profileButtonRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axios.get("http://127.0.0.1:8000/api/user", {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            signal,
          });
          console.log("User data:", response.data); // Log data for debugging
          setUser(response.data);
        } catch (error) {
          if (error.name !== "AbortError") {
            console.error("Error loading user data:", error);
          }
        }
      }
    };

    const fetchCartItems = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/cart", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Accept: "application/json",
          },
        });
        const items = response.data.cart || [];
        setCartItems(items.length);
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    };

    fetchUser();
    fetchCartItems();

    return () => {
      controller.abort();
    };
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.post(
        "http://127.0.0.1:8000/api/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      localStorage.removeItem("token");
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handlePayPalPayment = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); // إذا لم يكن هناك token، يوجه إلى صفحة الدخول
    } else {
      // تابع عملية الدفع عبر PayPal هنا
    }
  };

  return (
    <header className={`${styles.header} bg-white shadow-sm py-3 border-bottom`}>
      <div className={styles.container}>
        <Link to="/home" className={`${styles.logo} text-decoration-none text-primary fw-bold fs-4`}>
          MyPharmacy
        </Link>

        <nav className="d-flex gap-3">
          <Link to="/Medications" className={styles.navLink}>Medications</Link>
          <Link to="/orders" className={styles.navLink}>Orders</Link>
          <Link to="/about" className={styles.navLink}>About Us</Link>
          <Link to="/contact" className={styles.navLink}>Contact</Link>
        </nav>

        <div className="d-flex align-items-center gap-3">
          <Link to="/cart" className={`${styles.cartIcon} position-relative text-dark`}>
            <ShoppingCart size={28} />
            {cartItems > 0 && <span className={styles.badge}>{cartItems}</span>}
          </Link>

          <div className="position-relative">
            <button
              ref={profileButtonRef}
              className="btn p-0 border-0 bg-transparent"
              onClick={() => {
                setShowProfile(!showProfile);
              }}
            >
              {user?.data?.image ? (
                <img
                  src={`http://127.0.0.1:8000/storage/${user.data.image}`}
                  alt="User"
                  className="rounded-circle"
                  style={{ width: "40px", height: "40px", objectFit: "cover" }}
                />
              ) : (
                <User size={28} />
              )}
            </button>

            {showProfile && user && (
              <div ref={profileDropdownRef} className={styles.profile}>
                <p className="fw-bold">{user.name}</p>
                <Link to="/profile" className="btn btn-primary btn-sm w-100">
                  Update Profile
                </Link>
                <button className="btn btn-danger btn-sm mt-2 w-100" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
