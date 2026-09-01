/* Markdown Rehberi — Kısayol, kullanım, kaynak ve canlı sonuç görünümü. */
window.MarkdownGuide = (function () {
  'use strict';

  const guideData = {
    tr: {
      intro: 'Markdown sözdizimini öğrenin: solda kısayol ve kullanım, sağda ise aynı örneğin gerçek önizlemesi bulunur.',
      shortcut: 'Kısayol',
      usage: 'Kullanım',
      example: 'Markdown örneği',
      preview: 'Çalışan önizleme',
      sections: [
        { title: 'Başlıklar', shortcut: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'], usage: 'Satırın başına # ekleyin. # sayısı başlık seviyesini belirler.', source: '# Başlık 1\n## Başlık 2\n### Başlık 3' },
        { title: 'Alternatif başlık biçimi', shortcut: null, usage: 'Başlığın altına = veya - karakterleri koyarak iki seviyeli başlık oluşturabilirsiniz.', source: 'Büyük başlık\n===========\n\nAlt başlık\n-----------' },
        { title: 'Kalın, italik ve üstü çizili', shortcut: ['bold', 'italic', 'strikethrough'], usage: 'Metni yıldızlarla veya çift yaklaşık işaretleriyle sarın.', source: '**Kalın**\n\n*İtalik*\n\n~~Üstü çizili~~' },
        { title: 'Vurgulama ve satır içi kod', shortcut: ['highlight', 'code'], usage: 'Vurgulama için çift eşittir, kısa kod için tek ters tırnak kullanın.', source: '==Önemli bilgi==\n\n`npm run build`' },
        { title: 'Madde listesi', shortcut: ['list'], usage: 'Her maddeyi -, * veya + ile başlatın. Alt liste için iki boşluk bırakın.', source: '- Birinci madde\n- İkinci madde\n  - Alt madde' },
        { title: 'Numaralı liste', shortcut: ['orderedList'], usage: 'Satırları 1., 2. gibi numaralarla başlatın.', source: '1. İlk adım\n2. İkinci adım\n3. Son adım' },
        { title: 'Görev listesi', shortcut: ['checkboxList'], usage: '[x] tamamlanmış, [ ] bekleyen görevi gösterir.', source: '- [x] Tamamlandı\n- [ ] Bekliyor' },
        { title: 'Bağlantı', shortcut: ['link'], usage: 'Görünen metni köşeli, adresi normal parantez içine yazın.', source: '[Veyrilo](https://github.com/Utkucan-W/veyrilo-markdown-editor)' },
        { title: 'Otomatik ve referans bağlantısı', shortcut: ['link'], usage: 'Adresleri < > içine alabilir veya bağlantıyı metnin sonunda bir referansla tanımlayabilirsiniz.', source: '<https://example.com>\n\n[Veyrilo][site]\n\n[site]: https://github.com/Utkucan-W/veyrilo-markdown-editor' },
        { title: 'Görsel', shortcut: ['image'], usage: 'Bağlantının başına ! ekleyin. Köşeli bölüm alternatif açıklamadır.', source: '![Veyrilo logosu](data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22360%22%20height%3D%22120%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23111827%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2258%25%22%20fill%3D%22%237aa2f7%22%20font-size%3D%2236%22%20text-anchor%3D%22middle%22%3EVeyrilo%3C%2Ftext%3E%3C%2Fsvg%3E)' },
        { title: 'Alıntı', shortcut: ['quote'], usage: 'Alıntı satırının başına > koyun.', source: '> Basitlik, iyi tasarımın başlangıcıdır.' },
        { title: 'Kod bloğu', shortcut: ['codeblock'], usage: 'Kodu üç ters tırnak veya üç tilde arasına alın. Dil adını ekleyince renklendirme açılır.', source: '~~~javascript\nconst mesaj = "Merhaba Veyrilo";\nconsole.log(mesaj);\n~~~' },
        { title: 'Tablo', shortcut: ['table'], usage: 'Sütunları | ile ayırın; ikinci satır ayraç satırıdır.', source: '| Özellik | Durum |\n| --- | --- |\n| Önizleme | Hazır |\n| Kısayollar | Hazır |' },
        { title: 'Tablo hizalama', shortcut: ['table'], usage: 'Ayraç satırına : ekleyerek sütunları sola, ortaya veya sağa hizalayın.', source: '| Sol | Orta | Sağ |\n| :--- | :---: | ---: |\n| A | B | C |' },
        { title: 'Yatay çizgi', shortcut: ['horizontalRule'], usage: 'Tek satıra üç veya daha fazla kısa çizgi yazın.', source: 'Üst bölüm\n\n---\n\nAlt bölüm' },
        { title: 'Satır sonu', shortcut: null, usage: 'Aynı paragrafta yeni satıra geçmek için satırın sonuna iki boşluk koyun.', source: 'Birinci satır  \nİkinci satır' },
        { title: 'Özel karakter', shortcut: null, usage: 'Markdown karakterini metin olarak göstermek için önüne ters eğik çizgi koyun.', source: '\\*Bu italik değildir\\*\n\\# Bu başlık değildir' },
        { title: 'Satır içi HTML', shortcut: null, usage: 'Basit HTML kullanabilirsiniz; Veyrilo güvenlik için tehlikeli etiketleri temizler.', source: '<mark>Güvenli vurgu</mark> ve <kbd>Ctrl</kbd>' },
      ],
    },
    en: {
      intro: 'Learn Markdown syntax: the shortcut and usage are on the left, while the real preview of the same example is on the right.',
      shortcut: 'Shortcut',
      usage: 'Usage',
      example: 'Markdown example',
      preview: 'Live preview',
      sections: [
        { title: 'Headings', shortcut: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'], usage: 'Add # at the beginning of a line. The number sets the heading level.', source: '# Heading 1\n## Heading 2\n### Heading 3' },
        { title: 'Alternative heading style', shortcut: null, usage: 'Put = or - characters below a heading to create the two main heading levels.', source: 'Large heading\n==============\n\nSmaller heading\n----------------' },
        { title: 'Bold, italic and strikethrough', shortcut: ['bold', 'italic', 'strikethrough'], usage: 'Wrap text with stars or double tildes.', source: '**Bold**\n\n*Italic*\n\n~~Strikethrough~~' },
        { title: 'Highlight and inline code', shortcut: ['highlight', 'code'], usage: 'Use double equals for highlighting and single backticks for short code.', source: '==Important information==\n\n`npm run build`' },
        { title: 'Bullet list', shortcut: ['list'], usage: 'Start each item with -, * or +. Indent nested items with two spaces.', source: '- First item\n- Second item\n  - Nested item' },
        { title: 'Ordered list', shortcut: ['orderedList'], usage: 'Start lines with numbers such as 1. and 2.', source: '1. First step\n2. Second step\n3. Last step' },
        { title: 'Task list', shortcut: ['checkboxList'], usage: '[x] marks a completed task and [ ] marks a pending task.', source: '- [x] Completed\n- [ ] Pending' },
        { title: 'Link', shortcut: ['link'], usage: 'Put the visible text in square brackets and the address in parentheses.', source: '[Veyrilo](https://github.com/Utkucan-W/veyrilo-markdown-editor)' },
        { title: 'Autolink and reference link', shortcut: ['link'], usage: 'Wrap an address in < > or define a reference at the end of the document.', source: '<https://example.com>\n\n[Veyrilo][site]\n\n[site]: https://github.com/Utkucan-W/veyrilo-markdown-editor' },
        { title: 'Image', shortcut: ['image'], usage: 'Add ! before a link. The square-bracket text is the alternative description.', source: '![Veyrilo logo](data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22360%22%20height%3D%22120%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23111827%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2258%25%22%20fill%3D%22%237aa2f7%22%20font-size%3D%2236%22%20text-anchor%3D%22middle%22%3EVeyrilo%3C%2Ftext%3E%3C%2Fsvg%3E)' },
        { title: 'Blockquote', shortcut: ['quote'], usage: 'Put > at the beginning of a quote line.', source: '> Simplicity is the beginning of good design.' },
        { title: 'Code block', shortcut: ['codeblock'], usage: 'Wrap code in three backticks or tildes. Add a language name to enable highlighting.', source: '~~~javascript\nconst message = "Hello Veyrilo";\nconsole.log(message);\n~~~' },
        { title: 'Table', shortcut: ['table'], usage: 'Separate columns with |; the second row is the separator.', source: '| Feature | Status |\n| --- | --- |\n| Preview | Ready |\n| Shortcuts | Ready |' },
        { title: 'Table alignment', shortcut: ['table'], usage: 'Add : to the separator row to align columns left, center, or right.', source: '| Left | Center | Right |\n| :--- | :---: | ---: |\n| A | B | C |' },
        { title: 'Horizontal rule', shortcut: ['horizontalRule'], usage: 'Write three or more hyphens on one line.', source: 'Top section\n\n---\n\nBottom section' },
        { title: 'Line break', shortcut: null, usage: 'Add two spaces at the end of a line to create a line break in the same paragraph.', source: 'First line  \nSecond line' },
        { title: 'Special characters', shortcut: null, usage: 'Prefix a Markdown character with a backslash to display it as text.', source: '\\*This is not italic\\*\n\\# This is not a heading' },
        { title: 'Inline HTML', shortcut: null, usage: 'Simple HTML is supported; Veyrilo removes dangerous tags for safety.', source: '<mark>Safe highlight</mark> and <kbd>Ctrl</kbd>' },
      ],
    },
  };

  function get(language) {
    return guideData[language] || guideData.tr;
  }

  function formatShortcut(shortcut) {
    if (!shortcut) return '—';
    return shortcut
      .map((actionId) => window.Shortcuts?.getComboString(actionId) || actionId)
      .join(' · ');
  }

  function render(language, container) {
    const data = get(language);
    container.replaceChildren();

    const intro = document.createElement('p');
    intro.className = 'guide-intro';
    intro.textContent = data.intro;
    container.appendChild(intro);

    data.sections.forEach((section) => {
      const card = document.createElement('article');
      card.className = 'guide-card';

      const explanation = document.createElement('div');
      explanation.className = 'guide-explanation';
      const title = document.createElement('h2');
      title.textContent = section.title;
      explanation.appendChild(title);

      const shortcut = document.createElement('p');
      shortcut.className = 'guide-label';
      shortcut.textContent = `${data.shortcut}: ${formatShortcut(section.shortcut)}`;
      explanation.appendChild(shortcut);

      const usageLabel = document.createElement('h3');
      usageLabel.textContent = data.usage;
      explanation.appendChild(usageLabel);
      const usage = document.createElement('p');
      usage.textContent = section.usage;
      explanation.appendChild(usage);

      const exampleLabel = document.createElement('h3');
      exampleLabel.textContent = data.example;
      explanation.appendChild(exampleLabel);
      const source = document.createElement('pre');
      const sourceCode = document.createElement('code');
      sourceCode.textContent = section.source;
      source.appendChild(sourceCode);
      explanation.appendChild(source);

      const result = document.createElement('div');
      result.className = 'guide-result';
      const resultLabel = document.createElement('h3');
      resultLabel.textContent = data.preview;
      result.appendChild(resultLabel);
      const rendered = document.createElement('article');
      rendered.className = 'markdown-body guide-rendered';
      rendered.innerHTML = window.Preview
        ? window.Preview.renderToSafeHtml(section.source)
        : section.source;
      result.appendChild(rendered);

      card.append(explanation, result);
      container.appendChild(card);
    });
  }

  return { get, render };
})();
