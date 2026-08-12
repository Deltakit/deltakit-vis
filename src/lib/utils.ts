import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const base_url = import.meta.env.VITE_API_BASE_URL ?? "";

export const space_time_url = `${base_url}/api/get-space-time-diagram`;
export const logicalPatchUrl = (round: number) => `${base_url}/api/get-patches-info-at-round/${round}`;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fetchSpaceTimeData(): Promise<any> {
  return fetch(space_time_url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
      throw error;
    });
}
