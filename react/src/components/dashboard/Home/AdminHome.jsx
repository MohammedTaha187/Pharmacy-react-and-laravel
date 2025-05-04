import React, { useEffect, useState } from "react";
import axios from "../../../axiosInstance";
import styles from "./Home-page.module.css";

function AdminHome() {
  const [data, setData] = useState({
    totalPendings: 0,
    totalCompleted: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalAdmins: 0,
    totalAccounts: 0,
    totalMessages: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    axios
      .get("/api/dashboard-stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => console.error(error));
  }, []);

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>لوحة التحكم</h1>

      <div className={styles.boxContainer}>
        {Object.keys(data).map((key, index) => {
          return (
            <div className={styles.box} key={index}>
              <h3>{data[key]}</h3>
              <p>{key.replace(/([A-Z])/g, " $1").toLowerCase()}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AdminHome;
