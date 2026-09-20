import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Lock } from "lucide-react";
import { Card } from "./ui/Card";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { changePasswordSchema } from "../lib/validators";

export function ChangePasswordCard({ changePasswordApi }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(changePasswordSchema) });

  const onSubmit = async (values) => {
    try {
      await changePasswordApi({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success("Password changed successfully");
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not change password");
    }
  };

  return (
    <Card className="max-w-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Lock className="h-4.5 w-4.5 text-ink-500" />
        <h3 className="text-base font-semibold text-ink-900">Change Password</h3>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Current password" type="password" error={errors.currentPassword?.message} {...register("currentPassword")} />
        <Input label="New password" type="password" placeholder="At least 8 characters" error={errors.newPassword?.message} {...register("newPassword")} />
        <Input label="Confirm new password" type="password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
        <Button type="submit" variant="outline" isLoading={isSubmitting}>
          Update Password
        </Button>
      </form>
    </Card>
  );
}