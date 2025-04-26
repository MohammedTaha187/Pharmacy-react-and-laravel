import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import styles from "./Login.module.css";

const Login = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return; // مفيش توكن، خلاص كمل عادي

    const checkToken = async () => {
      try {
        await axios.get("http://127.0.0.1:8000/api/user", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        navigate("/home"); // التوكن صحيح، دخله على الهوم
      } catch (error) {
        console.error("❌ Invalid token:", error);
        localStorage.removeItem("token"); // لو التوكن بايظ، امسحه
      }
    };

    checkToken();
  }, [navigate]);


  const initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email format").required("Email is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    setError("");
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login", values);

      console.log("Login Successful:", response.data);

      // حفظ التوكن في localStorage
      localStorage.setItem("token", response.data.token);

      // إعادة تحميل الصفحة لضمان أن التوكن يعمل في جميع الطلبات
      window.location.href = "/home";
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <div className={styles.loginContainer}>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ isSubmitting }) => (
          <Form className={styles.form}>
            <h3>Login to Pharmacy</h3>

            {error && <div className={styles.error}>{error}</div>}

            <div>
              <Field type="email" name="email" placeholder="Enter your email" className={styles.box} />
              <ErrorMessage name="email" component="div" className={styles.error} />
            </div>

            <div>
              <Field type="password" name="password" placeholder="Enter your password" className={styles.box} />
              <ErrorMessage name="password" component="div" className={styles.error} />
            </div>

            <button type="submit" className={styles.btn} disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login Now"}
            </button>

            <p>Don't have an account? <Link to="/register">Create one now</Link></p>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Login;
