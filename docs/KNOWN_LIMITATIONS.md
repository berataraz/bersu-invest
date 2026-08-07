# Bilinen Sınırlamalar

- Dergi, site içeriği, SEO, bölgeler, çeviriler, medya kütüphanesi, bildirim merkezi ve rol/izin düzenleyicisi için veri modeli veya yönetim ekranı bu sürümde henüz tamamlanmadı. Görünür yönetim menüsünde çalışmayan bağlantı olarak gösterilmezler.
- Ayrı "mülkünü sat" talep modeli bulunmuyor; mevcut `Lead` modeli gayrimenkul talepleri için kullanılıyor. Sahip talepleri ve taslaktan ilana dönüştürme ek geliştirme gerektirir.
- Yerel medya depolaması yalnızca geliştirme içindir. Üretim için S3 uyumlu veya Cloudinary depolama adaptörü gereklidir.
- Google Maps ile tıklama ve işaretçi sürükleme için geçerli `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` gereklidir; anahtar yokken koordinatlar manuel girilir. Yer arama ve reverse-geocoding henüz eklenmedi.
- Medya yükleme, kapak seçimi ve silme uygulanmıştır; sürükle-bırakla sıralama, tarayıcı tabanlı önizleme kuyruğu, görüntü dönüştürme ve video/360 URL alanları henüz tamamlanmadı.
- Agent'ın yalnızca kendi kayıtlarını görmesini sağlayacak veri kapsamı (row scope) henüz tüm sorgulara uygulanmadı; mevcut sunucu tarafı RBAC rol/izin seviyesindedir.
- Kullanıcı oturumu olmadan tarayıcıda gerçek create/edit/save testi tamamlanmadı. Geçici bir ayrıcalıklı denetim hesabı oluşturmak için ek güvenlik onayı gerekir.
- Playwright, unit ve integration test runner yapılandırması bulunmuyor.
- Prisma 7 öncesinde `package.json#prisma` ayarı `prisma.config.ts`e taşınmalıdır.
