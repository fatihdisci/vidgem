# 🦖 Kayıp Türler: Belgesel Motoru (Lost Species: Documentary Engine)

Kayıp Türler Belgesel Motoru, YouTube ve sosyal medya platformları için yüksek kalitede, sinematik mini doğa belgeselleri (özellikle nesli tükenmiş canlılar konseptinde) üretmek için tasarlanmış **tamamen istemci taraflı (client-side)** bir React uygulamasıdır. 

Hiçbir sunucuya veya yapay zeka API'sine ihtiyaç duymadan, doğrudan tarayıcınızın ve bilgisayarınızın yerel gücünü kullanarak 4K kalitesinde, akıcı ve profesyonel videolar (MP4) render edebilirsiniz.

---

## ✨ Öne Çıkan Özellikler

*   **Sinematik "Red List" İntro & Outro:** "EXTINCT IN" daktilo efekti, sarsıntılı "STATUS: EXTINCT" mühür animasyonu ve kanal adınızın zarifçe belirdiği outro sekansı.
*   **Donanım Hızlandırmalı Akıcı Animasyonlar (60fps):** Resimler arası geçişlerde ve not okuma sırasındaki sinematik zoom-pan (yaklaşma/uzaklaşma) efektleri ekran kartı (GPU) üzerinden işlenir. Takılma (jitter) engellenmiştir.
*   **Seslendirme Senkronize Metin Motoru:** Bilgi kutularındaki yazıların belirme hızı, kutunun ekranda kalma süresinin %85'ine otomatik yayılarak doğal bir "seslendirme (voiceover)" ritmi yakalar.
*   **Assets Preloader (Kayıpsız Geçişler):** Video veya önizleme başlamadan önce tüm yüksek çözünürlüklü görseller RAM'e (önbelleğe) yüklenir. Böylece video esnasında resim yüklenmesi kaynaklı kasmalar yaşanmaz.
*   **Gelişmiş Bellek Yönetimi:** Silinen sahnelerde `URL.revokeObjectURL()` tetiklenerek olası RAM şişmeleri (Memory Leak) engellenir.
*   **4K Çözünürlük ve Yüksek Bitrate Export:** `MediaRecorder` API kullanılarak donanımın desteklediği maksimum çözünürlükte (İdeal: 3840x2160) ve 40 Mbps (Lossless'a yakın) kalitede MP4 çıktısı alınır.

---

## 🛠 Teknik Altyapı ve Mimari

*   **Core:** React 19, TypeScript, Vite
*   **State Management:** React Context API (`DocumentaryContext`)
*   **Styling:** Tailwind CSS (Modern, karanlık/glassmorphism UI)
*   **Animations:** Framer Motion (Karmaşık CSS animasyonları yerine GPU odaklı transitionlar)
*   **Icons:** Lucide React
*   **Render:** HTML5 MediaRecorder API (H.264/VP9)

*Not: Uygulama içerisinde herhangi bir bulut sunucu, veritabanı veya 3. parti API (OpenAI, Gemini vb.) kullanılmamaktadır. Tüm veriler çalışma anında tarayıcı belleğinde (RAM) tutulur ve işlenir.*

---

## 📖 Kullanım Rehberi

### 1. Hazırlık ve Ayarlar
1. Sol menüdeki **"Global Configuration"** paneline gidin.
2. Anlatacağınız canlının yok olma yılını (Örn: `1936`) ve belgeselin sonunda çıkacak Kanal Adını (Örn: `WILD ARCHIVES`) girin.

### 2. Görsel Ekleme
1. Sol menüdeki **"Canlı Fotoları"** butonuna tıklayarak bilgisayarınızdan görüntüleri seçin.
2. Yüklenen görüntüler sol panelde sahneler olarak sıralanacaktır. Sırasını veya eklentilerini dilediğiniz gibi silebilir/yönetebilirsiniz.

### 3. Bilgi Notları ve Lazer Hedefleme Ekleme
1. Orta kısımdaki büyük **Görsel Düzenleyiciye (Canvas)** farenizle tıklayın.
2. Tıkladığınız yere holografik bir hedefleme radarı yerleşecek ve sağ bölmede (Right Sidebar) bir "Bilgi Notu" ayar sekmesi açılacaktır.
3. Sağ bölmedeki alana belgesel metnini yazın.
4. **Süre Ayarı:** Notun ekranda ne kadar kalacağını sürgülü çubukla veya "Metne Göre Otomatik Hesapla" butonuyla yapay zeka hızında ayarlayın.

### 4. Önizleme ve Çıktı Alma
1. **Önizleme:** Sağ üstteki butona tıklayarak videonun tarayıcı üzerinde nasıl aktığını tam ekran izleyebilirsiniz.
2. **Video Olarak İndir:** Düzenlemeleriniz bittiğinde bu butona tıklayarak donanımınızın gücüyle videonun render edilmesini sağlayın. Video biter bitmez `.mp4` formatında bilgisayarınıza inecektir.

---

## 💻 Kurulum (Lokal Ortamda Çalıştırma)

Ekran kaydı tabanlı sistemlerin maksimum akıcılığa ulaşması için uygulamanın tarayıcı sekmelerinden bağımsız olarak yerel bilgisayarda çalıştırılması çok daha yüksek performans verir.

**Gereksinimler:**
*   Node.js (v18 veya üzeri önerilir)

**Adımlar:**
1. Proje dosyalarını (ZIP olarak) bilgisayarınıza indirin ve klasöre çıkartın.
2. Bir terminal (veya Komut İstemcisi / VS Code terminali) açıp proje klasörünün içine girin.
3. Bağımlılıkları yüklemek için aşağıdaki komutu çalıştırın:
   ```bash
   npm install
   ```
4. Geliştirme sunucusunu başlatmak için aşağıdaki komutu çalıştırın:
   ```bash
   npm run dev
   ```
5. Terminalde size verilen localhost adresini (Örn: `http://localhost:5173/`) tarayıcınızda açarak kendi donanım gücünüzle muazzam akıcılıkta videolar üretmeye başlayın.
