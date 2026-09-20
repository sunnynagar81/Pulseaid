import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Modal } from "./ui/Modal";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Button } from "./ui/Button";
import { createRequestSchema, BLOOD_TYPE_LIST } from "../lib/validators";
import { createRequest } from "../api/requests";

const URGENCY_OPTIONS = [
  { value: "urgent", label: "Urgent" },
  { value: "critical", label: "Critical" },
  { value: "scheduled", label: "Scheduled" },
];

export function NewRequestModal({ open, onClose, onCreated }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createRequestSchema),
    defaultValues: { urgency: "urgent", unitsNeeded: 1 },
  });

  const onSubmit = async (values) => {
    try {
      const { message, data } = await createRequest(values);
      toast.success(message || `Request posted — ${data.donorsNotified} donor(s) notified`);
      reset();
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not post request");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Post a blood request">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Select
          label="Blood type needed"
          error={errors.bloodType?.message}
          options={[{ value: "", label: "Select blood type" }, ...BLOOD_TYPE_LIST.map((t) => ({ value: t, label: t }))]}
          defaultValue=""
          {...register("bloodType")}
        />
        <Input label="Units needed" type="number" min={1} max={50} error={errors.unitsNeeded?.message} {...register("unitsNeeded")} />
        <Select label="Urgency" error={errors.urgency?.message} options={URGENCY_OPTIONS} {...register("urgency")} />
        <Input label="Patient info (optional)" placeholder="e.g. Accident case, ICU ward 3" error={errors.patientInfo?.message} {...register("patientInfo")} />

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1" isLoading={isSubmitting}>Post request</Button>
        </div>
      </form>
    </Modal>
  );
}