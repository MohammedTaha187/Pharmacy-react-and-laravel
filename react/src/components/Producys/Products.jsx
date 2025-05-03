import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "../../axiosInstance";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [addingToCartId, setAddingToCartId] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    setError("🚫 No token found. Please login first.");
                    setLoading(false);
                    return;
                }

                const searchParams = new URLSearchParams(location.search);
                const categoryId = searchParams.get("category");

                let apiUrl = "/api/products";
                if (categoryId) {
                    apiUrl += `?category=${categoryId}`;
                }

                const response = await axios.get(apiUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });

                setProducts(response.data.data);
            } catch (err) {
                if (err.response) {
                    setError(err.response.data.message || "⚠️ Unauthorized access.");
                } else {
                    setError("⚠️ Failed to load products.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [location.search]);

    const handleAddToCart = async (productId) => {
        try {
            setAddingToCartId(productId);

            const token = localStorage.getItem("token");
            if (!token) {
                alert("🚫 Please login first to add products to your cart.");
                return;
            }

            const response = await axios.post(
                "/api/cart",
                {
                    product_id: productId,
                    quantity: 1,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            alert("✅ Product added to cart successfully!");

        } catch (err) {
            if (err.response?.data?.message) {
                alert(`❌ ${err.response.data.message}`);
            } else {
                alert("❌ Failed to add to cart. Please try again.");
            }
        } finally {
            setAddingToCartId(null);
        }
    };

    return (
        <div className="container py-5">
            <h1 className="mb-4 text-primary">Products</h1>

            {loading && (
                <div className="row">
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className="col-md-4 col-sm-6 mb-4">
                            <div className="card h-100 shadow-sm placeholder-card">
                                <div className="skeleton-img"></div>
                                <div className="card-body d-flex flex-column justify-content-between">
                                    <div className="skeleton-text mb-2" style={{ width: "80%", height: "20px" }}></div>
                                    <div className="skeleton-text mb-3" style={{ width: "60%", height: "16px" }}></div>
                                    <div className="skeleton-button mt-auto"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {error && <p className="text-danger">{error}</p>}

            <div className="row">
                {products.length > 0 ? (
                    products.map((product) => (
                        <div key={product.id} className="col-md-4 col-sm-6 mb-4">
                            <div className="card h-100 shadow-sm">
                                <img
                                    src={product.image}
                                    alt={product.name?.en || "Product"}
                                    className="card-img-top"
                                    style={{ height: "200px", objectFit: "cover" }}
                                />
                                <div className="card-body d-flex flex-column justify-content-between">
                                    <h5 className="card-title">{product.name?.en}</h5>
                                    <p className="card-text fw-bold">Price: {product.price} EGP</p>

                                    <button
                                        className="btn btn-primary mt-auto"
                                        onClick={() => handleAddToCart(product.id)}
                                        disabled={addingToCartId === product.id}
                                    >
                                        {addingToCartId === product.id ? "Adding..." : "Add to Cart"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    !loading && !error && <p>No products found.</p>
                )}
            </div>

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
