import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../../axiosInstance"; 
import "./Categories.css";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/categories");
        console.log("API Response:", response.data);
        setCategories(response.data.data); // تحديث الفئات بالبيانات المستلمة
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="categories">
      <h2 className="categories-title">Categories</h2>

      {/* عرض رسالة التحميل */}
      {loading && <p className="text-primary">Loading categories...</p>}

      {/* عرض رسالة الخطأ إن وجدت */}
      {error && <p className="text-danger">{error}</p>}

      {/* عرض الفئات عند جلب البيانات بنجاح */}
      {!loading && !error && (
        <div className="categories-container">
          {categories.length > 0 ? (
            categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug ?? category.id}`} // استخدام slug إذا كان متوفرًا
                className="category-box"
              >
                {category.name?.en ?? "Unnamed Category"}
              </Link>
            ))
          ) : (
            <p className="text-muted">No categories available.</p>
          )}
        </div>
      )}
    </section>
  );
};

export default Categories;
