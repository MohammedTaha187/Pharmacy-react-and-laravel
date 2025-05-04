// src/components/admin/AdminHeader.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import axios from "../../../axiosInstance";
import styles from "./adminHeader.module.css";

const AdminHeader = () => {
  const [admin, setAdmin] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();

    const fetchAdmin = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await axios.get("/api/user", {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            signal: controller.signal,
          });
          setAdmin(res.data); 
        } catch (error) {
          if (!axios.isCancel(error)) {
            console.error("Admin load error", error);
          }
        }
      }
    };

    fetchAdmin();
    return () => controller.abort();
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await axios.post("/api/logout", {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  useEffect(() => {
    const closeDropdown = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

  return (
    <header className={`${styles.header} bg-dark text-white py-3 shadow-sm`}>
      <div className={styles.container}>
        <Link to="/admin" className="text-white fw-bold fs-4 text-decoration-none">
          Admin<span className="text-warning">Panel</span>
        </Link>

        <nav className="d-flex gap-3">
          <Link to="/admin/products" className={styles.navLink}>Products</Link>
          <Link to="/admin/orders" className={styles.navLink}>Orders</Link>
          <Link to="/admin/users" className={styles.navLink}>Users</Link>
          <Link to="/admin/messages" className={styles.navLink}>Messages</Link>
        </nav>

        <div className="d-flex align-items-center gap-3">
          <div className="position-relative">
            <button
              ref={buttonRef}
              className="btn p-0 border-0 bg-transparent"
              onClick={() => setShowProfile(!showProfile)}
            >
              {admin?.data?.image ? (
                <img
                  src={`http://127.0.0.1:8000/storage/${admin.data.image}`}
                  alt="Admin"
                  className="rounded-circle"
                  style={{ width: "40px", height: "40px", objectFit: "cover" }}
                />
              ) : (
                <User size={28} color="#fff" />
              )}
            </button>

            {showProfile && (
              <div ref={dropdownRef} className={styles.profile}>
                <p className="fw-bold mb-2">{admin?.data?.name}</p>
                <Link to="/admin/update-profile" className="btn btn-primary btn-sm w-100">
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

export default AdminHeader;
