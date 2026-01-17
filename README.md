# 🏥 Full-Stack Online Pharmacy System

A modern, full-featured online pharmacy platform built with **Laravel 10+** and **React 19 (Vite)**. The system provides a seamless experience for customers to browse medications, manage their cart, and securely pay via PayPal, alongside a robust administrative dashboard for management.

---

## 🎨 Design & User Experience
- **Modern UI:** Clean, professional, and responsive design using Bootstrap 5.
- **Micro-interactions:** Smooth animations and hover effects for a premium feel.
- **Multilingual Support:** Ready for English and Arabic (configurable in `.env`).

---

## 🚀 Key Features

### 👤 Customer Features
- **Authentication:** Secure Login/Register with JWT (Laravel Sanctum).
- **Social Auth:** Fast access via **Google** and **Facebook** login.
- **Product Discovery:**
  - Dynamic **Search** for finding specific medications.
  - **Category-based** browsing.
  - **Quick View** for product details without leaving the page.
- **Shopping Experience:**
  - Real-time **Shopping Cart** management.
  - Secure **PayPal** payment integration.
  - **Order Tracking** and history with **Rating** system.
- **Communication:** **Contact Us** form with real-time feedback.
- **Profile Management:** Update personal details and view order status.

### 🛡️ Admin Dashboard
- **Analytics:** Overview of stats (Stats are fetched from `api/dashboard-stats`).
- **Product Management:** Full CRUD operations for medications.
- **Order Management:** View and update order statuses.
- **User Management:** Manage registered customers and roles.
- **Message Center:** Handle customer inquiries from the contact form.

---

## 🛠️ Technology Stack

| Feature | Technology |
| :--- | :--- |
| **Backend** | Laravel 10+, PHP 8.x |
| **Frontend** | React 19, Vite, Bootstrap 5 |
| **Database** | MySQL / MariaDB |
| **Authentication** | Laravel Sanctum (SPA) |
| **Payment Gateways** | PayPal SDK |
| **State Management** | React Hooks, TanStack Query |
| **Styling** | Vanilla CSS, FontAwesome |

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- PHP >= 8.1
- Composer
- Node.js & npm
- MySQL

### 2. Backend Setup (Laravel)
```bash
git clone https://github.com/MohammedTaha187/Pharmacy-react-and-laravel.git
cd pharmacy
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### 3. Frontend Setup (React)
```bash
cd react
npm install
npm run dev
```

---

## 🌐 GitHub Repository Details
- **Repository:** [MohammedTaha187/Pharmacy-react-and-laravel](https://github.com/MohammedTaha187/Pharmacy-react-and-laravel)
- **Last Sync:** May 5, 2025
- **Maintenance:** Active / Fixed major React versioning issues.

---

## 🔧 Critical Fixes Applied
- **React Version Mismatch:** Resolved `react` and `react-dom` versioning conflicts by pinning both to `19.0.0`.
- **Directory Typos:** Corrected `Producys` typo to `Products` across code and file system.
- **Environment config:** Optimized `.env` for local development and PayPal sandbox.

---

## 📄 License
This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
