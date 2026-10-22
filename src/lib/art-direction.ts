import enchantedLanterns from "@/assets/style-boards/enchanted-lanterns.webp";
import cloudCartographers from "@/assets/style-boards/cloud-cartographers.webp";
import tideglass from "@/assets/style-boards/tideglass.webp";
import nightGarden from "@/assets/style-boards/night-garden.webp";

export const ART_DIRECTION_BOARDS = [
  {
    id: "enchanted-lanterns",
    name: "Enchanted Lanterns",
    medium: "Gouache + watercolor",
    palette: "Deep pine · lantern amber · coral",
    image: enchantedLanterns,
    sourceRequest: "d0a4065b-bf3c-455a-b1cc-7501bc20d27c",
    prompt:
      "Tactile gouache and watercolor paint, layered paper grain, deep pine and warm lantern amber, expressive faces, cinematic golden rim light, carefully designed woodland environments, premium picture-book illustration.",
  },
  {
    id: "cloud-cartographers",
    name: "Cloud Cartographers",
    medium: "Ink + colored pencil",
    palette: "Cobalt · apricot · moss",
    image: cloudCartographers,
    sourceRequest: "f8a911eb-914e-42dd-bed3-43d66efdd6f1",
    prompt:
      "Refined ink and colored pencil, architectural linework, soft cream paper, cobalt and apricot with moss green, intelligent visual storytelling, precise exploratory environments, premium illustrated book art.",
  },
  {
    id: "tideglass",
    name: "Tideglass",
    medium: "3D clay + miniature sets",
    palette: "Turquoise · midnight · pearl",
    image: tideglass,
    sourceRequest: "c01deaba-6766-4414-b9c2-987929edb60a",
    prompt:
      "Cinematic 3D clay and handcrafted miniature sets, tactile materials, translucent turquoise and midnight blue with pearl highlights, volumetric caustic light, premium family animation concept art.",
  },
  {
    id: "night-garden",
    name: "Night Garden",
    medium: "Ink wash + neon pigment",
    palette: "Indigo · lilac · leaf green",
    image: nightGarden,
    sourceRequest: "2761db43-a8ad-4c73-9efc-e836f9840569",
    prompt:
      "Painterly ink wash with selective neon pigment, indigo and electric lilac with leaf green, quiet emotional atmosphere, precise silhouettes, bioluminescent details, premium graphic storybook art.",
  },
] as const;
