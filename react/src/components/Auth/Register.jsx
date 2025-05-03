import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import styles from "./Register.module.css";

const Register = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/home");
    }
  }, [navigate]);

  const initialValues = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    image: null,
  };

  const validationSchema = Yup.object({
    name: Yup.string().min(3, "Name must be at least 3 characters").required("Name is required"),
    email: Yup.string().email("Invalid email format").required("Email is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm Password is required"),
    image: Yup.mixed().test("fileType", "Only images are allowed", (value) => {
      return !value || (value && ["image/jpeg", "image/png", "image/jpg", "image/gif"].includes(value.type));
    }),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    setError("");

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("email", values.email);
    formData.append("password", values.password);
    formData.append("password_confirmation", values.confirmPassword);

    if (values.image) {
      formData.append("image", values.image);
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      localStorage.setItem("token", response.data.token);
      window.location.href = "/home";
    } catch (err) {
      console.log("API Error:", err.response?.data);
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    }

    setSubmitting(false);
  };

  return (
    <div className={styles.registerContainer}>
      {/* ✅ أزرار التسجيل بجوجل وفيسبوك */}
      <div className={styles.socialLogin}>
        <button
          className={`${styles.btn} ${styles.google}`}
          onClick={() => {
            window.location.href = "http://127.0.0.1:8000/api/auth/google"; // ✅ صح كده
          }}
        >
          Register with Google
        </button>

        <button
          className={`${styles.btn} ${styles.facebook}`}
          onClick={() => {
            window.location.href = "https://127.0.0.1:8000/api/auth/facebook/callback"; // ✅ صح كده
          }}
        >
          Register with Facebook
        </button>
      </div>

      {/* ✅ نموذج التسجيل العادي */}
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ setFieldValue, isSubmitting }) => (
          <Form className={styles.form}>
            <h3>Create an Account</h3>

            {error && <div className={styles.error}>{error}</div>}

            <div>
              <Field type="text" name="name" placeholder="Enter your name" className={styles.box} />
              <ErrorMessage name="name" component="div" className={styles.error} />
            </div>

            <div>
              <Field type="email" name="email" placeholder="Enter your email" className={styles.box} />
              <ErrorMessage name="email" component="div" className={styles.error} />
            </div>

            <div>
              <Field type="password" name="password" placeholder="Enter your password" className={styles.box} />
              <ErrorMessage name="password" component="div" className={styles.error} />
            </div>

            <div>
              <Field type="password" name="confirmPassword" placeholder="Confirm your password" className={styles.box} />
              <ErrorMessage name="confirmPassword" component="div" className={styles.error} />
            </div>

            <div>
              <input
                type="file"
                name="image"
                accept="image/*"
                className={styles.box}
                onChange={(event) => setFieldValue("image", event.currentTarget.files[0])}
              />
              <ErrorMessage name="image" component="div" className={styles.error} />
            </div>

            <button type="submit" className={styles.btn} disabled={isSubmitting}>
              {isSubmitting ? "Registering..." : "Register Now"}
            </button>

            <p>Already have an account? <Link to="/login">Login here</Link></p>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Register;
