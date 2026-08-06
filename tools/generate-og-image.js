// og-image.png（1200x630・Editorialデザイン）の生成スクリプト
//
// 使い方（このMacで）:
//   npm i jimp@0.22.12 @resvg/resvg-js
//   node tools/generate-og-image.js
//
// フォント依存（このMacのローカルパス）:
//   - Didot: macOS同梱 (/System/Library/Fonts/Supplemental/Didot.ttc)
//   - しっぽり明朝: アプリ同梱TTF（SpinglishSwift/Spinglish/Fonts/）
// レイアウトの参照版は og-card.html（ブラウザで1200x630表示）。

const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');
const Jimp = require('jimp');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'og-image.png');
const shot = fs.readFileSync(path.join(ROOT, 'img/app/home.jpg')).toString('base64');

// 端末フレーム: x=852, y=214, w=300 → 画面 w=280, h=608（下端は意図的に見切れ）
const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <rect width="1200" height="630" fill="#F3F0E9"/>

  <!-- masthead meta -->
  <text x="72" y="66" font-family="Didot" font-size="15" font-weight="500" letter-spacing="4" fill="#77736C">10 CATEGORIES — 10,000+ DRILLS</text>
  <text x="1128" y="66" text-anchor="end" font-family="Didot" font-size="15" font-weight="500" letter-spacing="4" fill="#77736C">SPEAKING PRACTICE, DAILY</text>

  <!-- masthead -->
  <rect x="72" y="86" width="1056" height="1.5" fill="#0A0A0A"/>
  <text x="600" y="196" text-anchor="middle" font-family="Didot" font-size="118" font-weight="700" letter-spacing="4" fill="#0A0A0A">SPINGLISH</text>
  <rect x="72" y="228" width="1056" height="2.5" fill="#0A0A0A"/>

  <!-- headline -->
  <text x="72" y="330" font-family="Shippori Mincho" font-size="53" font-weight="700" fill="#0A0A0A">英語は読めるのに、</text>
  <text x="72" y="406" font-family="Shippori Mincho" font-size="53" font-weight="700" fill="#0A0A0A">口から出てこない人へ。</text>

  <!-- sub -->
  <text x="72" y="474" font-family="Shippori Mincho" font-size="22" font-weight="500" fill="#343330">日本語のお題を見て、英語で声に出すだけ。</text>
  <text x="72" y="512" font-family="Shippori Mincho" font-size="22" font-weight="500" fill="#343330">AIがその場で採点し、自然な言い換えまで返します。</text>

  <!-- bottom meta -->
  <rect x="72" y="552" width="560" height="1" fill="#0A0A0A"/>
  <text x="72" y="588" font-family="Shippori Mincho" font-size="18" font-weight="500" fill="#77736C">初回7日間無料 ／ 10カテゴリ・10,000問以上 ／ iPhone</text>

  <!-- device -->
  <rect x="852" y="214" width="300" height="430" rx="44" fill="#0B0B0B"/>
  <clipPath id="scr"><rect x="862" y="224" width="280" height="420" rx="34"/></clipPath>
  <image x="862" y="224" width="280" height="608" clip-path="url(#scr)" preserveAspectRatio="xMidYMin slice" xlink:href="data:image/jpeg;base64,${shot}"/>
</svg>`;

const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 2400 },
  font: {
    fontFiles: [
      '/System/Library/Fonts/Supplemental/Didot.ttc',
      '/Users/suzukiyu/spinglish/SpinglishSwift/Spinglish/Fonts/ShipporiMincho-Bold.ttf',
      '/Users/suzukiyu/spinglish/SpinglishSwift/Spinglish/Fonts/ShipporiMincho-Medium.ttf',
    ],
    loadSystemFonts: false,
    defaultFontFamily: 'Shippori Mincho',
  },
});

const png2x = resvg.render().asPng();

Jimp.read(Buffer.from(png2x)).then(img => {
  img.resize(1200, 630);
  return img.writeAsync(OUT);
}).then(() => {
  const kb = Math.round(fs.statSync(OUT).size / 1024);
  console.log('og-image.png written,', kb, 'KB');
});
