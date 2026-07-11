"use client";

import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isAuthLoading } = useAuth();

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      router.push("/admin/dashboard");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      setErrorMessage("Username dan password wajib diisi.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      await login(username.trim(), password);
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Username atau password salah.";
      setErrorMessage(msg);
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-[--bg-surface] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[--border-default] shadow-floating p-8 space-y-6">
        {/* Logo & Heading */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[--color-primary] flex items-center justify-center text-white font-bold text-xl">
            R
          </div>
          <h1 className="text-xl font-bold text-[--text-primary]">
            WebGIS Desa Rambipuji
          </h1>
          <p className="text-sm text-[--text-secondary]">Panel Administrasi</p>
        </div>

        {/* Input Fields Container — No HTML form tag */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="username-input"
              className="block text-xs font-semibold text-[--text-primary]"
            >
              Username / Email
            </label>
            <input
              id="username-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Masukkan username Anda"
              disabled={loading}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[--border-default] rounded-lg focus:outline-none focus:border-[--color-primary] text-[--text-primary] disabled:bg-gray-100 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password-input"
              className="block text-xs font-semibold text-[--text-primary]"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password-input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Masukkan password Anda"
                disabled={loading}
                className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-white border border-[--border-default] rounded-lg focus:outline-none focus:border-[--color-primary] text-[--text-primary] disabled:bg-gray-100 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[--text-muted] hover:text-[--text-primary] transition"
                aria-label={
                  showPassword
                    ? "Sembunyikan password"
                    : "Tampilkan password"
                }
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2.5 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[--color-primary] hover:bg-[--color-primary-hover] text-white text-sm font-medium rounded-lg shadow-sm transition disabled:opacity-70 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <span>Masuk</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
