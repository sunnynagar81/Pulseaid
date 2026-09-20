import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Hospital, Mail, Phone, Lock, Hash, MapPinned } from "lucide-react";
import toast from "react-hot-toast";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { LocationCapture } from "../../components/LocationCapture";
import { hospitalRegisterSchema } from "../../lib/validators";
import { registerHospital } from "../../api/auth";
import { useGeolocation } from "../../hooks/useGeolocation";

export default function RegisterHospital() {
  const navigate = useNavigate();
  const { coordinates, status: geoStatus, error: geoError, capture } = useGeolocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(hospitalRegisterSchema) });

  const onSubmit = async (values) => {
    if (!coordinates) {
      toast.error("Please share the hospital's location first — it's needed for donor matching");
      return;
    }
    try {
      await registerHospital({ ...values, coordinates });
      toast.success("Hospital registered — pending verification. Please log in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <AuthLayout title="Register your hospital" subtitle="Post requests and reach nearby donors instantly">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Hospital name" icon={Hospital} placeholder="City Care Hospital" error={errors.name?.message} {...register("name")} />
        <Input label="Email" type="email" icon={Mail} placeholder="admin@hospital.com" error={errors.email?.message} {...register("email")} />
        <Input label="Phone" icon={Phone} placeholder="9876543210" error={errors.phone?.message} {...register("phone")} />
        <Input label="Password" type="password" icon={Lock} placeholder="At least 8 characters" error={errors.password?.message} {...register("password")} />
        <Input label="Registration number" icon={Hash} placeholder="REG-001" error={errors.registrationNumber?.message} {...register("registrationNumber")} />
        <Input label="Address" icon={MapPinned} placeholder="MG Road, Meerut" error={errors.address?.message} {...register("address")} />

        <LocationCapture status={geoStatus} error={geoError} onCapture={capture} />

        <Button type="submit" className="w-full mt-2" isLoading={isSubmitting}>
          Register hospital
        </Button>
      </form>

      <p className="text-center text-sm text-ink-500 mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-teal-700 font-medium hover:text-teal-800">Log in</Link>
      </p>
    </AuthLayout>
  );
}