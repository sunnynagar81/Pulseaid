/**
 * Maps a recipient's blood type to the donor types that can safely
 * donate to them. Kept as a plain lookup table (not computed) because
 * blood compatibility is a fixed medical rule set, not derived data.
 */
const COMPATIBLE_DONORS = {
  "A+": ["A+", "A-", "O+", "O-"],
  "A-": ["A-", "O-"],
  "B+": ["B+", "B-", "O+", "O-"],
  "B-": ["B-", "O-"],
  "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], // universal recipient
  "AB-": ["A-", "B-", "AB-", "O-"],
  "O+": ["O+", "O-"],
  "O-": ["O-"], // can only receive from O-
};

export function getCompatibleDonorTypes(recipientBloodType) {
  const types = COMPATIBLE_DONORS[recipientBloodType];
  if (!types) {
    throw new Error(`Unknown blood type: ${recipientBloodType}`);
  }
  return types;
}

export function isCompatible(donorType, recipientType) {
  return getCompatibleDonorTypes(recipientType).includes(donorType);
}