import { HeartHandshake } from "lucide-react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";

/**
 * Shown once a donor confirms an actual completed donation. Directly
 * answers "why would anyone donate" — most donors never find out what
 * happened after they gave blood. This closes that loop immediately,
 * with a real, cited medical fact (one donation can be split into red
 * cells, plasma, and platelets — helping up to 3 patients) rather than
 * a made-up motivational number.
 */
export function ImpactModal({ open, onClose, totalDonations }) {
  const livesImpacted = totalDonations * 3;

  return (
    <Modal open={open} onClose={onClose} title="">
      <div className="text-center py-4">
        <div className="h-16 w-16 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mx-auto mb-5">
          <HeartHandshake className="h-8 w-8" />
        </div>
        <h2 className="font-display text-2xl font-semibold text-ink-900 mb-2">Thank You!</h2>
        <p className="text-ink-600 mb-6">
          A single donation can be separated into red cells, plasma, and platelets —
          helping <span className="font-semibold text-teal-700">up to 3 patients</span>.
        </p>
        <div className="bg-teal-50 rounded-xl p-5 mb-6">
          <p className="text-3xl font-display font-bold text-teal-700">{livesImpacted}</p>
          <p className="text-sm text-ink-500 mt-1">lives you may have helped, across {totalDonations} donation{totalDonations !== 1 ? "s" : ""}</p>
        </div>
        <Button className="w-full" onClick={onClose}>
          Continue
        </Button>
      </div>
    </Modal>
  );
}