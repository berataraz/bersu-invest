# Yönetim Veri Modeli

## Ekip ve Yetki

- `User`, `Role`, `Permission`, `UserRole`, `RolePermission` ve `UserPermission` rol tabanlı erişimi sağlar.
- `User.passwordHash` yalnızca Argon2id hash saklar.
- Personel profili için `phone`, `whatsapp`, `jobTitle`, `biography`, `preferredLocales`, `socialLinks` ve `displayOrder` alanları bulunur.

## Portföy

- `Property.propertyId` benzersiz ilan numarasıdır; formdan girilebilir veya otomatik üretilebilir.
- `Property.assignedAgentId`, ilanı bir `User` kaydına bağlar.
- `Property.details`, farklı mülk türlerindeki dinamik özellikler için JSONB alanıdır.
- `PropertyMedia`, medya sırası, kapak işareti, alt metin ve depolama anahtarını tutar.

## CRM

- `Customer` kişi ve iletişim verisini; `customFields` arama gereksinimlerini tutar.
- `Lead`, `Task`, `Appointment`, `FollowUp`, `CustomerNote` ve `TimelineEvent` müşteri takibini oluşturur.
- `AuditLog` kim tarafından hangi kaydın değiştirildiğini kaydeder.

## Yeni Migration

`20260807113000_add_admin_staff_profiles_and_property_assignment` mevcut tablolara veri silmeden profil kolonlarını, `Property.assignedAgentId` dış anahtarını ve ilgili indeksi ekler.
