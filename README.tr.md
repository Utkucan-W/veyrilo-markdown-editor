# Veyrilo

> Thoughts, in flow.

[English](README.md) · **Türkçe**

[![CI](https://github.com/Utkucan-W/veyrilo-markdown-editor/actions/workflows/ci.yml/badge.svg)](https://github.com/Utkucan-W/veyrilo-markdown-editor/actions/workflows/ci.yml)
[![Son sürüm](https://img.shields.io/github/v/release/Utkucan-W/veyrilo-markdown-editor?sort=semver)](https://github.com/Utkucan-W/veyrilo-markdown-editor/releases/latest)
[![Lisans: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Veyrilo, Linux için sakin ve yerel çalışan bir Markdown editörüdür. Odaklı bir
yazma yüzeyini canlı önizleme, pratik biçimlendirme araçları ve masaüstüne özgü
dosya işlemleriyle birleştirir — hesap, abonelik veya çevrimiçi servis
gerektirmeden.

Veyrilo ücretsizdir ve öyle kalacak. Satılmıyor, reklam içermiyor ve hiçbir yere
veri göndermiyor. Bir hata bulursanız veya bir özellik isterseniz lütfen
[issue açın](https://github.com/Utkucan-W/veyrilo-markdown-editor/issues) — bu depo tam olarak
bunun için var.

[Tauri 2](https://v2.tauri.app/), sade JavaScript ve Rust ile geliştirildi.

**Güncel sürüm: [Veyrilo v1.1.0](https://github.com/Utkucan-W/veyrilo-markdown-editor/releases/tag/v1.1.0)** · [Debian paketini indir](https://github.com/Utkucan-W/veyrilo-markdown-editor/releases/download/v1.1.0/Veyrilo_1.1.0_amd64.deb)

## v1.1.0 ile gelenler

- Disk sürümünü yeniden yükleme veya editör sürümünü koruma seçenekleri sunan
  harici dosya değişikliği uyarıları.
- Çökme ve beklenmeyen kapanma sonrasında açık kullanıcı onayıyla taslak
  kurtarma.
- `Ctrl+Shift+P` ile açılan, aranabilir komut paleti.
- Markdown başlıklarından oluşturulan canlı Outline / İçindekiler paneli.
- `Ctrl+F`, geçerli ekranın dışındaki eşleşmeler de dahil olmak üzere etkin
  arama eşleşmesini artık görünür alana kaydırır.
- Hakkında penceresinde uygulama sürümünün gösterilmesi.

## Ekran görüntüleri

![Biçimlendirme çubuğu ve canlı belge istatistikleriyle editör](docs/screenshots/editor.png)

| Ayarlar ve temalar | Yerleşik Markdown Rehberi |
| --- | --- |
| ![Dil, tipografi ve tema seçeneklerini gösteren ayarlar paneli](docs/screenshots/settings.png) | ![Markdown Rehberi sekmesi: solda kaynak, sağda canlı önizleme](docs/screenshots/markdown-guide.png) |

## Özellikler

### Yazma

- GitHub Flavored Markdown'ın canlı önizlemesi, editörle yan yana.
- Önizleme, sayfanın yüzdesine göre değil gerçek blokları eşleyerek editörün
  kaydırma konumunu takip eder.
- Listeler kendiliğinden devam eder: bir madde, numaralı madde veya görev
  maddesindeyken Enter'a bastığınızda bir sonraki oluşturulur. Boş bir maddede
  Enter'a basmak listeyi bitirir.
- `Tab` ve `Shift+Tab` seçili tüm satırların girintisini birlikte artırır ve
  azaltır.
- Seçili metnin üzerine bir web adresi yapıştırdığınızda Markdown bağlantısına
  dönüşür.
- Kod blokları editörde kendi zeminini alır; yazarken kodu bulmak kolaydır.
- Canlı istatistik: kelime sayısı, karakter sayısı ve imleç konumu.

### Biçimlendirme

- Başlıklar, kalın, italik, üstü çizili, vurgulama, satır içi kod, kod bloğu,
  bağlantı, görsel, alıntı, listeler, görev listeleri, tablo ve yatay çizgi için
  biçimlendirme çubuğu.
- **33 klavye kısayolu, hepsi değiştirilebilir** — Ayarlar → Klavye Kısayolları.
  Yeni bir kombinasyon kaydederken çakışmalar anında bildirilir ve araç çubuğu
  ipuçları hemen güncellenir.
- Tablo oluşturucu penceresi: satır ve sütun sayısını seçin, hazır Markdown
  tablosunu alın.

### Bulma ve değiştirme

- `Ctrl+F` belgede arar, eşleşme sayısını gösterir, tüm eşleşmeleri yerinde
  vurgular ve etkin olanı görünür alana kaydırır. Enter ve `Shift+Enter` ile
  sonuçlar arasında gezinirsiniz.
- `Ctrl+H` bul ve değiştir satırını açar. Seçili eşleşmeyi ya da tümünü
  değiştirebilirsiniz; tümünü değiştirmek **tek bir geri alma adımı** sayılır.

### Okuma ve odaklanma

- **Odak modu**, yazdığınız paragraf dışındaki her şeyi soldurur.
- **Zen modu** (`F11`) arayüzü tamamen gizler.
- **Yedi tema**: Açık, Koyu, Sepya, Koyu Gri, Okyanus, Orman ve Gül; her biri
  kendi yazı, vurgu, seçim ve panel renkleriyle tanımlıdır.
- Ayarlanabilir yazı boyutu; `Ctrl+=` ve `Ctrl+-` ile.

### Yerleşik Markdown Rehberi

Türkçe ve İngilizce **18 konudan** oluşan ayrı bir sekme. Her kartta solda
kısayol, açıklama ve Markdown kaynağı; sağda ise aynı örneğin gerçek önizlemesi
bulunur. Rehberde gösterilen kısayollar canlı ayarlarınızdan okunur; bir tuşu
değiştirdiğinizde rehber de güncellenir.

### Dosyalar

- Yerel Markdown ve metin dosyalarını masaüstüne özgü pencerelerle açıp
  kaydedin.
- Bir Markdown veya metin dosyasını pencereye **sürükleyip bırakarak** açın.
- Linux dosya yöneticisinde sağ tıklayıp *Birlikte aç* ile dosya açın.
- Önceki belgeleri hızlıca açmak için son açılanlar menüsü.
- Kaydedilmemiş değişiklik varken pencereyi kapatmak önce onay ister.
- **HTML** olarak dışa aktarın veya sistem yazdırma penceresiyle **PDF** üretin.

### Arayüz

- Çalışırken değiştirilebilen tam Türkçe ve İngilizce arayüz.
- Tamamen çevrimdışı çalışır: Markdown, temizleme ve sözdizimi renklendirme
  kütüphaneleri uygulamanın içine gömülüdür.

## Linux'a kurulum

Otomatik yayın akışı x86_64 Debian paketi (`.deb`) üretir. Fedora RPM ve Arch
paketleri henüz yayınlanmıyor; bu dağıtımlarda kaynaktan kurulum yolunu
kullanın.

### Debian ve Ubuntu

[Son sürümden](https://github.com/Utkucan-W/veyrilo-markdown-editor/releases/latest)
`Veyrilo_*_amd64.deb` dosyasını indirin, ardından indirmenin bulunduğu dizinde
şunu çalıştırın:

```bash
sudo apt install ./Veyrilo_*_amd64.deb
```

Bu komut Veyrilo'yu uygulama menüsüne kurar ve olağan GTK ile WebKit çalışma
zamanı bağımlılıklarını APT üzerinden çözer. Node.js, Rust veya başka bir
geliştirme aracı gerekmez.

### Fedora

Henüz RPM yayın dosyası yok. Veyrilo'yu bugün Fedora'da kurmak için projeyi
klonlayıp yerel olarak derleyin:

```bash
git clone https://github.com/Utkucan-W/veyrilo-markdown-editor.git
cd veyrilo-markdown-editor
sudo dnf install nodejs npm rust cargo gcc-c++ webkit2gtk4.1-devel gtk3-devel libappindicator-gtk3-devel librsvg2-devel
npm install
npm run install:local
```

Son komut Veyrilo'yu derler ve geçerli kullanıcının uygulama menüsüne ekler.
Debian yayın dosyasını `rpm` veya `dnf` ile kurmayın.

### Arch Linux ve CachyOS

Henüz Arch paketi (`.pkg.tar.zst`) yok. Bunun yerine depodan derleyip kurun:

```bash
git clone https://github.com/Utkucan-W/veyrilo-markdown-editor.git
cd veyrilo-markdown-editor
sudo pacman -S --needed nodejs npm rust base-devel webkit2gtk-4.1 gtk3 libappindicator-gtk3 librsvg
npm install
npm run install:local
```

Menüye kurmadan geliştirme yapmak için son komut yerine `npm run desktop:dev`
kullanın. Debian `.deb` dosyasını `pacman` ile kullanmayın.

### Yerel kurulumu kaldırma

```bash
npm run uninstall:local
```

## Klavye kısayolları

Aşağıdakilerin tamamı varsayılandır ve Ayarlar → Klavye Kısayolları bölümünden
değiştirilebilir.

| İşlem | Kısayol |
| --- | --- |
| Kalın / İtalik / Üstü çizili | `Ctrl+B` · `Ctrl+I` · `Ctrl+D` |
| Vurgulama / Satır içi kod | `Ctrl+Shift+M` · `Ctrl+E` |
| Kod bloğu | `Ctrl+Shift+E` |
| Başlık 1–6 | `Ctrl+1` … `Ctrl+6` |
| Bağlantı / Görsel | `Ctrl+K` · `Ctrl+Shift+G` |
| Madde / Numaralı / Görev listesi | `Ctrl+Shift+L` · `Ctrl+Shift+O` · `Ctrl+Shift+X` |
| Alıntı / Tablo / Yatay çizgi | `Ctrl+Shift+Q` · `Ctrl+Shift+T` · `Ctrl+Shift+-` |
| Geri al / İleri al | `Ctrl+Z` · `Ctrl+Y` |
| Bul / Bul ve değiştir | `Ctrl+F` · `Ctrl+H` |
| Önizlemeyi aç-kapat | `Ctrl+P` |
| Odak modu / Zen modu | `Ctrl+Shift+F` · `F11` |
| Yeni / Aç / Kaydet | `Ctrl+N` · `Ctrl+O` · `Ctrl+S` |
| Ayarlar | `Ctrl+,` |
| Yazı boyutu | `Ctrl+=` · `Ctrl+-` |
| Seçili satırları girintile / geri al | `Tab` · `Shift+Tab` |

## Hata bildirimi ve özellik isteği

Hata bildirimleri ve fikirler gerçekten değerli — bu projenin açık olmasının
başlıca sebebi bu.

- **Bir şey bozuk mu?**
  [Hata bildirimi açın](https://github.com/Utkucan-W/veyrilo-markdown-editor/issues/new?template=bug_report.yml).
  Lütfen dağıtımınızı, Veyrilo'yu nasıl kurduğunuzu ve sorunu yeniden üreten
  adımları yazın.
- **Bir özellik mi istiyorsunuz?**
  [Özellik isteği açın](https://github.com/Utkucan-W/veyrilo-markdown-editor/issues/new?template=feature_request.yml)
  ve ne yapmaya çalıştığınızı anlatın.
- **Güvenlik açığı mı buldunuz?** Lütfen herkese açık issue açmayın; özel
  bildirim için [SECURITY.md](SECURITY.md) dosyasına bakın.

Pull request'ler de açıktır. Önce [CONTRIBUTING.md](CONTRIBUTING.md) dosyasını
okuyun; bu proje bir [Davranış Kuralları](CODE_OF_CONDUCT.md) metnini izler.

## Kaynaktan derleme

### Gereksinimler

Kaynaktan derlemek için Node.js 20 veya üzeri, npm ve Rust gerekir. Linux'ta
önce yukarıda kendi dağıtımınız için listelenen sistem paketlerini kurun.

### Başlangıç

```bash
git clone https://github.com/Utkucan-W/veyrilo-markdown-editor.git
cd veyrilo-markdown-editor
npm install
npm start
```

Klonlayıp çalıştırma akışı katkı verenler içindir. Normal kullanıcılar yukarıda
anlatılan hazır GitHub Releases paketini kullanmalıdır.

### Geliştirme komutları

```bash
# JavaScript sözdizimini doğrula
npm run check

# Test paketini çalıştır
npm test

# Linux x64 masaüstü uygulaması (.deb) derle
npm run dist

# Derleyip geçerli kullanıcının uygulama menüsüne ekle
npm run install:local
```

Üretilen Debian paketi `src-tauri/target/release/bundle/deb/` altına yazılır.
Dağıtımınızın paket yöneticisiyle kurun:

```bash
sudo apt install ./src-tauri/target/release/bundle/deb/Veyrilo_*.deb
```

Üretilen menü başlatıcısı Veyrilo'yu XWayland üzerinden çalıştırır, Tauri'nin
pencere arka ucunu X11'e ayarlar ve etkilenen GPU sürücülerine sahip Wayland
sistemlerinde güvenilir açılış için WebKit'in DMA-BUF çizicisini devre dışı
bırakır.

## Proje yapısı

```text
.
├── src-tauri/       # Rust komutları, Tauri penceresi ve Linux paketleme ayarları
├── index.html       # Uygulama kabuğu
├── css/             # Arayüz stilleri
├── js/              # Editör, rehber, arama, önizleme, dışa aktarma ve arayüz modülleri
├── test/            # Güvenlik ve davranış regresyon testleri
└── package.json     # Komutlar ve bağımlılıklar
```

## PDF dışa aktarma

PDF dışa aktarma, işletim sisteminin yazdırma penceresini açar. Penceredeki
“PDF olarak kaydet” veya eşdeğer seçeneği seçin; böylece WeasyPrint gibi harici
bir dönüştürücüye gerek kalmaz. Basılı çıktı sabit bir açık palet kullanır, bu
sayede koyu temada yazılmış bir belge kâğıtta da okunur kalır.

## Gizlilik ve güvenlik

Veyrilo; geçerli oturum taslağını, tercihleri, dosya adını ve klavye
kısayollarını yalnızca kendi bilgisayarınızdaki yerel depolamada tutar. Hesap
yoktur, telemetri yoktur, ağ çağrısı yoktur. Markdown'ı düzenlemek veya işlemek
için çevrimiçi bir servis gerekmez.

Markdown, önizleme veya dışa aktarma öncesinde DOMPurify ile temizlenir; dış
bağlantılar yalnızca `http` ve `https` adresleriyle sınırlıdır.

Bir güvenlik açığını özel olarak bildirmek için [SECURITY.md](SECURITY.md)
dosyasına bakın.

## Sürüm yayınlama (bakımcı için)

Bakımcılar bir sürüm etiketi göndererek yayın yapabilir. GitHub Actions
kontrolleri çalıştırır, Linux `.deb` paketini derler ve GitHub Release'e ekler:

```bash
git tag v1.1.1
git push origin v1.1.1
```

Akış dosyaları `.github/workflows/ci.yml` ve `.github/workflows/release.yml`
konumundadır.

## Lisans

Veyrilo [MIT Lisansı](LICENSE) ile sunulur — kullanmakta, değiştirmekte ve
yeniden dağıtmakta özgürsünüz.

Derlenmiş uygulama, kendi izin veren lisanslarına sahip üçüncü taraf bileşenleri
içerir; bkz. [THIRD-PARTY-LICENSES.md](THIRD-PARTY-LICENSES.md).

### Marka

"Veyrilo" adı ve Veyrilo logosu (`branding/` altındaki dosyalar) MIT Lisansı
kapsamında **değildir**. MIT koşulları yazılımı derlemenize, değiştirmenize ve
yeniden dağıtmanıza izin verir; ancak Veyrilo adını veya logosunu bu projenin
onayını ya da projeyle bağlantısını ima edecek biçimde kullanma hakkı vermez.
Özgün projeyle karıştırılabilecek bir çatal, farklı bir ad ve simge
kullanmalıdır.
