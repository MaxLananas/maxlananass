// Small, original SVG motifs derived from the portfolio's pineapple/voxel identity.
// Decorative only: no icon font, remote dependency, animation or accessible-name noise.
export function brandIcon(name = "pineapple") {
  const paths = {
    pineapple: '<path class="brand-leaf" d="M12 3V1M12 6 7 2M12 6l5-4M9 6 5 4M15 6l4-2"/><path d="M8 7h8v2h2v10h-2v3H8v-3H6V9h2Z"/><path d="m8 10 8 8m-8-3 5 5m-2-11 5 5m-8 4 8-8m-8 4 5-5m-2 11 5-5"/>',
    cube: '<path d="m12 2 9 5v10l-9 5-9-5V7Z"/><path d="m3 7 9 5 9-5M12 12v10"/>',
    code: '<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5Z"/>',
    spark: '<path d="M12 2v5m0 10v5M2 12h5m10 0h5M5 5l3 3m8 8 3 3M5 19l3-3m8-8 3-3"/>'
  };
  return `<svg class="brand-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true" focusable="false">${paths[name] || paths.pineapple}</svg>`;
}
export function brandNote(title, text, icon = "pineapple") {
  return `<aside class="brand-note"><div class="brand-note-title">${brandIcon(icon)}<strong>${title}</strong></div><p>${text}</p></aside>`;
}
