// Describe only what the existing named catalogue supports. Anonymous captures
// remain anonymous until the creator supplies an accurate project/scene label.
export const IMAGE_LABELS = {
  "chateau_loire.png": "Loire castle Minecraft build",
  "circuit24hdumans.jpg": "Le Mans race circuit in Minecraft",
  "larresingle.jpg": "Larressingle village Minecraft build",
  "little-bridge.png": "Small stone bridge Minecraft build",
  "maisonbois.png": "Wooden house Minecraft build",
  "Mt_Blanc_cut.png": "Mont Blanc Minecraft terrain",
  "Ocapiat-01.png": "Ocapiat building in Minecraft",
  "Parentis.png": "Parentis Minecraft landscape",
  "pontneufv1.png": "Pont Neuf Minecraft bridge",
  "potfleur.png": "Minecraft flower-pot decoration",
  "spawnfight4glory.jpg": "Fight4Glory event spawn in Minecraft",
  "Streaming-768x432.jpg": "Streaming studio Minecraft build",
  "CIRCUITxDIRIGEABLE.jpg": "Minecraft circuit and airship",
  "Larressingle.png": "Larressingle fortified village in Minecraft",
  "Lemans_-_france5.jpg": "Le Mans Minecraft view",
  "Lemans_-_large.png": "Wide view of Le Mans in Minecraft",
  "Occi.png": "Occi Minecraft landscape"
};
export function imageLabel(item, index) {
  return IMAGE_LABELS[item.name] || `Minecraft portfolio screenshot ${String(index + 1).padStart(3, "0")}`;
}
