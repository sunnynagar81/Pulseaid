import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Hospital, Phone, MapPin, Mail, Hash, ShieldCheck, ShieldAlert } from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { ChangePasswordCard } from "../../components/ChangePasswordCard";
import { useAuthStore } from "../../store/authStore";
import { updateHospitalProfileSchema } from "../../lib/validators";
import { updateProfile, changePassword } from "../../api/hospitals";

export default function HospitalProfile() {
  const { user, updateUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(updateHospitalProfileSchema),
    defaultValues: { name: user?.name, phone: user?.phone, address: user?.address || "" },
  });

  const onSubmit = async (values) => {
    try {
      const { data } = await updateProfile(values);
      updateUser(data);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update profile");
    }
  };

  return (
    <DashboardLayout title="Profile">
      <div className="space-y-6">
        <Card className="max-w-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-teal-700 text-white flex items-center justify-center text-xl font-semibold shrink-0">
                {user?.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-ink-900">{user?.name}</h2>
                <p className="text-sm text-ink-500">Hospital</p>
              </div>
            </div>
            <Badge variant={user?.verified ? "teal" : "coral"}>
              {user?.verified ? (
                <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" />Verified</span>
              ) : (
                <span className="flex items-center gap-1"><ShieldAlert className="h-3 w-3" />Pending</span>
              )}
            </Badge>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Hospital name" icon={Hospital} error={errors.name?.message} {...register("name")} />
            <Input label="Phone" icon={Phone} error={errors.phone?.message} {...register("phone")} />
            <Input label="Address" icon={MapPin} error={errors.address?.message} {...register("address")} />

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-ink-100">
              <ReadOnlyField icon={Mail} label="Email" value={user?.email} />
              <ReadOnlyField icon={Hash} label="Registration No." value={user?.registrationNumber} />
            </div>

            <Button type="submit" isLoading={isSubmitting} disabled={!isDirty}>
              Save Changes
            </Button>
          </form>
        </Card>

        <ChangePasswordCard changePasswordApi={changePassword} />
      </div>
    </DashboardLayout>
  );
}

function ReadOnlyField({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-8 w-8 rounded-lg bg-ink-100 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-ink-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-ink-400">{label}</p>
        <p className="text-sm font-medium text-ink-800 truncate">{value}</p>
      </div>
    </div>
  );
}