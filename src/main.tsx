import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import App from './App'; // 你现有的主界面
import { AdminGuard } from './components/AdminGuard'; // 上一步创建的守卫
import AdminDashboard from './admin/AdminDashboard'; // 新建的后台面板
import PrivacyPolicy from './pages/PrivacyPolicy';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Analytics />
    <BrowserRouter>
      <Routes>
        {/* 路径一：普通用户界面 */}
        <Route path="/" element={<App />} />

        {/* 隐私政策与服务条款 */}
        <Route path="/privacy" element={<PrivacyPolicy />} />

        {/* 路径二：受保护的管理后台 */}
        <Route path="/admin" element={
          <AdminGuard>
            <AdminDashboard />
          </AdminGuard>
        } />
        
        {/* 防止误入其他路径 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);