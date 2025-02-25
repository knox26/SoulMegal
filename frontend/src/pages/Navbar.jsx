import React from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { Link } from "react-router-dom";
import { LogOut, Popcorn } from "lucide-react";

function Navbar() {
  const { authUser, logout } = useAuthStore();
  return (
    <header
      className="bg-gradient-to-r from-blue-600 to-violet-600 fixed w-full top-0 z-40 
  backdrop-blur-lg bg-base-100/80"
    >
      <div className=" mx-auto px-4 h-16">
        <div className=" mx-2 flex justify-between items-center h-full">
          <div className="flex items-center gap-8">
            {/* <Link
              to="/"
              className="flex items-center gap-2.5 hover:opacity-80 transition-all"
            >
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">Talk-Verse</h1>
            </Link> */}
             <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Popcorn className="w-5 h-5 text-primary" />
              
              </div>
              <h1 className="text-lg font-bold">Soulemgal</h1>
          </div>
          <div className="flex items-center gap-2 ">
            {/* <Link
              to={"/settings"}
              className={`btn btn-sm gap-2 transition-colors `}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link> */}
            {authUser && (
              <>
                <button className="flex gap-2 items-center" onClick={logout}>
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
