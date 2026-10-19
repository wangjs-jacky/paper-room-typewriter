import fs from 'node:fs/promises';
import QRCode from 'qrcode';

// Keep the QR and copyable link on the published Paws origin, including local previews.
const url = 'https://typewriter.paws.rodeo/mobile';
const svg = await QRCode.toString(url, {
  type: 'svg',
  errorCorrectionLevel: 'M',
  margin: 4,
  width: 232,
  color: { dark: '#263425', light: '#ffffff' }
});
await fs.writeFile(new URL('../public/assets/mobile-qr.svg', import.meta.url), svg);
console.log('已生成手机体验二维码：' + url);
