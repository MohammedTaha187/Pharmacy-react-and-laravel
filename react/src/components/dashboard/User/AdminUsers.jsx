import React, { useState, useEffect } from "react";
import axios from "../../../axiosInstance";
import { Toaster, toast } from "react-hot-toast";
import styles from "./AdminUsers.module.css";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/users");
      setUsers(response.data.data);
    } catch (error) {
      toast.error("فشل في تحميل البيانات");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (userId) => {
    if (window.confirm("هل تريد حذف هذا المستخدم؟")) {
      try {
        await axios.delete(`/api/user/${userId}`);

        toast.success("تم حذف المستخدم بنجاح");
        fetchUsers();
      } catch (error) {
        toast.error("فشل في حذف المستخدم");
        console.error(error);
      }
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await axios.put("/api/user/update", { id: userId, role: newRole });
      toast.success("تم تحديث الدور بنجاح");
      fetchUsers();
    } catch (error) {
      toast.error("فشل في تحديث الدور");
      console.error(error);
    }
  };

  return (
    <div className={styles.dashboard}>
      <Toaster position="top-center" reverseOrder={false} />
      <h1 className={styles.title}>حسابات المستخدمين</h1>
      {loading ? (
        <div className={styles.loader}>جاري تحميل البيانات...</div>
      ) : (
        <div className={styles["user-accounts"]}>
          <div className={styles["box-container"]}>
            {users.map((user) => (
              <div
                key={user.id}
                className={`${styles.box} ${user.id === user.admin_id ? styles.hidden : ""}`}
              >
                <img src={`http://127.0.0.1:8000/storage/${user.image}`} alt="صورة المستخدم" />
                <p>معرف المستخدم: <span>{user.id}</span></p>
                <p>اسم المستخدم: <span>{user.name}</span></p>
                <p>البريد الإلكتروني: <span>{user.email}</span></p>

                <p>الدور: 
                  <span>
                    {user.role === "super_admin"
                      ? "مدير عام"
                      : user.role === "admin"
                      ? "مشرف"
                      : "مستخدم عادي"}
                  </span>
                </p>

                <div>
                  <label htmlFor={`role-${user.id}`}>تغيير الدور: </label>
                  <select
                    id={`role-${user.id}`}
                    value={user.role}
                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                    className={styles["select-role"]}
                  >
                    <option value="user">مستخدم عادي</option>
                    <option value="admin">مشرف</option>
                    <option value="super_admin">مدير عام</option>
                  </select>
                </div>

                <button
                  onClick={() => deleteUser(user.id)}
                  className={styles["delete-btn"]}
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
