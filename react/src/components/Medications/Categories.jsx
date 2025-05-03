import { useState, useEffect } from "react";
import axios from "../../axiosInstance";
import { Link } from "react-router-dom";  // 🔥
import { PuffLoader } from "react-spinners"; // 🔥
import "bootstrap/dist/css/bootstrap.min.css";

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("🚫 Please login first.");
                    setLoading(false);
                    return;
                }

                const response = await axios.get("http://127.0.0.1:8000/api/products", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });

                setProducts(response.data.data);
            } catch (err) {
                console.error("❌ Error fetching products:", err);
                setError("❌ Failed to load products.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className="container py-5">
            {/* العنوان في النص */}
            <h1 className="mb-4 text-primary text-center">All Products</h1>

            {/* تحميل - Spinner */}
            {loading && (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
                    <PuffLoader color="#0d6efd" size={80} />
                </div>
            )}

            {/* عرض الأخطاء */}
            {error && !loading && <p className="text-danger text-center">{error}</p>}

            {/* عرض المنتجات */}
            {!loading && !error && (
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

                                        {/* هنا رابط View Details */}
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
        </div>
    );
}
