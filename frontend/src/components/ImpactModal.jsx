import { useEffect } from "react";
import confetti from "canvas-confetti";
import { HeartHandshake } from "lucide-react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { useCountUp } from "../hooks/useCountUp";

export function ImpactModal({ open, onClose, totalDonations }) {
  const livesImpacted = totalDonations * 3;
  const animatedLives = useCountUp(open ? livesImpacted : 0, 1000);

  useEffect(() => {
    if (!open) return;
    // Two bursts from opposite corners reads as a celebration, not a
    // single center burst which can feel more like a loading spinner.
    const duration = 1200;
    const end = Date.now() + duration;
    const colors = ["#0F766E", "#F97316", "#14B8A6"];

    (function frame() {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} title="">
      <div className="text-center py-4">
        <div className="h-16 w-16 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mx-auto mb-5 animate-pulse">
          <HeartHandshake className="h-8 w-8" />
        </div>
        <h2 className="font-display text-2xl font-semibold text-ink-900 mb-2">Thank You!</h2>
        <p className="text-ink-600 mb-6">
          A single donation can be separated into red cells, plasma, and platelets —
          helping <span className="font-semibold text-teal-700">up to 3 patients</span>.
        </p>
        <div className="bg-teal-50 rounded-xl p-5 mb-6">
          <p className="text-3xl font-display font-bold text-teal-700">{animatedLives}</p>
          <p className="text-sm text-ink-500 mt-1">lives you may have helped, across {totalDonations} donation{totalDonations !== 1 ? "s" : ""}</p>
        </div>
        <Button className="w-full" onClick={onClose}>
          Continue
        </Button>
      </div>
    </Modal>
  );
}