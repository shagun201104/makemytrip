"use client";

import React from "react";
import SignupDialog from "./SignupDialog";
import { LogOut, Plane, Radar, User } from "lucide-react";
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
        <header className="backdrop-blur-md py-4 sticky top-0 z-50 border-b border-white/10 bg-black/30">
            <div className="container mx-auto px-4 flex items-center justify-between">
                <div
                    onClick={() => router.push("/")}
                    className="flex items-center space-x-2 cursor-pointer"
                >
                    <Plane className="w-8 h-8 text-red-500" />
                    <span className="text-2xl font-bold text-black">MakeMyTour</span>
                </div>

                <div className="flex items-center space-x-4">
                    <Button
                        onClick={() => router.push("/flight-status")}
                        variant="ghost"
                        className="hidden sm:flex items-center gap-2 text-black font-semibold px-4 py-2 rounded-full hover:bg-black/5 transition-all duration-200"
                    >
                        <Radar className="w-4 h-4 text-red-500" />
                        Flight Status
                    </Button>

                    {user?.role === "ADMIN" && (
                        <Button
                            onClick={() => router.push("/admin")}
                            className="bg-gradient-to-br from-slate-900 to-blue-950 text-white font-semibold px-5 py-2 rounded-full border border-white/20 shadow-md hover:shadow-lg hover:scale-[1.03] transition-all duration-200"
                        >
                            Admin
                        </Button>
                    )}

                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button
                                        variant="ghost"
                                        className="rounded-full p-0 h-10 w-10 hover:opacity-80 transition-opacity"
                                    >
                                        <Avatar className="h-11 w-11 border-2 border-white/30 shadow-md">
                                            <AvatarFallback className="bg-gradient-to-br from-slate-900 to-blue-950 text-white text-lg font-bold tracking-wide">
                                                {user?.firstname?.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                }
                            />
                            <DropdownMenuContent
                                align="end"
                                className="w-56 rounded-xl border border-white/10 shadow-lg"
                            >
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel>
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {user.firstname} {user.lastname}
                                            </p>
                                            <p className="text-xs text-muted-foreground leading-none">
                                                {user.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                </DropdownMenuGroup>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                    onClick={() => router.push("/profile")}
                                    className="cursor-pointer gap-2"
                                >
                                    <User className="h-4 w-4" />
                                    <span>Profile</span>
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="cursor-pointer gap-2 text-red-500 focus:text-red-500"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Logout</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <SignupDialog />
                    )}
                </div>
            </div>
        </header >
    );
};

export default Navbar;