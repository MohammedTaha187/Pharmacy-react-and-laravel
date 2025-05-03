import { useState, useEffect } from "react";
import axios from "../../axiosInstance";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                toast.error("🚫 Please login first.");
                setLoading(false);
                return;
            }

            await toast.promise(
                axios.get("/api/products", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }),
                {
                    loading: "⏳ Loading products...",
                    success: (res) => {
                        setProducts(res.data.data);

                        setTimeout(() => {
                            document.querySelectorAll(".card").forEach(card => {
                                card.classList.add("show-body");
                            });
                        }, 100);

                        return `✅ Loaded ${res.data.data.length} product(s).`;
                    },
                    error: (err) => {
                        console.error("❌ Error fetching products:", err);
                        return "❌ Failed to load products.";
                    },
                }
            );

            setLoading(false);
        };

        fetchProducts();
    }, []);

    return (
        <div className="container py-5">
            <h1 className="mb-4 text-primary text-center">All Products</h1>

            {/* Skeleton Loader أثناء التحميل */}
            {loading ? (
                <div className="row">
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className="col-md-4 col-sm-6 mb-4">
                            <div className="card h-100 shadow-sm placeholder-card">
                                <div className="skeleton-img"></div>
                                <div className="card-body text-center d-flex flex-column">
                                    <div className="skeleton-text mb-2" style={{ width: "80%", height: "20px" }}></div>
                                    <div className="skeleton-text mb-3" style={{ width: "60%", height: "16px" }}></div>
                                    <div className="skeleton-button mt-auto"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="row">
                    {products.length > 0 ? (
                        products.map((product) => (
                            <div key={product.id} className="col-md-4 col-sm-6 mb-4">
                                <div className="card h-100 shadow-sm">
                                    <img
                                        src={product.image || "/images/placeholder.png"}
                                        alt={product.name?.en || "Product"}
                                        className="card-img-top"
                                        style={{ height: "200px", objectFit: "cover" }}
                                        onError={(e) => (e.target.src = "/images/placeholder.png")}
                                    />
                                    <div className="card-body text-center d-flex flex-column">
                                        <h5 className="card-title">{product.name?.en || "Unnamed Product"}</h5>
                                        <p className="card-text fw-bold">Price: {product.price} EGP</p>
                                        <Link to={`/quickView/${product.id}`} className="btn btn-primary mt-auto">
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-muted text-center">🚫 No products available.</p>
                    )}
                </div>
            )}

            {/* CSS داخلي للـ Skeleton Loader */}
            <style>{`
                .placeholder-card {
                    border-radius: 16px;
                    overflow: hidden;
                    background-color: #f0f0f0;
                    animation: pulse 1.5s infinite;
                }

                .skeleton-img {
                    height: 200px;
                    background: linear-gradient(90deg, #e0e0e0 25%, #f7f7f7 50%, #e0e0e0 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite linear;
                }

                .skeleton-text,
                .skeleton-button {
                    background: linear-gradient(90deg, #e0e0e0 25%, #f7f7f7 50%, #e0e0e0 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite linear;
                    border-radius: 4px;
                }

                .skeleton-text {
                    margin: 0 auto;
                }

                .skeleton-button {
                    width: 50%;
                    height: 36px;
                    margin: 0 auto;
                    border-radius: 20px;
                }

                @keyframes shimmer {
                    0% {
                        background-position: -200% 0;
                    }
                    100% {
                        background-position: 200% 0;
                    }
                }
            `}</style>
        </div>
    );
}
