"use client";
import { useQuery } from "@tanstack/react-query";
import { getVendorProfile } from "../lib/database";
export const useVendor = ({ userId }) => {
  return useQuery({
    queryKey: ["vendor", "current"],
    queryFn: getVendorProfile,
    staleTime: 1000 * 60 * 4,
  });
};
