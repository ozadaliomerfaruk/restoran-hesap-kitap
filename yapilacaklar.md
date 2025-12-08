# Restoran Hesap Kitap Uygulaması

## Genel Bakış

**Amaç:** Restoranların günlük finansal işlemlerini takip edebileceği, cari hesap, kasa, personel ve raporlama özellikleri içeren mobil uygulama.

**Platform:** iOS + Android (Expo/React Native)

**Teknik Altyapı:** Supabase (Auth, Database, Storage)

**Kullanıcı Yapısı:** Çoklu restoran, çoklu kullanıcı, rol bazlı yetkilendirme

---

## Fiyatlandırma

|                        | **Ücretsiz** | **Pro (299₺/ay)** | **Premium (499₺/ay)** |
| ---------------------- | ------------ | ----------------- | --------------------- |
| Cari hesap             | 15           | 100               | Sınırsız              |
| Personel               | 10           | 50                | Sınırsız              |
| Kasa (Nakit)           | 3            | 5                 | Sınırsız              |
| Kasa (Banka)           | 3            | 7                 | Sınırsız              |
| Kasa (Kredi Kartı)     | 1            | 5                 | Sınırsız              |
| Kasa (Birikim)         | ❌           | ✅                | Sınırsız              |
| Döviz hesabı (USD/EUR) | ❌           | ✅                | ✅                    |
| Kategori ekleme        | 5            | 50                | Sınırsız              |
| Tekrarlayan ödeme      | 5            | 50                | Sınırsız              |
| Çek/Senet              | ❌           | ✅                | ✅                    |
| Taksit takibi          | ❌           | ✅                | ✅                    |
| Günlük satış           | ❌           | ✅                | ✅                    |
| Fotoğraf ekleme        | ❌           | ✅                | ✅                    |
| Raporlar               | Temel        | Gelişmiş          | Gelişmiş              |
| Excel/PDF export       | ❌           | ✅                | ✅                    |
| E-mail rapor           | ❌           | ❌                | ✅                    |
| Çoklu restoran         | 1            | 1                 | 5                     |
| Kullanıcı paylaşımı    | ❌           | 2 kişi            | 10 kişi               |
| Arşiv                  | ❌           | ✅                | ✅                    |

**Not:** Tüm limitler sadece aktif kayıtları sayar. Arşivdeki kayıtlar limite dahil değil.

---

## Modüller

### 1. Cari Hesap Modülü

**Açıklama:** Tedarikçi ve müşteri hesaplarının takibi

**Cari Tipleri:**

- Tedarikçi
- Müşteri (veresiye takibi)

**İşlem Tipleri:**

| İşlem        | Cari Bakiye   | Reel Gelir/Gider | Kasa          |
| ------------ | ------------- | ---------------- | ------------- |
| Alış         | Borç artar    | Gider yazılır    | Etkilenmez    |
| Satış        | Alacak artar  | Gelir yazılır    | Etkilenmez    |
| İade (alış)  | Borç azalır   | Gider azalır     | Etkilenmez    |
| İade (satış) | Alacak azalır | Gelir azalır     | Etkilenmez    |
| Ödeme        | Borç azalır   | Etkilenmez       | Kasadan çıkar |
| Tahsilat     | Alacak azalır | Etkilenmez       | Kasaya girer  |

**Alış Girişi - İki Yöntem:**

_Yöntem 1: Toplu (hızlı)_

- Kategori seç
- Tutar gir
- Fotoğraf ekle (opsiyonel)

_Yöntem 2: Kalemli (detaylı)_

- Her kalem için: Ürün, miktar, birim fiyat, kategori, KDV (zorunlu)
- Farklı kategoriler tek faturada olabilir
- Fotoğraf ekle (opsiyonel)

**Cari Özellikleri:**

- Başlangıç bakiyesi ekleyebilme (yeni cari açarken)
- "Hesaba dahil etme" ayarı (aktifse gelir/gidere yansımaz)
- Arşive alma özelliği

---

### 2. Kasa Yönetimi Modülü

**Kasa Tipleri:**

| Kasa                 | Açıklama                             |
| -------------------- | ------------------------------------ |
| Nakit                | Fiziksel para, günlük tahsilat/ödeme |
| Banka                | Havale, EFT                          |
| Kredi Kartı          | Kartla yapılan harcamalar            |
| Birikim (Çelik Kasa) | Yedek para, aylık aktarımlar         |

**Özellikler:**

- Kasalar arası transfer
- Her kasa için ayrı bakiye ve hareket geçmişi
- Döviz hesabı açabilme (USD, EUR) - Birikim ve Banka'da
- Arşive alma özelliği

---

### 3. Kredi Kartı Taksit Modülü

**Akış:**

1. Toplam tutar girilir (örn: 30.000₺ bulaşık makinesi)
2. Taksit sayısı belirlenir (örn: 10 taksit)
3. Gider ilk ay tamamı yazılır (30.000₺)
4. Her ay taksit ödemesi kasadan çıkar (3.000₺)

**Takip:**

- Kalan taksit sayısı
- Aylık taksit tutarı
- Toplam kalan borç

---

### 4. Çek/Senet Takibi Modülü

**Alanlar:**

- Tip: Çek / Senet
- Yön: Verilen / Alınan
- Tutar
- Vade tarihi
- İlişkili cari
- Durum

**Durumlar:**

- Beklemede
- Tahsil edildi (alınan)
- Ödendi (verilen)
- Karşılıksız

**Özellikler:**

- Vade geldiğinde bildirim
- Vade geldiğinde ilgili kasayı etkiler

---

### 5. Personel Modülü

**Bakiye Mantığı:** Cari gibi çalışır (borç/alacak)

**İşlem Tipleri:**

| İşlem            | Personel Bakiye | Reel Gider    | Kasa          |
| ---------------- | --------------- | ------------- | ------------- |
| Maaş (hak ediş)  | Borç artar      | Gider yazılır | Etkilenmez    |
| Prim (hak ediş)  | Borç artar      | Gider yazılır | Etkilenmez    |
| Mesai (hak ediş) | Borç artar      | Gider yazılır | Etkilenmez    |
| Tazminat         | Borç artar      | Gider yazılır | Etkilenmez    |
| Komisyon         | Borç artar      | Gider yazılır | Etkilenmez    |
| Avans            | Alacak artar    | Etkilenmez    | Kasadan çıkar |
| Ödeme            | Borç azalır     | Etkilenmez    | Kasadan çıkar |

**İzin Takibi:**

- Yıllık izin
- Hastalık izni
- Ücretsiz izin
- İzin hakkı, kullanılan, kalan
- Manuel izin girişi

**Personel Özellikleri:**

- "Hesaba dahil etme" ayarı
- Arşive alma özelliği

---

### 6. Ürün & Kategori Modülü

**Ürün Tanımları:**

- Ürün adı (domates, tavuk, deterjan vs.)
- Kategori
- Birim (kg, adet, litre vs.)

**Kategoriler:** Kullanıcı tarafından özelleştirilebilir (varsayılan liste + ekleme)

**Not:** Stok takibi yok, sadece alım geçmişi tutulur.

---

### 7. Günlük Satış Modülü

**Akış:**

1. Tarih seç
2. Yemek seç (menü tanımlarından)
3. Adet gir
4. Tutar gir

**Menü Tanımları:**

- Yemek adı (köfte, pizza vs.)
- Kategori (ana yemek, tatlı, içecek vs.)

---

### 8. Tekrarlayan Ödemeler Modülü

**Kullanıcı Tanımları:**

- Açıklama (örn: Kira, Elektrik)
- Tutar
- Kategori
- Periyot (her ay, 2 ayda bir, 3 ayda bir, 6 ayda bir, yıllık)
- Başlangıç tarihi
- Bitiş tarihi (opsiyonel)

**Özellikler:**

- Hatırlatıcı bildirimi
- Otomatik işlem oluşturma (opsiyonel)

---

### 9. Yaklaşan Ödemeler / Anımsatıcı

**Açıklama:** Tek seferlik hatırlatıcılar (tekrarlayan ödemelerden ayrı)

**Alanlar:**

- Başlık
- Açıklama
- Tarih
- Tutar (opsiyonel)
- Bildirim zamanı

---

### 10. Kullanıcı & Rol Yönetimi

**Roller:**

| Rol          | Yetkiler                                |
| ------------ | --------------------------------------- |
| Admin/Patron | Tüm erişim, kullanıcı yönetimi, ayarlar |
| Muhasebeci   | Tüm finansal veriler, raporlar          |
| Satın Almacı | Sadece cariler ve tedarikçi işlemleri   |
| Kasiyer      | Sadece günlük kasa giriş/çıkış          |

**Aktivite Logu:**

- Kim
- Ne zaman
- Hangi işlemi yaptı
- Eski değer / Yeni değer

---

### 11. Raporlar Modülü

**Temel Raporlar (Ücretsiz):**

- Genel gelir/gider özeti
- Kasa bakiyeleri

**Gelişmiş Raporlar (Pro/Premium):**

- Dönemsel gelir/gider (haftalık, aylık, yıllık)
- Kasa bazlı detaylı hareketler
- Cari bazlı borç/alacak durumu
- Kategori bazlı gider dağılımı
- Ürün bazlı alım raporu (miktar, tutar)
- Yemek bazlı satış analizi
- Personel maaş ödemeleri
- Personel izin durumu

**Export Özellikleri (Pro/Premium):**

- Excel export
- PDF export
- E-mail ile gönderme (sadece Premium)

---

## Gelir/Gider Kategorileri

### Gider Kategorileri (Hiyerarşik)

| Ana Kategori             | Alt Kategoriler                                                                                                                                       |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Banka komisyonları       | -                                                                                                                                                     |
| Paket yemek komisyonları | -                                                                                                                                                     |
| Ceza                     | -                                                                                                                                                     |
| Diğer lokanta giderleri  | Aidat, Danışmanlık hizmetleri, Kargo, Rehber hakedişleri                                                                                              |
| Ekipman giderleri        | -                                                                                                                                                     |
| İşyeri bakım onarım      | -                                                                                                                                                     |
| Personel                 | Maaş, Mesai, Prim, SGK, Ekstra personel, Komisyon, Tip                                                                                                |
| Reklam ve pazarlama      | -                                                                                                                                                     |
| Tedarikçi                | Ambalaj ürünleri, Bar ürünleri, Donuk ürünler, Et ve tavuk, Gıda dışı, Kahvaltı, Kuru gıda, Manav, Pastane, Süt ve süt ürünleri, Temizlik malzemeleri |
| Yatırım                  | -                                                                                                                                                     |
| Fatura                   | Elektrik, Doğalgaz, Su, İnternet, Telefon                                                                                                             |
| Kira                     | -                                                                                                                                                     |
| Araç giderleri           | Bakım tamirat, Yakıt, Diğer                                                                                                                           |
| Vergi                    | KDV, Muhtasar, Stopaj, Kurumlar, Diğer                                                                                                                |

### Gelir Kategorileri

| Ana Kategori          | Alt Kategoriler |
| --------------------- | --------------- |
| Ciro                  | -               |
| Muhtelif Gelir        | -               |
| Etkinlik/Organizasyon | -               |
| Diğer                 | -               |

**Not:** Kategoriler özelleştirilebilir. Restoran kendi ana/alt kategorisini ekleyebilir.

---

## Önemli Kavramlar

### Nakit Akışı vs Reel Gelir/Gider

|               | Nakit Akışı          | Reel Gelir/Gider      |
| ------------- | -------------------- | --------------------- |
| Takip ettiği  | Para el değiştirmesi | İşlemin gerçekleşmesi |
| Alış faturası | Ödeme yapınca        | Fatura kesilince      |
| Maaş          | Ödeme yapınca        | Hak ediş girince      |
| Kullanım      | Kasa bakiyesi        | Kar/zarar hesabı      |

### Arşiv Kuralı

Tüm limitler sadece aktif kayıtları sayar. Arşivdeki kayıtlar limite dahil değildir.

Örnek: Pro planında 50 personel limiti var. 40 personel açtın, 15'ini arşive attın. Aktif personel = 25. 25 personel daha açabilirsin.

---

## Genel Özellikler

### Arama

- Cari ismine göre
- İşlem açıklamasına göre
- Ürün ismine göre

### Filtreleme

- Tarih aralığı (bugün, bu hafta, bu ay, özel aralık)
- İşlem tipi
- Kategori

### Düzenleme/Silme

- Yanlış girilen işlem düzenlenebilir
- Silinen işlem bakiyeleri otomatik geri alınır
- Tüm değişiklikler aktivite loguna düşer

### Bildirimler

- Yaklaşan ödeme hatırlatıcısı
- Çek/senet vade uyarısı
- Taksit ödeme günü
- Tekrarlayan ödeme hatırlatıcısı

### Dashboard (Ana Ekran)

- Günlük özet (bugünkü giriş/çıkış)
- Kasa bakiyeleri
- Yaklaşan ödemeler
- Kritik uyarılar (vadesi geçen çek, yaklaşan taksit vs.)

### Yedekleme

- Supabase cloud üzerinde otomatik
- Manuel yedek alma seçeneği

### Çoklu Dil

- Türkçe (varsayılan)
- İngilizce (ileride)

---

## Teknik Notlar

### Tech Stack

- **Frontend:** Expo (React Native) + TypeScript
- **Backend:** Supabase (Auth, Database, Storage, RLS)
- **Routing:** Expo Router (file-based)
- **State:** React Context veya Zustand

### Offline (İleride)

- Şu an için sadece online çalışacak
- Kullanıcı geri bildirimine göre WatermelonDB ile offline-first eklenebilir

---

## Sonraki Adımlar

1. [ ] Database şeması tasarımı (Supabase tabloları)
2. [ ] UI/UX akışları ve ekran tasarımları
3. [ ] Expo proje kurulumu
4. [ ] Auth sistemi (Supabase Auth)
5. [ ] Temel CRUD işlemleri
6. [ ] Modüllerin geliştirilmesi
7. [ ] Raporlama sistemi
8. [ ] Bildirim sistemi
9. [ ] Abonelik/ödeme entegrasyonu
10. [ ] Test ve QA
11. [ ] App Store / Play Store yayınlama
