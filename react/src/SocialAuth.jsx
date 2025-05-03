import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SocialAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      // تخزين الـ token في localStorage
      localStorage.setItem('token', token);

      // تأكد من أن التوكن تم تخزينه بشكل صحيح
      console.log("Token received and saved:", token);

      // بعد تخزين التوكن، توجيه المستخدم إلى الصفحة الرئيسية
      navigate('/home');
    } else {
      // في حالة عدم وجود التوكن، توجيه المستخدم إلى صفحة تسجيل الدخول
      navigate('/login');
    }
  }, [navigate]);

  return null; // لا نحتاج أن نعرض شيء في هذه الصفحة، فقط التوجيه
};

export default SocialAuth;
