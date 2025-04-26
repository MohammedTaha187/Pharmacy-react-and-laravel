import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User } from "lucide-react";
import axios from "../../axiosInstance";
import "bootstrap/dist/css/bootstrap.min.css";

const Header = () => {
    const [user, setUser] = useState(null);
    const [cartItems, setCartItems] = useState(0);
    const [showProfile, setShowProfile] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const response = await axios.get(
                    "http://127.0.0.1:8000/api/cart",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    }
                );

                // عدد المنتجات في السلة
                const items = response.data.cart_items || [];
                setCartItems(items.length);
            } catch (error) {
                console.error("Error fetching cart items:", error);
            }
        };

        fetchCartItems();
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

    // إغلاق القائمة عند الضغط خارجها
    useEffect(() => {
        const handleClickOutside = (event) => {
            const profileMenu = document.getElementById("profile-dropdown");
            const profileButton = document.getElementById("profile-button");

            if (
                profileMenu &&
                !profileMenu.contains(event.target) &&
                profileButton &&
                !profileButton.contains(event.target)
            ) {
                setShowProfile(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <header className="bg-white shadow-sm py-3 border-bottom">
            <div className="container d-flex justify-content-between align-items-center">
                {/* Logo */}
                <Link
                    to="home"
                    className="text-decoration-none text-primary fw-bold fs-4"
                >
                    MyPharmacy
                </Link>

                {/* Navigation */}
                <nav className="d-flex gap-3">
                    <Link to="/Medications" className="nav-link text-dark">
                        Medications
                    </Link>
                    <Link to="/orders" className="nav-link text-dark">
                        Orders
                    </Link>
                    <Link to="/about" className="nav-link text-dark">
                        About Us
                    </Link>
                    <Link to="/contact" className="nav-link text-dark">
                        Contact
                    </Link>
                </nav>

                {/* Icons */}
                <div className="d-flex align-items-center gap-3">
                    {/* Cart Icon */}
                    <Link to="/cart" className="position-relative text-dark">
                        <ShoppingCart size={28} />
                        {cartItems > 0 && (
                            <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">
                                {cartItems}
                            </span>
                        )}
                    </Link>

                    {/* User Icon with Dropdown */}
                    <div className="position-relative">
                    <button
    id="profile-button"
    className="btn btn-outline-primary rounded-circle"
    onClick={() => {
        setShowProfile(!showProfile);
        console.log("Show Profile:", !showProfile);
    }}
>
    <User size={28} />
</button>


                        {showProfile && user && (
                            <div
                                id="profile-dropdown"
                                className="position-absolute end-0 mt-2 p-3 bg-white shadow rounded text-center"
                                style={{
                                    width: "200px",
                                    zIndex: 1050,
                                    top: "100%",
                                }}
                            >
                                <img
                                    src={
                                        user.image
                                            ? `http://127.0.0.1:8000/${user.image}`
                                            : "https://via.placeholder.com/50"
                                    }
                                    alt="User"
                                    className="rounded-circle mb-2"
                                    width="50"
                                />

                                <p className="fw-bold">{user.name}</p>
                                <Link
                                    to="/profile"
                                    className="btn btn-primary btn-sm w-100"
                                >
                                    Update Profile
                                </Link>
                                <button
                                    className="btn btn-danger btn-sm mt-2 w-100"
                                    onClick={handleLogout}
                                >
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
