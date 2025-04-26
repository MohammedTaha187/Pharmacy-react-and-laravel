import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../../axiosInstance"; 
import "bootstrap/dist/css/bootstrap.min.css";
import { PuffLoader } from "react-spinners"; // 🔹 تحميل مؤشر التحميل

export default function Home() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [lang, setLang] = useState("en"); // اللغة الافتراضية: الإنجليزية

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(
                    "http://127.0.0.1:8000/api/categories"
                );
                console.log("API Response:", response.data);
                setCategories(response.data.data); // تخزين البيانات كما هي
            } catch (err) {
                console.error("Error fetching categories:", err);
                setError("⚠️ Failed to load categories.");
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return (
        <div className="container text-center py-5">
            {/* عنوان الصفحة */}
            <h1 className="display-4 fw-bold text-primary">
                Your Trusted Online Pharmacy
            </h1>
            <p className="lead text-secondary">
                Discover a wide range of medicines and healthcare products.
            </p>

            {/* صندوق البحث */}
            <form className="input-group my-4 w-50 mx-auto">
                <input
                    type="text"
                    className="form-control border-primary"
                    placeholder="🔍 Search for products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">
                    Search
                </button>
            </form>

            {/* معالجة حالة التحميل */}
            {loading && (
                <div className="my-5 d-flex justify-content-center">
                    <PuffLoader color="#0d6efd" size={80} />
                </div>
            )}

            {/* معالجة الأخطاء */}
            {error && <p className="text-danger fw-bold">{error}</p>}

            {/* عرض التصنيفات */}
            <div className="row g-4">
                {!loading && !error && categories.length > 0
                    ? categories.map((cat) => (
                          <div key={cat.id} className="col-md-3">
                              <div className="card h-100 shadow-lg border-0 rounded-4 overflow-hidden position-relative">
                                  <img
                                      src={
                                          cat.image || "/images/placeholder.png"
                                      }
                                      className="card-img-top object-fit-cover"
                                      alt={
                                          cat.name?.[lang] ?? "Unnamed Category"
                                      }
                                      style={{
                                          height: "180px",
                                          transition: "transform 0.3s ease",
                                      }}
                                      onError={(e) => {
                                          e.target.src =
                                              "/images/placeholder.png";
                                      }} // صورة افتراضية عند الخطأ
                                  />
                                  <div className="card-body text-center">
                                      <h5 className="card-title text-primary fw-bold">
                                          {cat.name?.[lang] ??
                                              "Unnamed Category"}
                                      </h5>
                                      <p className="card-text text-muted">
                                          {cat.desc?.[lang] ??
                                              "No description available."}
                                      </p>
                                      <Link
                                          to={`/products?category=${cat.id}`}
                                          className="btn btn-outline-primary w-100"
                                      >
                                          Explore{" "}
                                          {cat.name?.[lang] ??
                                              "Unnamed Category"}
                                      </Link>
                                  </div>
                              </div>
                          </div>
                      ))
                    : !loading &&
                      !error && (
                          <p className="text-muted fw-bold my-5">
                              🚫 No categories available.
                          </p>
                      )}
            </div>
        </div>
    );
}
