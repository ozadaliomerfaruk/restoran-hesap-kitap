// useArsivData Hook

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../lib/supabase";
import { useStore } from "../../../store/useStore";
import { ArchivedItem } from "../types";

export const useArsivData = () => {
  const { profile, fetchProfile } = useStore();

  const [archivedCariler, setArchivedCariler] = useState<ArchivedItem[]>([]);
  const [archivedPersoneller, setArchivedPersoneller] = useState<
    ArchivedItem[]
  >([]);
  const [archivedKasalar, setArchivedKasalar] = useState<ArchivedItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const loadArchivedData = useCallback(async () => {
    if (!profile?.restaurant_id) return;

    setLoading(true);

    // Arşivlenmiş cariler
    const { data: cariler } = await supabase
      .from("cariler")
      .select("id, name, type, balance, is_archived, created_at")
      .eq("restaurant_id", profile.restaurant_id)
      .eq("is_archived", true)
      .order("name");
    setArchivedCariler(cariler || []);

    // Arşivlenmiş personeller
    const { data: personeller } = await supabase
      .from("personeller")
      .select("id, name, balance, is_archived, created_at")
      .eq("restaurant_id", profile.restaurant_id)
      .eq("is_archived", true)
      .order("name");
    setArchivedPersoneller(personeller || []);

    // Arşivlenmiş kasalar
    const { data: kasalar } = await supabase
      .from("kasalar")
      .select("id, name, type, balance, is_archived, created_at")
      .eq("restaurant_id", profile.restaurant_id)
      .eq("is_archived", true)
      .order("name");
    setArchivedKasalar(kasalar || []);

    setLoading(false);
  }, [profile?.restaurant_id]);

  useEffect(() => {
    if (profile?.restaurant_id) {
      loadArchivedData();
    }
  }, [profile?.restaurant_id, loadArchivedData]);

  const totalCount =
    archivedCariler.length +
    archivedPersoneller.length +
    archivedKasalar.length;

  return {
    archivedCariler,
    archivedPersoneller,
    archivedKasalar,
    totalCount,
    loading,
    refresh: loadArchivedData,
  };
};
