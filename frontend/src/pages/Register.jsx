import React, { useState } from "react";
import { Input } from "../components/ui/input.jsx";
import { Button } from "../components/ui/button.jsx";
import login from "../assets/login.jpg";
import { useAuthStore } from "@/store/useAuthStore.js";
import { Link } from "react-router-dom";

function Register() {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
  });

  const { signup } = useAuthStore();

  const validateForm = () => {
    if (!formData.userName.trim()) {
      return toast.error("Username is required");
    }
    if (!formData.email.trim()) {
      return toast.error("Email is required");
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      return toast.error("Invalid email format");
    }
    if (!formData.password) {
      return toast.error("Password is required");
    }
    if (formData.password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = validateForm();
    if (success) {
      signup(formData);
    }
  };

  return (
    <section className=" min-h-screen w-screen flex box-border justify-center items-center">
      <div className="bg-zinc-100 border-2 rounded-2xl md:rounded-4xl flex max-w-3xl p-5 items-start m-3 md:m-5  md:scale-86 xl:scale-100">
        <div className="md:w-1/2 px-3 md:px-5 md:py-10">
          <h2 className="font-bold text-3xl md:text-6xl text-black">
            Register
          </h2>
          <p className="text-md md:text-xl mt-5 text-black font-sans">
            Create your account now.
          </p>
          <form onSubmit={handleSubmit} className="mt-10 md:mt-16">
            <div className="mb-4">
              <Input
                type="text"
                placeholder="Username"
                value={formData.userName}
                onChange={(e) =>
                  setFormData({ ...formData, userName: e.target.value })
                }
                className="w-full"
              />
            </div>
            <div className="mb-4">
              <Input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full"
              />
            </div>
            <div className="mb-4">
              <Input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full"
              />
            </div>
            <Button type="submit" className="w-full bg-blue-500 text-white">
              Sign Up
            </Button>
          </form>
          <div className="mt-5 ml-1">
            <p className="text-base-content/60">
              Already have an account?
              <Link to="/login" className="text-blue-500 ml-2">
                Log in
              </Link>
            </p>
          </div>
        </div>
        <div className="md:block hidden w-1/2">
          <img
            className="rounded-2xl max-h-[1600px]"
            src={login}
            alt="registration form visual"
          />
        </div>
      </div>
    </section>
  );
}

export default Register;
