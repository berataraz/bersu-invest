# QA Raporu

Tarih: 2026-08-07

## Uygulanan Kontroller

| Kontrol | Sonuç | Kanıt |
| --- | --- | --- |
| Prisma format | Geçti | `npx prisma format` |
| Prisma doğrulama | Geçti | `npm run prisma:validate` |
| Prisma istemcisi | Geçti | `npm run prisma:generate` |
| Supabase migration | Geçti | `20260807113000_add_admin_staff_profiles_and_property_assignment` deploy edildi. |
| Idempotent seed | Geçti | `npm run prisma:seed` operasyonel örnek veri eklemeden tamamlandı. |
| TypeScript | Geçti | `npm run typecheck` |
| ESLint | Geçti | `npm run lint` (`--max-warnings=0`) |
| Production build | Geçti | `npm run build` |
| Anonim dashboard koruması | Geçti | Gerçek tarayıcıda `/dashboard`, `/admin/login`a yönlendi. |

## Yönetim Akışı Durumu

| Senaryo | Sonuç | Not |
| --- | --- | --- |
| İlan formu ve kalıcı API | Uygulandı | POST/PATCH, manuel benzersiz ilan numarası, danışman ataması ve durum güncellemeleri. |
| Müşteri formu ve kalıcı API | Uygulandı | CRM müşteri, gereksinim JSON'u, not ve timeline kaydı. |
| Kullanıcı/danışman/yönetici oluşturma | Uygulandı | Hashlenmiş parola, rol ataması, sunucu tarafı yetki kontrolü. |
| Görev/randevu oluşturma | Uygulandı | Mevcut CRM API'leriyle kalıcı kayıt. |
| Tarayıcıda giriş sonrası tam CRUD | Doğrulanmadı | Mevcut kullanıcı parolası bilinmeden geçici Super Admin oluşturmak ek açık onay gerektirir; hesap oluşturulmadı. |
| Dosya yükleme | Doğrulanmadı | Yetkili oturum ve gerçek geçici ilan olmadan dosya seçimi/POST yapılmadı. |
| Google harita etkileşimi | Doğrulanmadı | Google Maps API anahtarı mevcut değil. |
| Playwright/unit/integration testleri | Yok | Projede test runner yapılandırması bulunmuyor. |

## Bilinen Uyarı

Prisma, `package.json#prisma` yapılandırmasının Prisma 7'de kaldırılacağını bildiriyor. Bu uyarı güncel migration, lint, typecheck veya build işlemlerini engellemiyor.
