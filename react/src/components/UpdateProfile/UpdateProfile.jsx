import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./UpdateProfile.module.css"; // 🔹 استيراد CSS module

const UpdateProfile = () => {
  const [profile, setProfile] = useState({
    name: "محمد أحمد",
    email: "mohamed@example.com",
    image: "/images/default-profile.png",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("تم تحديث الملف الشخصي بنجاح! 🚀");
  };

  return (
    <section className={styles.updateProfile}>
      <h1 className={styles.title}>تحديث الملف الشخصي / Update Profile</h1>

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className={styles.imageBox}>
          <img
            src={selectedImage || profile.image}
            alt="صورة المستخدم"
            className={styles.profileImage}
          />
        </div>

        <div className={styles.flex}>
          <div className={styles.inputBox}>
            <span>اسم المستخدم / Username:</span>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              placeholder="أدخل اسم المستخدم الجديد / Enter new username"
              required
              className={styles.box}
            />

            <span>البريد الإلكتروني / Email:</span>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              placeholder="أدخل البريد الإلكتروني الجديد / Enter new email"
              required
              className={styles.box}
            />

            <span>تحديث الصورة / Update Image:</span>
            <input
              type="file"
              name="image"
              accept="image/jpg, image/jpeg, image/png"
              className={styles.box}
              onChange={handleImageChange}
            />
          </div>

          <div className={styles.inputBox}>
            <span>كلمة المرور القديمة / Old Password:</span>
            <input
              type="password"
              name="oldPassword"
              value={profile.oldPassword}
              onChange={handleChange}
              placeholder="أدخل كلمة المرور القديمة / Enter old password"
              className={styles.box}
            />

            <span>كلمة المرور الجديدة / New Password:</span>
            <input
              type="password"
              name="newPassword"
              value={profile.newPassword}
              onChange={handleChange}
              placeholder="أدخل كلمة المرور الجديدة / Enter new password"
              className={styles.box}
            />

            <span>تأكيد كلمة المرور / Confirm Password:</span>
            <input
              type="password"
              name="confirmPassword"
              value={profile.confirmPassword}
              onChange={handleChange}
              placeholder="أدخل تأكيد كلمة المرور / Confirm new password"
              className={styles.box}
            />
          </div>
        </div>

        <div className={styles.flexBtn}>
          <input type="submit" className={styles.btn} value="تحديث الملف الشخصي / Update Profile" />
          <Link to="/" className={styles.optionBtn}>العودة إلى الصفحة الرئيسية / Back to Home</Link>
        </div>
      </form>
    </section>
  );
};

export default UpdateProfile;
