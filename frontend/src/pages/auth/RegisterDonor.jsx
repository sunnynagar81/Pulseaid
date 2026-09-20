import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { LocationCapture } from "../../components/LocationCapture";
import { donorRegisterSchema, BLOOD_TYPE_LIST } from "../../lib/validators";
import { registerDonor } from "../../api/auth";
import { useGeolocation } from "../../hooks/useGeolocation";
import { cn } from "../../lib/cn";

export default function RegisterDonor() {
  const navigate = useNavigate();
  const { coordinates, status: geoStatus, error: geoError, capture } = useGeolocation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(donorRegisterSchema) });

  const selectedBloodType = watch("bloodType");

  const onSubmit = async (values) => {
    if (!coordinates) {
      toast.error("Please share your location first — it's how we match you to nearby requests");
      return;
    }
    try {
      await registerDonor({ ...values, coordinates });
      toast.success("Account created — please log in");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <AuthLayout title="Become a donor" subtitle="Join the network — your next alert could save a life">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Full name" icon={User} placeholder="Rahul Sharma" error={errors.name?.message} {...register("name")} />
        <Input label="Email" type="email" icon={Mail} placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
        <Input label="Phone" icon={Phone} placeholder="9876543210" error={errors.phone?.message} {...register("phone")} />
        <Input label="Password" type="password" icon={Lock} placeholder="At least 8 characters" error={errors.password?.message} {...register("password")} />
        <Input label="City" icon={Building2} placeholder="Meerut" error={errors.city?.message} {...register("city")} />

        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">Blood type</label>
          <div className="grid grid-cols-4 gap-2">
            {BLOOD_TYPE_LIST.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setValue("bloodType", type, { shouldValidate: true })}
                className={cn(
                  "h-10 rounded-lg border text-sm font-semibold transition-colors focus-ring",
                  selectedBloodType === type
                    ? "bg-teal-700 border-teal-700 text-white"
                    : "border-ink-200 text-ink-600 hover:border-teal-400"
                )}
              >
                {type}
              </button>
            ))}
          </div>
          {errors.bloodType && <p className="mt-1.5 text-xs text-red-600">{errors.bloodType.message}</p>}
        </div>

        <LocationCapture status={geoStatus} error={geoError} onCapture={capture} />

        <Button type="submit" className="w-full mt-2" isLoading={isSubmitting}>
          Create donor account
        </Button>
      </form>

      <p className="text-center text-sm text-ink-500 mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-teal-700 font-medium hover:text-teal-800">Log in</Link>
      </p>
    </AuthLayout>
  );
}