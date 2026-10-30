import enchantedLanterns from "@/assets/style-boards/enchanted-lanterns.png";
import cloudCartographers from "@/assets/style-boards/cloud-cartographers.png";
import tideglass from "@/assets/style-boards/tideglass.png";
import nightGarden from "@/assets/style-boards/night-garden.png";
import paperTheatre from "@/assets/style-boards/paper-theatre.webp";
import woodlandBlockprint from "@/assets/style-boards/woodland-blockprint.webp";
import terracottaDreams from "@/assets/style-boards/terracotta-dreams.webp";
import midnightInkGarden from "@/assets/style-boards/midnight-inkgarden.webp";

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
  {
    id: "paper-theatre",
    name: "Paper Theatre",
    medium: "Layered cut paper + stage light",
    palette: "Warm ivory · vermilion · marigold",
    image: paperTheatre,
    prompt:
      "Hand-cut layered paper scenery with visible fiber edges, miniature theatrical staging, sculptural depth and soft stage-light shadows; warm ivory, vermilion, ink navy and marigold; compose clear, readable silhouettes with tactile handmade detail, like an heirloom pop-up book.",
  },
  {
    id: "woodland-blockprint",
    name: "Woodland Blockprint",
    medium: "Carved ink + layered print",
    palette: "Forest · persimmon · cream",
    image: woodlandBlockprint,
    prompt:
      "Contemporary carved woodblock picture-book art with confident cut lines, restrained layered ink registration, visible paper tooth and decorative natural forms; forest green, persimmon, cream and aubergine; expressive faces and strong silhouettes, no borrowed or costume-coded cultural motifs.",
  },
  {
    id: "terracotta-dreams",
    name: "Terracotta Dreams",
    medium: "Hand-built clay + miniature sets",
    palette: "Terracotta · dusty rose · ultramarine",
    image: terracottaDreams,
    prompt:
      "Hand-built matte clay characters and miniature sets with subtle fingerprints, rounded sculptural shapes and cinematic soft shadows; terracotta, dusty rose, warm sand and ultramarine; create an intimate family-animation world with nuanced material depth and readable storytelling.",
  },
  {
    id: "midnight-inkgarden",
    name: "Midnight Inkgarden",
    medium: "Watercolor + graphite + gilt accents",
    palette: "Midnight blue · celadon · soft violet",
    image: midnightInkGarden,
    prompt:
      "Detailed watercolor and fine graphite on softly textured paper, with selective warm-gold painted highlights; midnight blue, celadon and soft violet; delicate luminous botanical details, intimate night lighting, quiet wonder and refined editorial picture-book composition.",
  },
] as const;
