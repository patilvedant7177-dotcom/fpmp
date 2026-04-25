"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

export default function ViewCounter({ profileId }: { profileId: string }) {
  const hasIncremented = useRef(false);

  useEffect(() => {
    if (hasIncremented.current) return;
    
    const increment = async () => {
      try {
        const { error } = await supabase.rpc('increment_views', { profile_id: profileId });
        if (error) {
          console.error("Error incrementing views:", error);
        } else {
          hasIncremented.current = true;
          console.log("View incremented for profile:", profileId);
        }
      } catch (err) {
        console.error("Unexpected error incrementing views:", err);
      }
    };

    increment();
  }, [profileId]);

  return null;
}
