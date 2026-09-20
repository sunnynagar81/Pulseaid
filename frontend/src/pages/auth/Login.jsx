import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Droplet, Hospital } from "lucide-react";
import toast from "react-hot-toast";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { cn } from "../../lib/cn";
import { loginSchema } from "../../lib/validators";
import { useAuthStore } from "../../store/authStore";

export default function Login() {
  const [role, setRole] = useState("donor");
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { role: "donor" },
  });

  const onSubmit = async (values) => {
    try {
      await login({ ...values, role });
      toast.success("Welcome back!");
      navigate(role === "donor" ? "/donor" : "/hospital", { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || "Invalid email or password";
      toast.error(message);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to continue saving lives">
      <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-ink-100 rounded-xl">
        <RoleTab active={role === "donor"} onClick={() => setRole("donor")} icon={Droplet} label="Donor" />
        <RoleTab active={role === "hospital"} onClick={() => setRole("hospital")} icon={Hospital} label="Hospital" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          icon={Mail}
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Password"
          type="password"
          icon={Lock}
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        <Button type="submit" className="w-full mt-2" isLoading={isSubmitting}>
          Log in as {role === "donor" ? "Donor" : "Hospital"}
        </Button>
      </form>

      <p className="text-center text-sm text-ink-500 mt-6">
        New here?{" "}
        <Link to="/register" className="text-teal-700 font-medium hover:text-teal-800">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}

function RoleTab({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-medium transition-colors focus-ring",
        active ? "bg-white text-teal-700 shadow-soft" : "text-ink-500 hover:text-ink-700"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}