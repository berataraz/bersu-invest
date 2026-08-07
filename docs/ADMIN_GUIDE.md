# Yönetim Paneli Kılavuzu

## Kurulum

Supabase bağlantısı yapılandırıldıktan sonra aşağıdaki iki komutu çalıştırın:

```bash
npx prisma migrate deploy
npm run prisma:seed
```

Seed yalnızca dilleri, rolleri, izinleri ve başlangıç mülk tipini idempotent biçimde oluşturur. İlan, müşteri veya örnek operasyon kaydı eklemez.

## İlk Yönetici

İlk hesabı yalnızca terminalden ve güçlü, özel bir parolayla oluşturun:

```bash
INITIAL_ADMIN_EMAIL="arazberat48@gmail.com" INITIAL_ADMIN_PASSWORD="guclu-ozel-parola" npm run admin:seed
```

Parola en az 12 karakter, büyük harf, küçük harf ve rakam içermelidir. Parola kaynak koda veya `.env.example` dosyasına yazılmamalıdır.

Kilitlenen veya erişilemeyen yönetici hesabını güvenle sıfırlamak için:

```bash
npm run admin:reset-password
```

Komut parolayı iki kez gizli olarak ister, mevcut oturumları geçersiz kılar ve parolayı ekrana yazmaz.

## Erişim

- Giriş: `http://localhost:3000/admin/login`
- Panel: `http://localhost:3000/dashboard`

Uygulama farklı bir portta çalıştırılırsa portu URL'ye yansıtın. Anonim `/dashboard` erişimi giriş sayfasına yönlenir.

## Çalışan Yönetim Alanları

- İlanlar: taslak, yayınlama, arşivleme, benzersiz manuel ilan numarası, danışman ataması, koordinat, özellikler ve medya kaydı.
- Müşteriler: kişi/iletişim, arama kriteri, danışman ataması, notlar ve aktivite zaman çizelgesi.
- Ekip: kullanıcı, danışman ve yönetici oluşturma; rol, profil, parola ve aktiflik durumu.
- Operasyon: görevler ve randevular; müşteri, ilan ve kullanıcı bağlantıları.
- Talepler: mevcut CRM lead kayıtlarının listesi.

## Medya ve Harita

Geliştirmede medya dosyaları `public/uploads/properties` altında saklanır. Üretimde kalıcı S3 uyumlu veya Cloudinary sağlayıcısı yapılandırılmadan dosya yükleme etkinleştirilmemelidir.

Haritada tıklama/sürükleme için `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` gerekir. Anahtar yoksa koordinatlar manuel kaydedilebilir ve Google Maps bağlantısıyla görüntülenebilir.
