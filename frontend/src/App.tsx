import React, { useState } from 'react';
import './App.css';

function App() {
  const [createForm, setCreateForm] = useState({
    businessName: '',
    password: '',
    description: '',
    categoryId: '',
    contactNumber: '',
    email: '',
    website: '',
  });
  const [loginForm, setLoginForm] = useState({
    businessName: '',
    password: '',
  });
  const [token, setToken] = useState('');

  const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateBusiness = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = {
      ...createForm,
      categoryId: parseInt(createForm.categoryId, 10),
    };

    try {
      const res = await fetch('http://localhost:3000/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log('Created business:', data);
      alert('Business created successfully!');
    } catch (error) {
      console.error(error);
      alert('Error creating business');
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        console.log('Logged in token:', data.token);
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error(error);
      alert('Login error');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Essential Services</h1>

      {/* Create Business Form */}
      <div className="mt-8">
        <h2 className="text-2xl mb-4">Create Business</h2>
        <form
          onSubmit={handleCreateBusiness}
          className="flex flex-col space-y-2">
          <input
            type="text"
            name="businessName"
            placeholder="Business Name"
            value={createForm.businessName}
            onChange={handleCreateChange}
            className="border p-2"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={createForm.password}
            onChange={handleCreateChange}
            className="border p-2"
            required
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={createForm.description}
            onChange={handleCreateChange}
            className="border p-2"
          />
          <input
            type="text"
            name="categoryId"
            placeholder="Category ID"
            value={createForm.categoryId}
            onChange={handleCreateChange}
            className="border p-2"
            required
          />
          <input
            type="text"
            name="contactNumber"
            placeholder="Contact Number"
            value={createForm.contactNumber}
            onChange={handleCreateChange}
            className="border p-2"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={createForm.email}
            onChange={handleCreateChange}
            className="border p-2"
          />
          <input
            type="text"
            name="website"
            placeholder="Website"
            value={createForm.website}
            onChange={handleCreateChange}
            className="border p-2"
          />
          <button type="submit" className="bg-green-500 text-white p-2 rounded">
            Create Business
          </button>
        </form>
      </div>

      {/* Login Form */}
      <div className="mt-12">
        <h2 className="text-2xl mb-4">Business Login</h2>
        <form onSubmit={handleLogin} className="flex flex-col space-y-2">
          <input
            type="text"
            name="businessName"
            placeholder="Business Name"
            value={loginForm.businessName}
            onChange={handleLoginChange}
            className="border p-2"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={loginForm.password}
            onChange={handleLoginChange}
            className="border p-2"
            required
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            Login
          </button>
        </form>
        {token && (
          <div className="mt-4">
            <p className="text-xl">JWT Token:</p>
            <p className="break-all">{token}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
