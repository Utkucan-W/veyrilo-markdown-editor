window.I18n = (function() {
  const messages = {
    tr: {
      'welcome': `# Veyrilo'ya Hoşgeldiniz! 👋\n\nBu minimalist bir Markdown editörüdür.\n\n## Özellikler\n- 📝 Canlı Önizleme (Ctrl+P)\n- 🎯 Focus Mode (Shift+Ctrl+F)\n- 🧘 Zen Mode (F11)\n- ⚙️ Ayarlar (Ctrl+,)\n- 📄 PDF Çıktısı Alma\n\n> İçeriğiniz güvenle saklanır.`,
      'workspace.editor': 'Belge',
      'guide.title': 'Markdown Rehberi',
      'guide.titleText': 'Markdown Rehberini Aç',
      'guide.confirm': 'Mevcut belge değiştirilecek. Markdown rehberini açmak istiyor musunuz?',
      'toolbar.new': 'Yeni',
      'toolbar.newTitle': 'Yeni Belge (Ctrl+N)',
      'toolbar.open': 'Aç',
      'toolbar.openTitle': 'Dosya Aç (Ctrl+O)',
      'file.unsavedChanges': 'Kaydedilmemiş değişiklikler var. Yeni belge açarsanız değişiklikler kaydedilmeyecek.',
      'close.unsavedTitle': 'Kaydedilmemiş değişiklikler',
      'close.unsavedBody': 'Kaydedilmemiş değişiklikler var. Kapatırsanız değişiklikler kaybolacak.',
      'close.cancel': 'İptal',
      'close.discard': 'Kaydetmeden çık',
      'file.opened': '"{name}" dosyası açıldı',
      'file.readError': 'Dosya okunamadı',
      'file.saved': '"{name}" kaydedildi',
      'file.saveError': 'Dosya kaydedilemedi',
      'file.newCreated': 'Yeni belge oluşturuldu',
      'file.exported': '"{name}" indirildi',
      'toolbar.recent': 'En Son Açılanlar',
      'toolbar.recentTitle': 'En Son Açılanlar',
      'recent.empty': 'Henüz açılan dosya yok',
      'recent.unavailable': 'Bu dosya doğrudan açılamıyor',
      'recent.missing': 'Dosya bulunamadı',
      'table.dialogEyebrow': 'Markdown',
      'table.dialogTitle': 'Tablo oluştur',
      'table.dialogHint': 'Kaç satır ve sütun istediğinizi seçin.',
      'table.rows': 'Satır (başlık dahil)',
      'table.columns': 'Sütun',
      'table.cancel': 'İptal',
      'table.create': 'Tablo oluştur',
      'table.closeTitle': 'Tablo penceresini kapat',
      'table.closeLabel': 'Tablo penceresini kapat',
      'toolbar.save': 'Kaydet',
      'toolbar.saveTitle': 'Kaydet (Ctrl+S)',
      'toolbar.pdf': 'PDF',
      'toolbar.pdfTitle': 'PDF Aktar',
      'toolbar.html': 'HTML',
      'toolbar.htmlTitle': 'HTML Aktar',
      'toolbar.preview': 'Önizleme',
      'toolbar.previewTitle': 'Önizleme (Ctrl+P)',
      'toolbar.focus': 'Odak',
      'toolbar.focusTitle': 'Odak Modu',
      'toolbar.zen': 'Zen',
      'toolbar.zenTitle': 'Zen Modu (F11)',
      'toolbar.settings': 'Ayarlar',
      'toolbar.settingsTitle': 'Ayarlar',
      'format.h1Title': 'Başlık 1 (Ctrl+1)',
      'format.h2Title': 'Başlık 2 (Ctrl+2)',
      'format.h3Title': 'Başlık 3 (Ctrl+3)',
      'format.boldTitle': 'Kalın (Ctrl+B)',
      'format.italicTitle': 'İtalik (Ctrl+I)',
      'format.strikethroughTitle': 'Üstü Çizili (Ctrl+D)',
      'format.highlightTitle': 'Vurgula (Ctrl+Shift+M)',
      'format.codeTitle': 'Satır İçi Kod (Ctrl+E)',
      'format.codeblockTitle': 'Kod Bloğu (Ctrl+Shift+E)',
      'format.linkTitle': 'Bağlantı (Ctrl+K)',
      'format.imageTitle': 'Görsel (Ctrl+Shift+G)',
      'format.listTitle': 'Madde Listesi (Ctrl+Shift+L)',
      'format.orderedListTitle': 'Sıralı Liste (Ctrl+Shift+O)',
      'format.checkboxListTitle': 'Yapılacaklar (Ctrl+Shift+X)',
      'format.quoteTitle': 'Alıntı (Ctrl+Shift+Q)',
      'format.tableTitle': 'Tablo (Ctrl+Shift+T)',
      'format.horizontalRuleTitle': 'Yatay Çizgi (Ctrl+Shift+-)',
      'format.fontDecreaseTitle': 'Yazı Küçült (Ctrl+-)',
      'format.fontIncreaseTitle': 'Yazı Büyüt (Ctrl+=)',
      'editor.placeholder': 'Markdown yazmaya başlayın...',
      'editor.linkText': 'bağlantı metni',
      'editor.imageAlt': 'açıklama',
      'editor.imageUrl': 'görsel-url',
      'editor.codePlaceholder': 'kod buraya',
      'find.placeholder': 'Belgede ara... (Enter: sonraki, Shift+Enter: önceki)',
      'find.label': 'Belgede ara',
      'find.noResults': 'Sonuç yok',
      'find.previousTitle': 'Önceki sonuç (Shift+Enter)',
      'find.previousLabel': 'Önceki sonuç',
      'find.nextTitle': 'Sonraki sonuç (Enter)',
      'find.nextLabel': 'Sonraki sonuç',
      'find.closeTitle': 'Aramayı kapat (Esc)',
      'find.closeLabel': 'Aramayı kapat',
      'find.replacePlaceholder': 'Şununla değiştir...',
      'find.replace': 'Değiştir',
      'find.replaceTitle': 'Seçili eşleşmeyi değiştir',
      'find.replaceAll': 'Tümü',
      'find.replaceAllTitle': 'Tüm eşleşmeleri değiştir',
      'find.toggleReplaceTitle': 'Değiştirme satırını aç/kapat',
      'find.toggleReplaceLabel': 'Değiştirme satırını aç/kapat',
      'drop.hint': 'Markdown dosyasını açmak için bırakın',
      'drop.unsupported': 'Yalnızca Markdown ve metin dosyaları açılabilir',

      'settings.title': '⚙ Ayarlar',
      'settings.language': 'Dil',
      'settings.fontSize': 'Yazı Boyutu',
      'settings.fontFamily': 'Yazı Tipi',
      'settings.fontSans': 'Sans Serif',
      'settings.fontSerif': 'Serif',
      'settings.fontMono': 'Monospace',
      'settings.fontSegoe': 'Segoe UI',
      'settings.fontInter': 'Inter',
      'settings.fontRoboto': 'Roboto',
      'settings.fontLora': 'Lora',
      'settings.fontFiraCode': 'Fira Code',
      'settings.fontArial': 'Arial',
      'settings.fontTimesNewRoman': 'Times New Roman',
      'settings.fontHelvetica': 'Helvetica',
      'settings.fontVerdana': 'Verdana',
      'settings.fontTahoma': 'Tahoma',
      'settings.fontCourierNew': 'Courier New',
      'settings.theme': 'Tema',
      'settings.themeLight': 'Açık',
      'settings.themeDark': 'Koyu',
      'settings.themeSepia': 'Sepia',
      'settings.themeDarkGray': 'Koyu Gri',
      'settings.themeOcean': 'Okyanus',
      'settings.themeForest': 'Orman',
      'settings.themeRose': 'Gül',
      'settings.lineHeight': 'Satır Aralığı',
      'settings.lhCompact': 'Sıkışık',
      'settings.lhNormal': 'Normal',
      'settings.lhRelaxed': 'Geniş',
      'settings.editorWidth': 'Editör Genişliği',
      'settings.wNarrow': 'Dar',
      'settings.wMedium': 'Orta',
      'settings.wWide': 'Geniş',
      'settings.wFull': 'Tam',
      'settings.previewMode': 'Önizleme Düzeni',
      'settings.pmSide': 'Yan Yana',
      'settings.pmBottom': 'Alt Alta',
      'settings.pmFull': 'Tam Ekran',
      'settings.shortcuts': '⌨ Klavye Kısayolları',
      'settings.shortcutsHint': 'Değiştirmek için kısayolun üstüne tıklayın ve yeni tuş kombinasyonunu basın.',
      'settings.reset': 'Ayarları Sıfırla',
      'settings.about': 'Veyrilo Hakkında',
      'settings.resetConfirm': 'Tüm ayarlar varsayılana döndürülecek. Emin misiniz?',
      'settings.resetDone': 'Tüm ayarlar sıfırlandı',

      'toast.previewOpened': 'Önizleme açıldı',
      'toast.previewClosed': 'Önizleme kapatıldı',
      'toast.focusOpened': 'Odak modu açıldı',
      'toast.focusClosed': 'Odak modu kapatıldı',
      'toast.zenOpened': 'Zen modu açıldı — Esc ile çık',
      'toast.zenClosed': 'Zen modu kapatıldı',
      'toast.fontSize': 'Yazı boyutu: {size}px',
      'toast.replaced': '1 eşleşme değiştirildi',
      'toast.replacedAll': '{count} eşleşme değiştirildi',
      'toast.replaceNoMatch': 'Değiştirilecek eşleşme yok',
      'pdf.converterUnavailable': 'PDF oluşturmak için Markdown dönüştürücü hazır değil',
      'pdf.unavailable': 'PDF yazdırma özelliği kullanılamıyor',
      'pdf.printHint': 'Yazdır penceresinden PDF olarak kaydedebilirsin',
      'shortcut.modifierRequired': 'Modifier tuşu gerekli',
      'shortcut.conflict': '{name} ile çakışıyor',
      
      'status.words': '0 kelime',
      'status.chars': '0 karakter',
      'status.paragraphs': '0 paragraf',
      'status.lines': '0 satır',
      'status.readTime': '0 dk okuma',
      'status.cursor': 'Satır {line}, Sütun {col}',
      
      'about.title': 'Veyrilo Hakkında',
      'about.desc': 'Veyrilo, minimalist ve modern bir Markdown editörüdür.<br><br><em>Thoughts, in flow.</em>',
      'about.developerLabel': 'Geliştirici',
      'about.repositoryLabel': 'Proje deposu',
      'about.contribute': 'Veyrilo ücretsizdir ve herkes kullanabilir. Hata bildirimlerinizi ve özellik önerilerinizi proje deposundaki Issues bölümünden paylaşabilirsiniz.',
      'about.close': 'Kapat',

      'shortcut.bold': 'Kalın',
      'shortcut.italic': 'İtalik',
      'shortcut.strikethrough': 'Üstü Çizili',
      'shortcut.highlight': 'Vurgula (==)',
      'shortcut.code': 'Satır İçi Kod',
      'shortcut.codeblock': 'Kod Bloğu',
      'shortcut.link': 'Bağlantı Ekle',
      'shortcut.image': 'Görsel Ekle',
      'shortcut.h1': 'Başlık 1',
      'shortcut.h2': 'Başlık 2',
      'shortcut.h3': 'Başlık 3',
      'shortcut.h4': 'Başlık 4',
      'shortcut.h5': 'Başlık 5',
      'shortcut.h6': 'Başlık 6',
      'shortcut.list': 'Madde Listesi',
      'shortcut.orderedList': 'Sıralı Liste',
      'shortcut.checkboxList': 'Yapılacaklar',
      'shortcut.quote': 'Alıntı',
      'shortcut.table': 'Tablo Ekle',
      'shortcut.horizontalRule': 'Yatay Çizgi',
      'shortcut.undo': 'Geri Al',
      'shortcut.redo': 'İleri Al',
      'shortcut.find': 'Belgede Ara',
      'shortcut.replace': 'Bul ve Değiştir',
      'shortcut.preview': 'Önizleme',
      'shortcut.focus': 'Focus Mode',
      'shortcut.zen': 'Zen Mode',
      'shortcut.save': 'Kaydet',
      'shortcut.open': 'Dosya Aç',
      'shortcut.newdoc': 'Yeni Belge',
      'shortcut.settings': 'Ayarlar',
      'shortcut.fontIncrease': 'Yazı Büyüt',
      'shortcut.fontDecrease': 'Yazı Küçült',
    },
    en: {
      'welcome': `# Welcome to Veyrilo! 👋\n\nThis is a minimalist Markdown editor.\n\n## Features\n- 📝 Live Preview (Ctrl+P)\n- 🎯 Focus Mode (Shift+Ctrl+F)\n- 🧘 Zen Mode (F11)\n- ⚙️ Settings (Ctrl+,)\n- 📄 PDF Export\n\n> Your content is safely stored.`,
      'workspace.editor': 'Document',
      'guide.title': 'Markdown Guide',
      'guide.titleText': 'Open Markdown Guide',
      'guide.confirm': 'The current document will be replaced. Open the Markdown guide?',
      'toolbar.new': 'New',
      'toolbar.newTitle': 'New Document (Ctrl+N)',
      'toolbar.open': 'Open',
      'toolbar.openTitle': 'Open File (Ctrl+O)',
      'file.unsavedChanges': 'There are unsaved changes. If you open a new document, these changes will not be saved.',
      'close.unsavedTitle': 'Unsaved changes',
      'close.unsavedBody': 'There are unsaved changes. If you close the app, these changes will be lost.',
      'close.cancel': 'Cancel',
      'close.discard': 'Close without saving',
      'file.opened': '"{name}" opened',
      'file.readError': 'Could not read the file',
      'file.saved': '"{name}" saved',
      'file.saveError': 'Could not save the file',
      'file.newCreated': 'New document created',
      'file.exported': '"{name}" downloaded',
      'toolbar.recent': 'Recent Files',
      'toolbar.recentTitle': 'Recent Files',
      'recent.empty': 'No recently opened files',
      'recent.unavailable': 'This file cannot be opened directly',
      'recent.missing': 'File not found',
      'table.dialogEyebrow': 'Markdown',
      'table.dialogTitle': 'Create table',
      'table.dialogHint': 'Choose how many rows and columns you need.',
      'table.rows': 'Rows (including header)',
      'table.columns': 'Columns',
      'table.cancel': 'Cancel',
      'table.create': 'Create table',
      'table.closeTitle': 'Close table dialog',
      'table.closeLabel': 'Close table dialog',
      'toolbar.save': 'Save',
      'toolbar.saveTitle': 'Save (Ctrl+S)',
      'toolbar.pdf': 'PDF',
      'toolbar.pdfTitle': 'Export to PDF',
      'toolbar.html': 'HTML',
      'toolbar.htmlTitle': 'Export to HTML',
      'toolbar.preview': 'Preview',
      'toolbar.previewTitle': 'Preview (Ctrl+P)',
      'toolbar.focus': 'Focus',
      'toolbar.focusTitle': 'Focus Mode',
      'toolbar.zen': 'Zen',
      'toolbar.zenTitle': 'Zen Mode (F11)',
      'toolbar.settings': 'Settings',
      'toolbar.settingsTitle': 'Settings',
      'format.h1Title': 'Heading 1 (Ctrl+1)',
      'format.h2Title': 'Heading 2 (Ctrl+2)',
      'format.h3Title': 'Heading 3 (Ctrl+3)',
      'format.boldTitle': 'Bold (Ctrl+B)',
      'format.italicTitle': 'Italic (Ctrl+I)',
      'format.strikethroughTitle': 'Strikethrough (Ctrl+D)',
      'format.highlightTitle': 'Highlight (Ctrl+Shift+M)',
      'format.codeTitle': 'Inline Code (Ctrl+E)',
      'format.codeblockTitle': 'Code Block (Ctrl+Shift+E)',
      'format.linkTitle': 'Link (Ctrl+K)',
      'format.imageTitle': 'Image (Ctrl+Shift+G)',
      'format.listTitle': 'Bullet List (Ctrl+Shift+L)',
      'format.orderedListTitle': 'Ordered List (Ctrl+Shift+O)',
      'format.checkboxListTitle': 'Task List (Ctrl+Shift+X)',
      'format.quoteTitle': 'Blockquote (Ctrl+Shift+Q)',
      'format.tableTitle': 'Table (Ctrl+Shift+T)',
      'format.horizontalRuleTitle': 'Horizontal Rule (Ctrl+Shift+-)',
      'format.fontDecreaseTitle': 'Decrease Font Size (Ctrl+-)',
      'format.fontIncreaseTitle': 'Increase Font Size (Ctrl+=)',
      'editor.placeholder': 'Start writing Markdown...',
      'editor.linkText': 'link text',
      'editor.imageAlt': 'description',
      'editor.imageUrl': 'image-url',
      'editor.codePlaceholder': 'code here',
      'find.placeholder': 'Find in document... (Enter: next, Shift+Enter: previous)',
      'find.label': 'Find in document',
      'find.noResults': 'No results',
      'find.previousTitle': 'Previous result (Shift+Enter)',
      'find.previousLabel': 'Previous result',
      'find.nextTitle': 'Next result (Enter)',
      'find.nextLabel': 'Next result',
      'find.closeTitle': 'Close search (Esc)',
      'find.closeLabel': 'Close search',
      'find.replacePlaceholder': 'Replace with...',
      'find.replace': 'Replace',
      'find.replaceTitle': 'Replace the selected match',
      'find.replaceAll': 'All',
      'find.replaceAllTitle': 'Replace every match',
      'find.toggleReplaceTitle': 'Toggle the replace row',
      'find.toggleReplaceLabel': 'Toggle the replace row',
      'drop.hint': 'Drop the Markdown file to open it',
      'drop.unsupported': 'Only Markdown and text files can be opened',

      'settings.title': '⚙ Settings',
      'settings.language': 'Language',
      'settings.fontSize': 'Font Size',
      'settings.fontFamily': 'Font Family',
      'settings.fontSans': 'Sans Serif',
      'settings.fontSerif': 'Serif',
      'settings.fontMono': 'Monospace',
      'settings.fontSegoe': 'Segoe UI',
      'settings.fontInter': 'Inter',
      'settings.fontRoboto': 'Roboto',
      'settings.fontLora': 'Lora',
      'settings.fontFiraCode': 'Fira Code',
      'settings.fontArial': 'Arial',
      'settings.fontTimesNewRoman': 'Times New Roman',
      'settings.fontHelvetica': 'Helvetica',
      'settings.fontVerdana': 'Verdana',
      'settings.fontTahoma': 'Tahoma',
      'settings.fontCourierNew': 'Courier New',
      'settings.theme': 'Theme',
      'settings.themeLight': 'Light',
      'settings.themeDark': 'Dark',
      'settings.themeSepia': 'Sepia',
      'settings.themeDarkGray': 'Dark Gray',
      'settings.themeOcean': 'Ocean',
      'settings.themeForest': 'Forest',
      'settings.themeRose': 'Rose',
      'settings.lineHeight': 'Line Height',
      'settings.lhCompact': 'Compact',
      'settings.lhNormal': 'Normal',
      'settings.lhRelaxed': 'Relaxed',
      'settings.editorWidth': 'Editor Width',
      'settings.wNarrow': 'Narrow',
      'settings.wMedium': 'Medium',
      'settings.wWide': 'Wide',
      'settings.wFull': 'Full',
      'settings.previewMode': 'Preview Layout',
      'settings.pmSide': 'Side by Side',
      'settings.pmBottom': 'Top / Bottom',
      'settings.pmFull': 'Full Screen',
      'settings.shortcuts': '⌨ Keyboard Shortcuts',
      'settings.shortcutsHint': 'Click on a shortcut to change it, then press the new key combination.',
      'settings.reset': 'Reset Settings',
      'settings.about': 'About Veyrilo',
      'settings.resetConfirm': 'All settings will be reset to their defaults. Continue?',
      'settings.resetDone': 'All settings were reset',

      'toast.previewOpened': 'Preview opened',
      'toast.previewClosed': 'Preview closed',
      'toast.focusOpened': 'Focus mode opened',
      'toast.focusClosed': 'Focus mode closed',
      'toast.zenOpened': 'Zen mode opened — press Esc to exit',
      'toast.zenClosed': 'Zen mode closed',
      'toast.fontSize': 'Font size: {size}px',
      'toast.replaced': 'Replaced 1 match',
      'toast.replacedAll': 'Replaced {count} matches',
      'toast.replaceNoMatch': 'No match to replace',
      'pdf.converterUnavailable': 'The Markdown converter is not ready for PDF export',
      'pdf.unavailable': 'PDF printing is not available',
      'pdf.printHint': 'Use the print dialog to save as PDF',
      'shortcut.modifierRequired': 'A modifier key is required',
      'shortcut.conflict': 'Conflicts with {name}',
      
      'status.words': '0 words',
      'status.chars': '0 characters',
      'status.paragraphs': '0 paragraphs',
      'status.lines': '0 lines',
      'status.readTime': '0 min read',
      'status.cursor': 'Line {line}, Col {col}',
      
      'about.title': 'About Veyrilo',
      'about.desc': 'Veyrilo is a minimalist and modern Markdown editor.<br><br><em>Thoughts, in flow.</em>',
      'about.developerLabel': 'Developer',
      'about.repositoryLabel': 'Project repository',
      'about.contribute': 'Veyrilo is free for everyone to use. Share bug reports and feature ideas through the Issues page of the project repository.',
      'about.close': 'Close',

      'shortcut.bold': 'Bold',
      'shortcut.italic': 'Italic',
      'shortcut.strikethrough': 'Strikethrough',
      'shortcut.highlight': 'Highlight (==)',
      'shortcut.code': 'Inline Code',
      'shortcut.codeblock': 'Code Block',
      'shortcut.link': 'Insert Link',
      'shortcut.image': 'Insert Image',
      'shortcut.h1': 'Heading 1',
      'shortcut.h2': 'Heading 2',
      'shortcut.h3': 'Heading 3',
      'shortcut.h4': 'Heading 4',
      'shortcut.h5': 'Heading 5',
      'shortcut.h6': 'Heading 6',
      'shortcut.list': 'Bullet List',
      'shortcut.orderedList': 'Ordered List',
      'shortcut.checkboxList': 'Task List',
      'shortcut.quote': 'Blockquote',
      'shortcut.table': 'Insert Table',
      'shortcut.horizontalRule': 'Horizontal Rule',
      'shortcut.undo': 'Undo',
      'shortcut.redo': 'Redo',
      'shortcut.find': 'Find in Document',
      'shortcut.replace': 'Find and Replace',
      'shortcut.preview': 'Preview',
      'shortcut.focus': 'Focus Mode',
      'shortcut.zen': 'Zen Mode',
      'shortcut.save': 'Save',
      'shortcut.open': 'Open File',
      'shortcut.newdoc': 'New Document',
      'shortcut.settings': 'Settings',
      'shortcut.fontIncrease': 'Increase Font Size',
      'shortcut.fontDecrease': 'Decrease Font Size',
    }
  };

  // Önceki sürümlerde kaydedilmiş varsayılan karşılama metinleri de uygulama
  // içeriğidir; kullanıcı metni gibi değerlendirilip dil değişiminden hariç
  // bırakılmamalıdır.
  // Wording'i değişen eski varsayılan karşılama metinleri buraya eklenir; böylece
  // kullanıcının kaydettiği eski kopya da varsayılan içerik olarak tanınıp dil
  // değişiminde güncel metinle değiştirilir.
  const legacyWelcomeMessages = [];

  let currentLang = 'tr';

  function init() {
    try {
      const s = localStorage.getItem('veyrilo_settings');
      if (s) {
        const p = JSON.parse(s);
        if (p.language) currentLang = p.language;
      }
    } catch (e) {}
    document.documentElement.lang = currentLang;

    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
      langSelect.value = currentLang;
      langSelect.addEventListener('change', function() {
        setLanguage(this.value);
      });
    }

    applyTranslations();
  }

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (messages[currentLang][key]) {
        el.textContent = messages[currentLang][key];
      }
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (messages[currentLang][key]) {
        el.innerHTML = messages[currentLang][key];
      }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (messages[currentLang][key]) {
        el.title = messages[currentLang][key];
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (messages[currentLang][key]) {
        el.placeholder = messages[currentLang][key];
      }
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria-label');
      if (messages[currentLang][key]) {
        el.setAttribute('aria-label', messages[currentLang][key]);
      }
    });
  }

  function setLanguage(lang) {
    if (!messages[lang]) return;
    currentLang = lang;
    document.documentElement.lang = lang;
    applyTranslations();

    // Dil değiştiğinde kısayollar listesini güncelle
    if (window.Shortcuts) {
      window.Shortcuts.updateToolbarTitles?.();
      const shortcutsContainer = document.getElementById('shortcuts-container');
      if (shortcutsContainer) {
        window.Shortcuts.renderShortcutsList(shortcutsContainer);
      }
    }

    // Kullanıcı henüz karşılama metnini düzenlemediyse ana ekrandaki
    // varsayılan içeriği de seçilen dile geçir.
    if (window.App && window.App.updateWelcomeLanguage) {
      window.App.updateWelcomeLanguage();
    }
    if (window.App && window.App.showWorkspace) {
      const guidePane = document.getElementById('guide-pane');
      if (guidePane && !guidePane.classList.contains('hidden')) {
        window.App.showWorkspace('guide');
      }
    }
    if (window.FileManager?.renderRecentFiles) {
      window.FileManager.renderRecentFiles();
    }

    try {
      const s = localStorage.getItem('veyrilo_settings');
      let p = {};
      if (s) { try { p = JSON.parse(s); } catch (e) {} }
      p.language = lang;
      localStorage.setItem('veyrilo_settings', JSON.stringify(p));
    } catch (e) {}
  }

  return {
    init,
    t: (key) => messages[currentLang][key] || key,
    isWelcomeContent: (content) => {
      const normalized = String(content).trim();
      const currentWelcomeMessages = Object.values(messages).map((language) => language.welcome);
      return [...currentWelcomeMessages, ...legacyWelcomeMessages]
        .some((welcome) => welcome.trim() === normalized);
    },
    setLanguage,
    getCurrentLang: () => currentLang
  };
})();
