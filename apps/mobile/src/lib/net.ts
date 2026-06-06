/* Net hesabı (TYT/AYT: doğru - yanlış/4). Geçici yerel yardımcı;
 * Login diliminden sonra packages/shared'taki net hesabıyla değiştirilecek. */
export function netOf(d: number, y: number): string {
  return Math.max(0, d - y / 4)
    .toFixed(2)
    .replace(/\.00$/, "")
    .replace(/0$/, "")
    .replace(/\.$/, "");
}
