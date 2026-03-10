import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Lock } from 'lucide-react';

const AdminLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple authentication (in production, use proper backend authentication)
    if (username === 'admin' && password === 'divineadmin2024') {
      onLogin(true);
      setError('');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center">
              <Lock size={32} className="text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Divine Iris Healing</CardTitle>
          <p className="text-gray-600">Admin Panel Login</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-700">
              Login
            </Button>
          </form>
          <div className="mt-6 p-4 bg-gray-50 rounded text-xs text-gray-600">
            <p className="font-semibold mb-2">Default Login Credentials:</p>
            <p>Username: <code className="bg-white px-2 py-1 rounded">admin</code></p>
            <p>Password: <code className="bg-white px-2 py-1 rounded">divineadmin2024</code></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
