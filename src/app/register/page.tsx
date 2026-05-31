"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, AlertCircle, CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function Register() {
  const router = useRouter();
  const { register } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Custom wired properties
  const [departmentId, setDepartmentId] = useState("");
  const [graduationYear, setGraduationYear] = useState(new Date().getFullYear().toString());
  const [departments, setDepartments] = useState<{ id: number; name: string; code: string }[]>([]);
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch departments list
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get("/api/Departments", { params: { pageSize: 100 } });
        if (response && response.data) {
          setDepartments(response.data);
          if (response.data.length > 0) {
            setDepartmentId(response.data[0].id.toString());
          }
        }
      } catch (err) {
        console.error("Failed to load departments", err);
      }
    };
    fetchDepartments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName || !lastName || !email || !departmentId || !graduationYear || !password || !confirmPassword) {
      setError("Please fill out all required fields.");
      return;
    }

    if (!email.endsWith("@fci.bu.edu.eg")) {
      setError("Please use your official university email (@fci.bu.edu.eg)");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const passwordRules = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password)
    ];

    if (!passwordRules.every(Boolean)) {
      setError("Please ensure your password meets all requirements.");
      return;
    }

    const parsedGradYear = parseInt(graduationYear);
    if (isNaN(parsedGradYear) || parsedGradYear < 2000 || parsedGradYear > 2100) {
      setError("Please enter a valid graduation year");
      return;
    }

    if (!departmentId) {
      setError("Please select a department");
      return;
    }

    setIsLoading(true);

    try {
      await register({
        firstName,
        lastName,
        email,
        password,
        departmentId: parseInt(departmentId),
        gpa: 3.0,
        graduationYear: parsedGradYear,
      });
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRules = [
    { label: "At least 8 characters", test: password.length >= 8 },
    { label: "Uppercase letter", test: /[A-Z]/.test(password) },
    { label: "Lowercase letter", test: /[a-z]/.test(password) },
    { label: "Number", test: /[0-9]/.test(password) },
    { label: "Special character", test: /[^A-Za-z0-9]/.test(password) },
  ];

  const strengthScore = passwordRules.filter((rule) => rule.test).length;
  const strengthColor =
    strengthScore === 0
      ? "bg-muted"
      : strengthScore <= 2
      ? "bg-red-500"
      : strengthScore <= 4
      ? "bg-yellow-500"
      : "bg-emerald-500";

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
      {/* Background ambient light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-96 bg-indigo-500/20 dark:bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-2xl my-8 relative z-10 animate-in fade-in zoom-in-95 duration-700 ease-out">
        <div className="bg-card/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-border/50 p-8 sm:p-10">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center -mb-4 relative w-28 h-28">
              <Image
                src="/logo-light.png"
                alt="InnoTrack Logo"
                fill
                className="drop-shadow-xl mix-blend-multiply object-contain dark:hidden"
              />
              <Image
                src="/logo-dark.png"
                alt="InnoTrack Logo"
                fill
                className="drop-shadow-xl mix-blend-screen object-contain hidden dark:block"
              />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
              Create Account
            </h1>
            <p className="text-muted-foreground font-medium">Join InnoTrack today</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400 font-medium leading-relaxed">{error}</p>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="h-12 rounded-xl bg-background/50 border-border/50 focus-visible:ring-indigo-500/50 transition-all duration-200 shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Smith"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="h-12 rounded-xl bg-background/50 border-border/50 focus-visible:ring-indigo-500/50 transition-all duration-200 shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="student@fci.bu.edu.eg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl bg-background/50 border-border/50 focus-visible:ring-indigo-500/50 transition-all duration-200 shadow-sm"
              />
              {email.length > 0 && !email.endsWith("@fci.bu.edu.eg") && (
                <p className="text-[11px] text-red-500 font-medium ml-1 mt-1 animate-in fade-in slide-in-from-top-1">
                  Must be an official university email (@fci.bu.edu.eg)
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Department Dynamic Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="department" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Department</Label>
                <select
                  id="department"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  required
                  className="flex h-12 w-full rounded-xl border border-border/50 bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-foreground transition-all duration-200 shadow-sm appearance-none"
                >
                  {departments.length === 0 ? (
                    <option value="">Loading departments...</option>
                  ) : (
                    departments.map((dept) => (
                      <option key={dept.id} value={dept.id} className="bg-background">
                        {dept.name} ({dept.code})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="graduationYear" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Graduation Year</Label>
                <Input
                  id="graduationYear"
                  type="number"
                  min="2000"
                  max="2100"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  required
                  className="h-12 rounded-xl bg-background/50 border-border/50 focus-visible:ring-indigo-500/50 transition-all duration-200 shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pr-12 rounded-xl bg-background/50 border-border/50 focus-visible:ring-indigo-500/50 transition-all duration-200 shadow-sm font-medium tracking-widest placeholder:tracking-normal"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-indigo-500 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-12 pr-12 rounded-xl bg-background/50 border-border/50 focus-visible:ring-indigo-500/50 transition-all duration-200 shadow-sm font-medium tracking-widest placeholder:tracking-normal"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-indigo-500 transition-colors focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
                {confirmPassword.length > 0 && confirmPassword !== password && (
                  <p className="text-[11px] text-red-500 font-medium ml-1 mt-1 animate-in fade-in slide-in-from-top-1">
                    Passwords do not match
                  </p>
                )}
              </div>

              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="sm:col-span-2 mt-2 p-4 bg-muted/40 rounded-xl border border-border/50 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex items-center gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-2 flex-1 rounded-full transition-colors duration-500 ${
                          level <= strengthScore ? strengthColor : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                    {passwordRules.map((rule, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-[12px] font-medium">
                        {rule.test ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                        )}
                        <span className={rule.test ? "text-foreground" : "text-muted-foreground"}>
                          {rule.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 mt-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base transition-all duration-200 shadow-lg shadow-indigo-500/25"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground font-medium">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-bold transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs font-medium text-muted-foreground/60 mt-8">
          InnoTrack – Graduation Project Redundancy Reduction System
        </p>
      </div>
    </div>
  );
}
