"use client";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Button } from "./ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { signup, login } from "../app/api";
import { setUser } from "../app/userSlice";
import { User, Mail, Lock, Phone, Plane } from "lucide-react";

const SignupDialog = () => {
    const dispatch = useDispatch();
    const [isSignup, setIsSignup] = useState(true);
    const [firstname, setFirstName] = useState("");
    const [lastname, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [open, setopen] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSignup) {
            try {
                const signin = await signup({
                    firstname,
                    lastname,
                    phoneNumber,
                    email,
                    password,
                });
                dispatch(setUser(signin));
                localStorage.setItem("user", JSON.stringify(signin));
                setopen(false)
                clearform()
            } catch (error) {
                console.log(error);
            }
        } else {
            try {
                const data = await login({
                    email,
                    password,
                });
                dispatch(setUser(data));
                localStorage.setItem("user", JSON.stringify(data));
                setopen(false)
                clearform()
            } catch (error) {
                console.log(error);
            }
        }
    };
    const clearform = () => {
        setFirstName("")
        setLastName("")
        setEmail("")
        setPassword("")
        setPhoneNumber("")
    }

    const inputClass =
        "pl-10 bg-white border border-[#d5e2f0] text-[#0f1a2e] placeholder:text-[#9aa8bd] rounded-lg h-11 focus-visible:ring-2 focus-visible:ring-[#0f1a2e]/30 focus-visible:border-[#0f1a2e]/40 transition-colors";
    const iconClass =
        "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c8ba3]";

    return (
        <Dialog open={open} onOpenChange={setopen}>

            <DialogTrigger className="rounded-full border border-white bg-white px-6 py-2 text-sm font-semibold text-[#0f1a2e] shadow-sm transition-all hover:shadow-md hover:scale-[1.03]">
                Sign Up
            </DialogTrigger>

            <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">

                {/* GRADIENT HEADER */}
                <DialogHeader className="bg-gradient-to-br from-[#0f1a2e] to-[#1a3a6b] px-7 pt-7 pb-6 text-left">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 backdrop-blur">
                            <Plane className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-white/90 font-semibold tracking-wide">MakeMyTour</span>
                    </div>

                    <DialogTitle className="text-2xl font-bold text-white">
                        {isSignup ? "Create Account" : "Welcome Back"}
                    </DialogTitle>

                    <DialogDescription className="text-white/70 text-sm">
                        {isSignup
                            ? "Join us to start booking your travels"
                            : "Enter your credentials to access your account"}
                    </DialogDescription>
                </DialogHeader>

                {/* FORM BODY */}
                <div className="px-7 pb-7 pt-2">
                    <form onSubmit={handleAuth} className="space-y-4">
                        {isSignup && (
                            <div className="grid grid-cols-2 gap-3">

                                <div className="space-y-1.5">
                                    <Label htmlFor="firstname" className="text-[#2c3e57] text-sm font-medium">First Name</Label>
                                    <div className="relative">
                                        <User className={iconClass} />
                                        <Input
                                            id="firstname"
                                            placeholder="John"
                                            value={firstname}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            required
                                            className={inputClass}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="lastname" className="text-[#2c3e57] text-sm font-medium">Last Name</Label>
                                    <div className="relative">
                                        <User className={iconClass} />
                                        <Input
                                            id="lastname"
                                            placeholder="Doe"
                                            value={lastname}
                                            onChange={(e) => setLastName(e.target.value)}
                                            required
                                            className={inputClass}
                                        />
                                    </div>
                                </div>

                            </div>
                        )}

                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-[#2c3e57] text-sm font-medium">Email</Label>
                            <div className="relative">
                                <Mail className={iconClass} />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-[#2c3e57] text-sm font-medium">Password</Label>
                            <div className="relative">
                                <Lock className={iconClass} />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        {isSignup && (
                            <div className="space-y-1.5">
                                <Label htmlFor="phoneNumber" className="text-[#2c3e57] text-sm font-medium">Phone Number</Label>
                                <div className="relative">
                                    <Phone className={iconClass} />
                                    <Input
                                        id="phoneNumber"
                                        type="tel"
                                        placeholder="+1 234 567 890"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        required
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-11 bg-gradient-to-br from-[#0f1a2e] to-[#1a3a6b] text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:opacity-95 transition-all mt-1"
                        >
                            {isSignup ? "Sign Up" : "Login"}
                        </Button>
                    </form>

                    <div className="text-center text-sm text-[#3d5170] mt-5">
                        {isSignup ? (
                            <>
                                Already have an account?{" "}
                                <button
                                    type="button"
                                    className="font-semibold text-[#1a3a6b] hover:underline"
                                    onClick={() => setIsSignup(false)}
                                >
                                    Login
                                </button>
                            </>
                        ) : (
                            <>
                                Don&apos;t have an account?{" "}
                                <button
                                    type="button"
                                    className="font-semibold text-[#1a3a6b] hover:underline"
                                    onClick={() => setIsSignup(true)}
                                >
                                    Signup
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    )
}

export default SignupDialog
