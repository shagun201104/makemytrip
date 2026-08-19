"use client";

import React from "react";
import SignupDialog from "./SignupDialog";
import { LogOut, Plane, Radar, User, Sparkles, ShieldCheck } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { clearUser } from "@/app/userSlice";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Navbar = () => {
  const user = useSelector((state: any) => state.user.user);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(clearUser());
    localStorage.removeItem("user");
    router.push("/");
  };

  return (
    <header className="backdrop-blur-xl py-3.5 sticky top-0 z-50 border-b border-[#e2e8f0] bg-white/85 shadow-sm transition-all">
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        
        {/* PREMIUM BRAND LOGO */}
        <div
          onClick={() => router.push("/")}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0f1a2e] via-[#1a3a6b] to-[#2c5a9e] text-white shadow-md group-hover:scale-105 group-hover:shadow-lg transition-all duration-300 border border-white/20">
            <Plane className="w-5 h-5 text-[#60a5fa] transform -rotate-12 group-hover:rotate-0 transition-transform duration-300" />
            <Sparkles className="w-3 h-3 text-[#f59e0b] absolute -top-1 -right-1 animate-pulse" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-baseline text-2xl font-extrabold tracking-tight">
              <span className="text-[#0f1a2e]">Make</span>
              <span className="text-[#3b82f6]">My</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#60a5fa] ml-0.5">
                Tour
              </span>
            </div>
            <span className="text-[9px] font-extrabold tracking-widest text-[#64748b] uppercase -mt-1 flex items-center gap-1">
              LUXURY TRAVEL ENGINE
            </span>
          </div>
        </div>

        {/* NAVIGATION & ACCOUNT ACTIONS */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Button
            onClick={() => router.push("/flight-status")}
            variant="ghost"
            className="hidden sm:flex items-center gap-2 text-[#1e293b] hover:text-[#0f1a2e] font-bold text-xs px-4 py-2 rounded-full hover:bg-[#f1f5f9] transition-all"
          >
            <Radar className="w-4 h-4 text-[#3b82f6]" />
            Live Flight Tracker
          </Button>

          {user?.role === "ADMIN" && (
            <Button
              onClick={() => router.push("/admin")}
              className="bg-gradient-to-r from-[#0f1a2e] to-[#1e3a8a] text-white font-extrabold text-xs px-5 py-2 rounded-full border border-white/20 shadow-md hover:shadow-lg hover:scale-[1.03] transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-[#60a5fa]" />
              Admin Portal
            </Button>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    className="rounded-full p-0 h-10 w-10 hover:opacity-90 transition-opacity"
                  >
                    <Avatar className="h-10 w-10 border-2 border-[#3b82f6]/40 shadow-sm">
                      <AvatarFallback className="bg-gradient-to-br from-[#0f1a2e] to-[#1e3a8a] text-white text-sm font-extrabold">
                        {user?.firstname?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                }
              />
              <DropdownMenuContent
                align="end"
                className="w-56 rounded-2xl border border-[#cbd5e1] shadow-xl p-2 bg-white"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="px-3 py-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold text-[#0f1a2e] leading-none">
                        {user.firstname} {user.lastname}
                      </p>
                      <p className="text-xs text-[#64748b] leading-none">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="bg-[#e2e8f0]" />

                <DropdownMenuItem
                  onClick={() => router.push("/profile")}
                  className="cursor-pointer gap-2 rounded-xl text-xs font-semibold px-3 py-2 text-[#1e293b] hover:bg-[#f1f5f9]"
                >
                  <User className="h-4 w-4 text-[#3b82f6]" />
                  <span>Profile Dashboard</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer gap-2 rounded-xl text-xs font-semibold px-3 py-2 text-[#ef4444] hover:bg-[#fef2f2]"
                >
                  <LogOut className="h-4 w-4 text-[#ef4444]" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <SignupDialog />
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;