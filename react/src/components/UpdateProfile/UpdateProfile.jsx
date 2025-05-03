import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../../axiosInstance";
import styles from "./UpdateProfile.module.css";

const UpdateProfile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    image: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("التوكن غير موجود، الرجاء تسجيل الدخول.");
        return;
      }

      try {
        const response = await axios.get("/api/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const user = response.data.data;

        setProfile({
          name: user.name,
          email: user.email,
          image: user.image,
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } catch {
        setError("فشل في جلب البيانات، يرجى المحاولة لاحقًا.");
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const token = localStorage.getItem("token");
    if (!token) {
      alert("التوكن غير موجود، الرجاء تسجيل الدخول.");
      return;
    }
  
    // التحقق إذا كان المستخدم قد سجل عبر جوجل أو فيسبوك
    const isSocialLogin = !profile.oldPassword; // إذا كانت كلمة المرور القديمة فارغة، نعتبر أن التسجيل كان عبر حساب اجتماعي
  
    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("name", profile.name);
    formData.append("email", profile.email);
  
    // إذا كان المستخدم قد سجل عبر جوجل أو فيسبوك، لا نحتاج كلمة المرور القديمة
    if (!isSocialLogin) {
      formData.append("oldPassword", profile.oldPassword);
    }
  
    formData.append("newPassword", profile.newPassword);
    formData.append("newPassword_confirmation", profile.confirmPassword);
  
    if (selectedImage) {
      formData.append("image", selectedImage);
    }
  
    try {
      await axios.post(
        "/api/user/update",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("تم تحديث الملف الشخصي بنجاح!");
    } catch {
      setError("فشل في تحديث البيانات، يرجى المحاولة لاحقًا.");
    }
  };
  

  return (
    <section className={styles.updateProfile}>
      <h1 className={styles.title}>تحديث الملف الشخصي / Update Profile</h1>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className={styles.imageBox}>
          <img
            src={
              selectedImage
                ? URL.createObjectURL(selectedImage)
                : profile.image
                ? `http://127.0.0.1:8000/storage/${profile.image}`
                : "/images/default-profile.png"
            }
            alt="صورة المستخدم"
            className={styles.profileImage}
          />
        </div>

        <div className={styles.flex}>
          <div className={styles.inputBox}>
            <span>اسم المستخدم:</span>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              required
              className={styles.box}
            />

            <span>البريد الإلكتروني:</span>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              required
              className={styles.box}
            />

            <span>تحديث الصورة:</span>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className={styles.box}
            />
          </div>

          <div className={styles.inputBox}>
            <span>كلمة المرور القديمة:</span>
            <input
              type="password"
              name="oldPassword"
              value={profile.oldPassword}
              onChange={handleChange}
              className={styles.box}
            />

            <span>كلمة المرور الجديدة:</span>
            <input
              type="password"
              name="newPassword"
              value={profile.newPassword}
              onChange={handleChange}
              className={styles.box}
            />

            <span>تأكيد كلمة المرور:</span>
            <input
              type="password"
              name="confirmPassword"
              value={profile.confirmPassword}
              onChange={handleChange}
              className={styles.box}
            />
          </div>
        </div>

        <div className={styles.flexBtn}>
          <input type="submit" value="تحديث الملف الشخصي" className={styles.btn} />
          <Link to="/" className={styles.optionBtn}>العودة للرئيسية</Link>
        </div>
      </form>
    </section>
  );
};

export default UpdateProfile;
