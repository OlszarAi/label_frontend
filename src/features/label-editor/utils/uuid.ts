import { v4 as uuidv4 } from 'uuid';

export const generateUUID = (length: number = 8): string => {
  // Generate a full UUID and remove dashes
  const fullUuid = uuidv4().replace(/-/g, '');
  
  // Take only the specified length from the UUID
  let uuid = fullUuid.substring(0, Math.min(length, fullUuid.length));
  
  // If requested length is longer than available UUID chars, pad with random hex
  while (uuid.length < length) {
    uuid += Math.floor(Math.random() * 16).toString(16);
  }
  
  return uuid;
};

export const validateUUIDLength = (length: number): number => {
  return Math.max(1, Math.min(32, length)); // Ensure length is between 1 and 32
};

export const validatePrefix = (prefix: string): string => {
  // Keep the prefix as-is for URLs and other use cases
  return prefix.substring(0, 200); // Just limit length to reasonable amount
};
