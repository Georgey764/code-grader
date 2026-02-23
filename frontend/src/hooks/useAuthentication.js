"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { usePathname } from "next/navigation";

const baseUrl = process.env.NEXT_PUBLIC_URL;

export default function useAuthentication() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    router.push("/login");
  }, [router]);

  useEffect(() => {
    const checkAuth = async () => {
      let token = localStorage.getItem("access_token");
      const refreshToken = localStorage.getItem("refresh_token");

      if (!token) {
        if (refreshToken) {
          token = await attemptRefresh(refreshToken);
        } else {
          return redirectToLogin();
        }
      }

      try {
        let decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          if (refreshToken) {
            const newToken = await attemptRefresh(refreshToken);
            if (newToken) {
              token = newToken;
              decoded = jwtDecode(token);
            } else {
              return redirectToLogin();
            }
          } else {
            return redirectToLogin();
          }
        }

        setUser(decoded);
      } catch (error) {
        redirectToLogin();
      } finally {
        setIsLoading(false);
      }
    };

    const attemptRefresh = async (refresh) => {
      try {
        const res = await axios.post(`${baseUrl}token/refresh/`, { refresh });
        const newAccess = res.data.access;
        localStorage.setItem("access_token", newAccess);
        return newAccess;
      } catch (err) {
        return null;
      }
    };

    const redirectToLogin = () => {
      let path_split = pathname.split("/");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setIsLoading(false);

      if (!path_split.includes("student") && !path_split.includes("faculty")) {
        router.push(pathname);
      } else {
        router.push("/login");
      }
    };

    checkAuth();
  }, [router, pathname]);

  return { user, isLoading, logout };
}
