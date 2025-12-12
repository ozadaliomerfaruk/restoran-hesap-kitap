/**
 * Store Slices - Public API
 *
 * Tüm slice'ları buradan export ediyoruz.
 */

// Core
export { createProfileSlice, type ProfileSlice } from "./profileSlice";
export {
  createSubscriptionSlice,
  type SubscriptionSlice,
} from "./subscriptionSlice";

// Finans
export { createKasaSlice, type KasaSlice } from "./kasaSlice";
export { createCariSlice, type CariSlice } from "./cariSlice";
export { createKategoriSlice, type KategoriSlice } from "./kategoriSlice";
export { createIslemSlice, type IslemSlice } from "./islemSlice";
export {
  createTekrarlayanOdemeSlice,
  type TekrarlayanOdemeSlice,
} from "./tekrarlayanOdemeSlice";
export { createCekSenetSlice, type CekSenetSlice } from "./cekSenetSlice";
export { createTaksitSlice, type TaksitSlice } from "./taksitSlice";

// Personel
export { createPersonelSlice, type PersonelSlice } from "./personelSlice";
export { createIzinSlice, type IzinSlice } from "./izinSlice";

// Satış
export {
  createGunlukSatisSlice,
  type GunlukSatisSlice,
} from "./gunlukSatisSlice";
export { createMenuItemSlice, type MenuItemSlice } from "./menuItemSlice";
export {
  createUrunKategoriSlice,
  type UrunKategoriSlice,
} from "./urunKategoriSlice";
export { createSatisKaydiSlice, type SatisKaydiSlice } from "./satisKaydiSlice";
export { createUrunSlice, type UrunSlice } from "./urunSlice";

// Diğer
export { createAnimsaticiSlice, type AnimsaticiSlice } from "./animsaticiSlice";
