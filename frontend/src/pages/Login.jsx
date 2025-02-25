import React, { useState } from "react";
import {Input} from "../components/ui/input.jsx";
import {Button} from "../components/ui/button.jsx";
import Loginimg from "../assets/login.jpg";
import {Link} from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore.js";
import { toast } from "react-hot-toast";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login } = useAuthStore();

  const validateForm = () => {
   
    if (!formData.email.trim()) {
      return toast.error("Email is required");
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      return toast.error("Invalid email format");
    }
    if (!formData.password) {
      return toast.error("Password is required");
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = validateForm();
    if (success) {
      login(formData);
    }
  };

  return (
    <section className=" min-h-screen w-screen flex box-border justify-center  items-center">
      <div className=" bg-zinc-100 border-2 rounded-2xl md:rounded-4xl flex max-w-3xl p-5 items-start m-3 md:m-5 md:scale-86 xl:scale-100" >
        <div className="md:w-1/2 px-3 md:px-5 md:py-10">
          <h2 className="font-bold text-3xl md:text-6xl text-black">Login</h2>
          <p className="text-md md:text-xl mt-5 text-black font-sans">
            If you are already a member, easily log in now.
          </p>
          <form onSubmit={handleSubmit} className="mt-10 md:mt-20">
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
              Login
            </Button>
          </form>
          <div className="mt-5 pl-1">
            <p className="text-base-content/60">
              Don&apos;t have an account? 
              <Link to="/signup" className="text-blue-500 ml-2">
                 Create account
              </Link>
            </p>
          </div>
        </div>
        <div className="md:block hidden w-1/2">
          <img
            className="rounded-2xl  "
            src={Loginimg}
            alt="login form visual"
          />
        </div>
      </div>
    </section>
  );
}

export default Login;
