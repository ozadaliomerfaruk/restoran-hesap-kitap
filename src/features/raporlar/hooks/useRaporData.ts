// useRaporData Hook

import { useEffect, useCallback, useMemo } from "react";
import { useStore } from "../../../store/useStore";
import { RaporHesaplamalar } from "../types";

export const useRaporData = (startDate: string, endDate: string) => {
  const {
    kasalar,
    cariler,
    personeller,
    islemler,
    fetchKasalar,
    fetchCariler,
    fetchPersoneller,
    fetchIslemler,
    profile,
    fetchProfile,
  } = useStore();

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile?.restaurant_id) {
      Promise.all([
        fetchKasalar(),
        fetchCariler(),
        fetchPersoneller(),
        fetchIslemler(),
      ]);
    }
  }, [profile?.restaurant_id]);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchKasalar(),
      fetchCariler(),
      fetchPersoneller(),
      fetchIslemler(),
    ]);
  }, [fetchKasalar, fetchCariler, fetchPersoneller, fetchIslemler]);

  const filteredIslemler = useMemo(
    () =>
      islemler.filter((i) => {
        const d = i.date.split("T")[0];
        return d >= startDate && d <= endDate;
      }),
    [islemler, startDate, endDate]
  );

  const hesaplamalar: RaporHesaplamalar = useMemo(() => {
    const toplamGelir = filteredIslemler
      .filter((i) => i.type === "gelir" || i.type === "tahsilat")
      .reduce((s, i) => s + i.amount, 0);
    const toplamGider = filteredIslemler
      .filter((i) => i.type === "gider" || i.type === "odeme")
      .reduce((s, i) => s + i.amount, 0);
    const toplamKasa = kasalar
      .filter((k) => !k.is_archived)
      .reduce((s, k) => s + (k.balance || 0), 0);
    const tedarikciBorc = cariler
      .filter(
        (c) => !c.is_archived && c.type === "tedarikci" && (c.balance || 0) > 0
      )
      .reduce((s, c) => s + (c.balance || 0), 0);
    const musteriAlacak = cariler
      .filter(
        (c) => !c.is_archived && c.type === "musteri" && (c.balance || 0) > 0
      )
      .reduce((s, c) => s + (c.balance || 0), 0);
    const personelBorc = personeller
      .filter((p) => !p.is_archived && (p.balance || 0) > 0)
      .reduce((s, p) => s + (p.balance || 0), 0);
    return {
      toplamGelir,
      toplamGider,
      netKar: toplamGelir - toplamGider,
      toplamKasa,
      tedarikciBorc,
      musteriAlacak,
      personelBorc,
    };
  }, [filteredIslemler, kasalar, cariler, personeller]);

  const borcluCariler = useMemo(
    () =>
      cariler
        .filter(
          (c) =>
            !c.is_archived && c.type === "tedarikci" && (c.balance || 0) > 0
        )
        .sort((a, b) => (b.balance || 0) - (a.balance || 0)),
    [cariler]
  );
  const alacakliMusteriler = useMemo(
    () =>
      cariler
        .filter(
          (c) => !c.is_archived && c.type === "musteri" && (c.balance || 0) > 0
        )
        .sort((a, b) => (b.balance || 0) - (a.balance || 0)),
    [cariler]
  );
  const borcluPersoneller = useMemo(
    () =>
      personeller
        .filter((p) => !p.is_archived && (p.balance || 0) > 0)
        .sort((a, b) => (b.balance || 0) - (a.balance || 0)),
    [personeller]
  );
  const aktifKasalar = useMemo(
    () => kasalar.filter((k) => !k.is_archived),
    [kasalar]
  );

  return {
    hesaplamalar,
    borcluCariler,
    alacakliMusteriler,
    borcluPersoneller,
    aktifKasalar,
    refreshAll,
  };
};
