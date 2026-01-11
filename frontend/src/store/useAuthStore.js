import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

// =========================
// AUTH STORE (FASTAPI SAFE)
// =========================
export const useAuthStore = create((set) => ({
  // -------------------------
  // STATE
  // -------------------------
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isCheckingAuth: true,

  // -------------------------
  // REGISTER
  // -------------------------
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      await axiosInstance.post("/auth/register", {
        email: data.email,
        full_name: data.full_name, // ⚠ frontend uses fullName
        password: data.password,
        profile_pic: "",
      });

      toast.success("Account created successfully");
    } catch (error) {
      console.error("Signup error:", error.response?.data || error);
      toast.error("Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  // -------------------------
  // LOGIN (OAuth2)
  // -------------------------
login: async (data) => {
  set({ isLoggingIn: true });
  try {
    const formData = new URLSearchParams();
    formData.append("username", data.email); // OAuth2 expects username
    formData.append("password", data.password);

    const res = await axiosInstance.post("/auth/token", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const token = res.data.access_token;
    localStorage.setItem("token", token);

    set({
      authUser: {
        email: data.email,
      },
    });

    toast.success("Logged in successfully");
  } catch (error) {
    console.error("Login error:", error.response?.data || error);
    toast.error("Invalid email or password");
  } finally {
    set({ isLoggingIn: false });
  }
},



  // -------------------------
  // CHECK AUTH (ON REFRESH)
  // -------------------------
  checkAuth: () => {
    const token = localStorage.getItem("token");

    if (!token) {
      set({ authUser: null, isCheckingAuth: false });
      return;
    }

    // Minimal restore (backend verification optional)
    set({
      authUser: { email: "restored" },
      isCheckingAuth: false,
    });
  },

  // -------------------------
  // LOGOUT
  // -------------------------
  logout: () => {
    localStorage.removeItem("token");
    set({ authUser: null });
    toast.success("Logged out successfully");
  },
}));
