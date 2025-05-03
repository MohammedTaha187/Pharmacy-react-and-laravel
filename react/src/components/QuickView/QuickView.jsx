import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "../../axiosInstance";
import { PuffLoader } from "react-spinners";
import "bootstrap/dist/css/bootstrap.min.css";
import "./QuickView.module.css";

export default function QuickView() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("🚫 Please login first.");
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://127.0.0.1:8000/api/products/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        setProduct(response.data.data);
      } catch (err) {
        console.error("❌ Error fetching product:", err);
        setError("❌ Failed to load product.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    try {
      setAddingToCart(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("🚫 Please login first to add products to your cart.");
        return;
      }

      await axios.post(
        "http://127.0.0.1:8000/api/cart",
        {
          product_id: productId,
          quantity: quantity,
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
      console.error("❌ Error adding to cart:", err);
      alert("❌ Product already in cart");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
        <PuffLoader color="#0d6efd" size={80} />
      </div>
    );
  }

  if (error) {
    return <p className="text-danger text-center">{error}</p>;
  }

  if (!product) {
    return <p className="text-muted text-center">🚫 No product found.</p>;
  }

  return (
    <section className="quick-view container py-5">
      <h1 className="mb-5 text-center text-primary">Quick view</h1>

      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="d-flex justify-content-center">
              <img
                src={product.image || "/images/placeholder.png"}
                alt={product.name?.en || "Product"}
                className="card-img-top"
                style={{ width: "100%", height: "300px", objectFit: "cover" }}
                onError={(e) => (e.target.src = "/images/placeholder.png")}
              />
            </div>
            <div className="card-body text-center">
              <h3 className="card-title mb-3">{product.name?.en || "Unnamed Product"}</h3>
              <p className="card-text">{product.description?.en || "لا توجد تفاصيل متاحة."}</p>
              <div className="price mb-3">
                <strong>السعر:</strong> {product.price} EGP
              </div>

              <form onSubmit={handleAddToCart} className="d-flex flex-column gap-3">
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="form-control"
                />
                <button type="submit" className="btn btn-primary" disabled={addingToCart}>
                  {addingToCart ? "جاري الإضافة..." : "أضف إلى السلة 🛒"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
