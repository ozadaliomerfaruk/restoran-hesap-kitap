// Kategoriler Data Hook

import { useState, useEffect, useMemo, useCallback } from "react";
import { useStore } from "../../../store/useStore";
import { HierarchicalKategori, KategoriTab } from "../types";

export function useKategorilerData() {
  const { profile, fetchProfile, kategoriler, fetchKategoriler } = useStore();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<KategoriTab>("gider");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile?.restaurant_id) {
      fetchKategoriler();
    }
  }, [profile?.restaurant_id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchKategoriler();
    setRefreshing(false);
  }, [fetchKategoriler]);

  // Kategorileri hiyerarşik olarak düzenle
  const hierarchicalData = useMemo<HierarchicalKategori[]>(() => {
    const filtered = kategoriler.filter((k) => k.type === activeTab);
    const rootCategories = filtered.filter((k) => !k.parent_id);

    return rootCategories.map((root) => ({
      ...root,
      children: filtered.filter((k) => k.parent_id === root.id),
    }));
  }, [kategoriler, activeTab]);

  // Ana kategoriler (parent_id olmayan) - form için
  const getParentCategories = useCallback(
    (type: KategoriTab) => {
      return kategoriler.filter((k) => k.type === type && !k.parent_id);
    },
    [kategoriler]
  );

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const isExpanded = useCallback(
    (id: string) => expandedIds.has(id),
    [expandedIds]
  );

  return {
    profile,
    kategoriler,
    hierarchicalData,
    refreshing,
    activeTab,
    setActiveTab,
    onRefresh,
    getParentCategories,
    toggleExpand,
    isExpanded,
    fetchKategoriler,
  };
}
