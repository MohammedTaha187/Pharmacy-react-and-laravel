import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../axiosInstance";
import "bootstrap/dist/css/bootstrap.min.css";
import { PuffLoader } from "react-spinners";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [lang, setLang] = useState("en");
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // التحقق من وجود التوكن
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); // إذا لم يكن هناك توكن، اعادة التوجيه إلى صفحة التسجيل
      return;
    }

    // تحميل التصنيفات
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/categories");
        console.log("API Response:", response.data);
        setCategories(response.data.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("⚠️ Failed to load categories.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (search.trim() !== "") {
        console.log("Searching for:", search); // تحقق من القيمة المرسلة

        try {
          const response = await axios.get(
            `http://127.0.0.1:8000/api/products/search?query=${search}`
          );

          console.log("Products Search Response:", response.data);
          setProducts(response.data.data);
        } catch (err) {
          console.error("Error searching products:", err);
          setError("⚠️ Failed to search products.");
        }
      } else {
        setProducts([]); // إذا كانت خانة البحث فارغة، أعد تعيين المنتجات
      }
    };

    fetchProducts();
  }, [search]); // Trigger search when `search` changes

  return (
    <div className="container text-center py-5">
      <h1 className="display-4 fw-bold text-primary">
        Your Trusted Online Pharmacy
      </h1>
      <p className="lead text-secondary">
        Discover a wide range of medicines and healthcare products.
      </p>

      <form
        className="homeSearchForm input-group my-4 w-50 mx-auto"
        onSubmit={(e) => e.preventDefault()} // Prevent form submission
      >
        <input
          type="text"
          className="form-control border-primary"
          placeholder="🔍 Search for products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)} // Update search state on input change
        />
        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </form>

      {loading && (
        <div className="my-5 d-flex justify-content-center">
          <PuffLoader color="#0d6efd" size={80} />
        </div>
      )}

      {error && <p className="text-danger fw-bold">{error}</p>}

      <div className="row g-4">
        {!loading && !error && categories.length > 0
          ? categories.map((cat) => (
              <div key={cat.id} className="col-md-3">
                <div
                  className="card h-100 shadow border-0 rounded-4 overflow-hidden position-relative"
                  style={{ transition: "transform 0.3s ease" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.03)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  <img
                    src={cat.image || "/images/placeholder.png"}
                    className="card-img-top object-fit-cover"
                    alt={cat.name?.[lang] ?? "Unnamed Category"}
                    style={{
                      height: "180px",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.target.src = "/images/placeholder.png";
                    }}
                  />
                  <div className="card-body text-center">
                    <h5 className="card-title text-primary fw-bold">
                      {cat.name?.[lang] ?? "Unnamed Category"}
                    </h5>
                    <p className="card-text text-muted">
                      {cat.desc?.[lang] ?? "No description available."}
                    </p>
                    <Link
                      to={`/products?category=${cat.id}`}
                      className="btn btn-outline-primary w-100"
                    >
                      Explore {cat.name?.[lang] ?? "Unnamed Category"}
                    </Link>
                  </div>
                </div>
              </div>
            ))
          : !loading &&
            !error && (
              <p className="text-muted fw-bold my-5">🚫 No categories available.</p>
            )}
      </div>

      <div className="row g-4 mt-5">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="col-md-3">
              <div className="card">
                <img
                  src={product.image || "/images/placeholder.png"}
                  className="card-img-top"
                  alt={product.name?.[lang] ?? "Unnamed Product"}
                />
                <div className="card-body">
                  <h5 className="card-title">{product.name?.[lang]}</h5>
                  <p className="card-text">{product.desc?.[lang]}</p>
                  <p className="card-text text-muted">${product.price}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted">No products found for your search.</p>
        )}
      </div>
    </div>
  );
}
