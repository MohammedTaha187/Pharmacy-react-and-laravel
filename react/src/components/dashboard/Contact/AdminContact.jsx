import { useEffect, useState } from "react";
import axios from "../../../axiosInstance";
import styles from "./AdminContact.module.css";
import toast from "react-hot-toast";

const AdminMessages = () => {
  const [groupedConversations, setGroupedConversations] = useState([]);
  const [responseMap, setResponseMap] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get("/api/messages", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const messages = res.data;

        const grouped = {};
        messages.forEach((msg) => {
          const userId = msg.user.id;
          if (!grouped[userId]) {
            grouped[userId] = {
              user: msg.user,
              messages: [],
            };
          }
          grouped[userId].messages.push(msg);
        });

        // عكس ترتيب الرسائل بحيث تظهر القديمة فوق
        setGroupedConversations(Object.values(grouped).map(conv => ({
          ...conv,
          messages: conv.messages.reverse()  // عكس ترتيب الرسائل داخل كل محادثة
        })));
      } catch {
        toast.error("فشل في تحميل الرسائل");
      }
    };

    fetchMessages();
  }, [token]);

  const handleRespond = async (messageId, userId) => {
    const response = responseMap[messageId];
    if (!response?.trim()) {
      toast.error("الرد لا يمكن أن يكون فارغاً");
      return;
    }

    try {
      await axios.put(
        `/api/messages/${messageId}`,
        { response },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      setGroupedConversations((prev) =>
        prev.map((conv) =>
          conv.user.id === userId
            ? {
                ...conv,
                messages: conv.messages.map((msg) =>
                  msg.id === messageId ? { ...msg, response } : msg
                ),
              }
            : conv
        )
      );

      setResponseMap((prev) => ({ ...prev, [messageId]: "" }));
      toast.success("تم إرسال الرد");
    } catch {
      toast.error("فشل في إرسال الرد");
    }
  };

  const handleDelete = async (messageId, userId) => {
    try {
      await axios.delete(`/api/messages/${messageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      setGroupedConversations((prev) =>
        prev.map((conv) =>
          conv.user.id === userId
            ? {
                ...conv,
                messages: conv.messages.filter((msg) => msg.id !== messageId),
              }
            : conv
        )
      );
      toast.success("تم حذف الرسالة");
    } catch {
      toast.error("فشل في حذف الرسالة");
    }
  };

  return (
    <section className={styles["admin-messages"]}>
      <h1 className={styles.title}>محادثات المستخدمين</h1>

      {groupedConversations.length === 0 ? (
        <p className={styles.empty}>لا توجد محادثات بعد</p>
      ) : (
        groupedConversations.map((conv) => (
          <div key={conv.user.id} className={styles["conversation"]}>
            <h3 className={styles["user-name"]}>{conv.user.name}</h3>

            {conv.messages.map((msg) => (
              <div key={msg.id} className={styles["message-wrapper"]}>
                <div className={styles["message-bubble"]}>
                  <span className={styles["sender"]}>العميل:</span>
                  <p>{msg.message}</p>
                </div>

                {msg.response ? (
                  <div className={`${styles["message-bubble"]} ${styles.admin}`}>
                    <span className={styles["sender"]}>الرد:</span>
                    <p>{msg.response}</p>
                  </div>
                ) : (
                  <div className={styles["respond-form"]}>
                    <textarea
                      placeholder="اكتب الرد هنا"
                      value={responseMap[msg.id] || ""}
                      onChange={(e) =>
                        setResponseMap({
                          ...responseMap,
                          [msg.id]: e.target.value,
                        })
                      }
                    />
                    <button
                      className={styles.btn}
                      onClick={() => handleRespond(msg.id, conv.user.id)}
                    >
                      إرسال الرد
                    </button>
                  </div>
                )}

                <button
                  className={styles["delete-btn"]}
                  onClick={() => handleDelete(msg.id, conv.user.id)}
                >
                  حذف الرسالة
                </button>
              </div>
            ))}
          </div>
        ))
      )}
    </section>
  );
};

export default AdminMessages;
