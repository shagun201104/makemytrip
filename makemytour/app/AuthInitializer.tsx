"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "./userSlice";

export default function AuthInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      dispatch(setUser(JSON.parse(saved)));
    }
  }, [dispatch]);

  return null;
}
