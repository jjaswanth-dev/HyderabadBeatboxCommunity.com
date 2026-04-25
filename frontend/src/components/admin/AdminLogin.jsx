import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/login`,
        {
          username,
          password,
        }
      );
      localStorage.setItem("adminToken", data.token);
      navigate("/admin/dashboard");
    } catch (error) {
      setError("Invalid credentials");
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center p-4"
      style={{
        backgroundImage:
          "url('https://ik.imagekit.io/mtkm3escy/hyd%20bbx%20site.png?updatedAt=1771525471174')",
      }}
    >
      <div className="max-w-md w-full space-y-8 p-8 bg-white bg-opacity-10 backdrop-blur-lg rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-white">
          Admin Login
        </h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full p-3 bg-white bg-opacity-20 text-white rounded-lg border border-white/30 focus:ring-2 focus:ring-white/50 focus:outline-none"
            />
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 bg-white bg-opacity-20 text-white rounded-lg border border-white/30 focus:ring-2 focus:ring-white/50 focus:outline-none"
            />
            <div
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <AiFillEyeInvisible className="h-5 w-5 text-gray-400" />
              ) : (
                <AiFillEye className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;