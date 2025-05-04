import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "../../axiosInstance";
import styles from "./Login.module.css";

const Login = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const checkToken = async () => {
      try {
        const response = await axios.get("/api/user", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const role = response.data.data.role;

        if (role === "admin" || role === "super_admin") {
          navigate("/admin");
        } else {
          navigate("/home");
        }
      } catch (error) {
        localStorage.removeItem("token");
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
      const response = await axios.post("/api/login", values);
      localStorage.setItem("token", response.data.token);

      const userResponse = await axios.get("/api/user", {
        headers: {
          Authorization: `Bearer ${response.data.token}`,
          Accept: "application/json",
        },
      });

      const role = userResponse.data.data.role;
      console.log("User Role:", role);

      if (role === "admin" || role === "super_admin") {
        navigate("/admin");
      } else {
        navigate("/home");
      }

    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.socialLogin}>
        <button
          className={`${styles.btn} ${styles.google}`}
          onClick={() => {
            window.location.href = "/api/auth/google";
          }}
        >
          Login with Google
        </button>

        <button
          className={`${styles.btn} ${styles.facebook}`}
          onClick={() => {
            window.location.href = "https://127.0.0.1:8000/api/auth/facebook/callback";
          }}
        >
          Login with Facebook
        </button>
      </div>

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
