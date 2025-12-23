import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import ShellLayout from './layout/ShellLayout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import HDDPackages from './pages/HDDPackages.jsx';
import Games from './pages/Games.jsx';
import Orders from './pages/Orders.jsx';
import Profile from './pages/Profile.jsx';
import NotFound from './pages/NotFound.jsx';
import RequireAuth from './components/RequireAuth.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/storefront/login" element={<Login />} />
      <Route path="/storefront/register" element={<Register />} />

      <Route path="/storefront" element={<ShellLayout />}
      >
        <Route index element={<Dashboard />} />
        <Route path="hdd" element={<HDDPackages />} />
        <Route path="games" element={<Games />} />
        <Route
          path="orders"
          element={
            <RequireAuth>
              <Orders />
            </RequireAuth>
          }
        />
        <Route
          path="profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="*" element={<Navigate to="/storefront" replace />} />
    </Routes>
  );
}
