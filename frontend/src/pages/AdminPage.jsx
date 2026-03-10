import React, { useState } from 'react';
import AdminLogin from '../components/admin/AdminLogin';
import AdminPanel from '../components/admin/AdminPanel';

function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <>
      {isLoggedIn ? (
        <AdminPanel onLogout={handleLogout} />
      ) : (
        <AdminLogin onLogin={setIsLoggedIn} />
      )}
    </>
  );
}

export default AdminPage;
