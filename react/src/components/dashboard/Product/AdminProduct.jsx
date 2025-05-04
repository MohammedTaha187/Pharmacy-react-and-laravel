import React, { useState, useEffect } from "react";
import axios from "../../../axiosInstance";
import styles from "./AdminProduct.module.css";

function AdminProduct() {
  const [formData, setFormData] = useState({
    nameAr: "",
    nameEn: "",
    category: "",
    price: "",
    discountedPrice: "",
    descriptionAr: "",
    descriptionEn: "",
    quantity: "",
    image: null,
  });
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // State to manage loading
  const [loadingSubmit, setLoadingSubmit] = useState(false); // State to manage submit loading

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Set loading to true while fetching
        const [productsRes, categoriesRes] = await Promise.all([
          axios.get("/api/products", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/api/categories", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setProducts(productsRes.data?.data || []);
        setCategories(categoriesRes.data?.data || []);
      } catch {
        alert("حدث خطأ أثناء التحميل");
      } finally {
        setLoading(false); // Set loading to false once data is fetched
      }
    };

    fetchData();
  }, [token]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true); // Show loader while submitting

    const data = new FormData();
    data.append("name_en", formData.nameEn);
    data.append("name_ar", formData.nameAr);
    data.append("price", formData.price);
    data.append("discounted_price", formData.discountedPrice);
    data.append("desc_en", formData.descriptionEn);
    data.append("desc_ar", formData.descriptionAr);
    data.append("category_id", formData.category);
    data.append("quantity", formData.quantity);
    data.append("image", formData.image);
    data.append("status", formData.status ? 1 : 0);

    try {
      await axios.post("/api/products", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("تمت الإضافة بنجاح");

      // Refresh data
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get("/api/products", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("/api/categories", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setProducts(productsRes.data?.data || []);
      setCategories(categoriesRes.data?.data || []);
      setFormData({
        nameAr: "",
        nameEn: "",
        category: "",
        price: "",
        discountedPrice: "",
        descriptionAr: "",
        descriptionEn: "",
        quantity: "",
        image: null,
        status: true,
      });
    } catch (err) {
      alert("حدث خطأ أثناء الإضافة");
    } finally {
      setLoadingSubmit(false); // Hide loader after submitting
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف المنتج؟")) return;
    try {
      await axios.delete(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const productsRes = await axios.get("/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(productsRes.data?.data || []);
    } catch {
      alert("فشل حذف المنتج");
    }
  };

  const getCategoryName = (product) => {
    try {
      const cat = JSON.parse(product.category_id);
      return cat?.ar || "غير معروف";
    } catch {
      return "غير معروف";
    }
  };

  return (
    <div className={styles.dashboard}>
      <h2 className={styles.title}>إضافة منتج جديد</h2>

      <form className={styles.addForm} onSubmit={handleSubmit}>
        {/* Input fields */}
        <input type="text" name="nameAr" placeholder="اسم المنتج بالعربية" value={formData.nameAr} onChange={handleChange} required />
        <input type="text" name="nameEn" placeholder="اسم المنتج بالإنجليزية" value={formData.nameEn} onChange={handleChange} required />
        <textarea name="descriptionAr" placeholder="وصف المنتج بالعربية" value={formData.descriptionAr} onChange={handleChange} required></textarea>
        <textarea name="descriptionEn" placeholder="وصف المنتج بالإنجليزية" value={formData.descriptionEn} onChange={handleChange} required></textarea>
        <input type="number" name="price" placeholder="السعر" value={formData.price} onChange={handleChange} required />
        <input type="number" name="discountedPrice" placeholder="السعر المخفض" value={formData.discountedPrice} onChange={handleChange} required />
        <input type="number" name="quantity" placeholder="الكمية" value={formData.quantity} onChange={handleChange} required />
        <select name="category" value={formData.category} onChange={handleChange} required>
          <option value="">اختر الفئة</option>
          {Array.isArray(categories) && categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name?.ar}</option>)}
        </select>
        <input type="file" name="image" onChange={handleChange} accept="image/*" required />
        <button className={styles.btn} type="submit" disabled={loadingSubmit}>
          {loadingSubmit ? "جاري الإضافة..." : "إضافة المنتج"}
        </button>
      </form>

      <h2 className={styles.title}>المنتجات المضافة</h2>

      {loading ? (
        <div className={styles.loader}>Loading...</div> // Display loader while loading products
      ) : (
        <div className={styles.boxContainer}>
          {products.length ? (
            products.map((product) => (
              <div className={`${styles.box} ${styles.fadeIn}`} key={product.id}> {/* Apply fadeIn effect */}
                <img src={product.image} alt={product.name?.ar} className={styles.productImage} />
                <h3>{product.name?.ar}</h3>
                <p>{getCategoryName(product)}</p>
                <p className={styles.price}>السعر: {product.price} ج.م</p>
                <p>{product.description || "لا يوجد تفاصيل"}</p>
                <div className={styles.actions}>
                  <a href={`/admin/update-product/${product.id}`} className={styles.btn}>تحديث</a>
                  <button className={`${styles.btn} ${styles.danger}`} onClick={() => handleDelete(product.id)}>حذف</button>
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: "center" }}>لا توجد منتجات حالياً.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminProduct;
