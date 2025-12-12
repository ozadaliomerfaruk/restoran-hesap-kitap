/**
 * Finansal Özet Hesaplamaları Hook
 */

import { useMemo } from "react";
import { Kasa, Cari, Personel } from "@/types";

interface FinansalOzetParams {
  kasalar: Kasa[];
  cariler: Cari[];
  personeller: Personel[];
}

export function useFinansalOzet({
  kasalar,
  cariler,
  personeller,
}: FinansalOzetParams) {
  return useMemo(() => {
    // Hesaplardaki toplam para
    const toplamHesaplar = kasalar
      .filter((k) => !k.is_archived)
      .reduce((sum, k) => sum + k.balance, 0);

    // Tedarikçiler
    const tedarikciler = cariler.filter(
      (c) => c.type === "tedarikci" && !c.is_archived
    );
    const tedarikcidenAlacak = tedarikciler
      .filter((c) => c.balance < 0)
      .reduce((sum, c) => sum + Math.abs(c.balance), 0);
    const tedarikciyeBorcumuz = tedarikciler
      .filter((c) => c.balance > 0)
      .reduce((sum, c) => sum + c.balance, 0);

    // Müşteriler
    const musteriler = cariler.filter(
      (c) => c.type === "musteri" && !c.is_archived
    );
    const musterilerdenAlacak = musteriler
      .filter((c) => c.balance > 0)
      .reduce((sum, c) => sum + c.balance, 0);
    const musterilereBorcumuz = musteriler
      .filter((c) => c.balance < 0)
      .reduce((sum, c) => sum + Math.abs(c.balance), 0);

    // Personel
    const aktifPersoneller = personeller.filter((p) => !p.is_archived);
    const personeldenAlacak = aktifPersoneller
      .filter((p) => p.balance < 0)
      .reduce((sum, p) => sum + Math.abs(p.balance), 0);
    const personeleBorcumuz = aktifPersoneller
      .filter((p) => p.balance > 0)
      .reduce((sum, p) => sum + p.balance, 0);

    // Toplamlar
    const toplamAlacaklar =
      tedarikcidenAlacak + musterilerdenAlacak + personeldenAlacak;
    const toplamBorclar =
      tedarikciyeBorcumuz + musterilereBorcumuz + personeleBorcumuz;

    // Net Durum
    const netDurum = toplamHesaplar + toplamAlacaklar - toplamBorclar;

    return {
      toplamHesaplar,
      tedarikcidenAlacak,
      tedarikciyeBorcumuz,
      musterilerdenAlacak,
      musterilereBorcumuz,
      personeldenAlacak,
      personeleBorcumuz,
      toplamAlacaklar,
      toplamBorclar,
      netDurum,
      tedarikciler,
      musteriler,
      aktifPersoneller,
    };
  }, [kasalar, cariler, personeller]);
}
