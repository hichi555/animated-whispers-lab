import threeDCartoon from "@/assets/showcase/styles/3d-cartoon.webp";
import threeDClay from "@/assets/showcase/styles/3d-clay.webp";
import clayCharacter from "@/assets/showcase/styles/clay-character.webp";
import clayVillage from "@/assets/showcase/styles/clay-village.webp";
import coloredPencil from "@/assets/showcase/styles/colored-pencil.webp";
import comicBook from "@/assets/showcase/styles/comic-book.webp";
import enchantedRealism from "@/assets/showcase/styles/enchanted-realism.webp";
import engraving from "@/assets/showcase/styles/engraving.webp";
import gouacheStorybook from "@/assets/showcase/styles/gouache-storybook.webp";
import inkWash from "@/assets/showcase/styles/ink-wash.webp";
import neonFantasy from "@/assets/showcase/styles/neon-fantasy.webp";
import oilPainting from "@/assets/showcase/styles/oil-painting.webp";
import paperCutOut from "@/assets/showcase/styles/paper-cut-out.webp";
import softWatercolor from "@/assets/showcase/styles/soft-watercolor.webp";
import bookCover from "@/assets/showcase/book/cover.webp";
import bookPage1 from "@/assets/showcase/book/page-1.webp";
import bookPage2 from "@/assets/showcase/book/page-2.webp";
import bookPage3 from "@/assets/showcase/book/page-3.webp";
import bookPage4 from "@/assets/showcase/book/page-4.webp";
import bookPage5 from "@/assets/showcase/book/page-5.webp";
import bookPage6 from "@/assets/showcase/book/page-6.webp";
import comic from "@/assets/showcase/forms/comic.webp";
import filmStill from "@/assets/showcase/forms/film-still.webp";
import poster from "@/assets/showcase/forms/poster.webp";
import characterSheet from "@/assets/showcase/forms/character-sheet.webp";
import place from "@/assets/showcase/forms/place.webp";
import prop from "@/assets/showcase/forms/prop.webp";
import { ART_STYLES } from "@/lib/catalog";

export type ArtStyleId = (typeof ART_STYLES)[number]["id"];
export type SampleLanguage = "en" | "fr" | "es";

export const STYLE_SAMPLES = {
  "Soft watercolor": {
    image: softWatercolor,
    slug: "soft-watercolor",
    bestFor: "Bedtime stories and gentle feelings",
  },
  "Gouache storybook": {
    image: gouacheStorybook,
    slug: "gouache-storybook",
    bestFor: "Classic picture books with bold shapes",
  },
  "Colored pencil": {
    image: coloredPencil,
    slug: "colored-pencil",
    bestFor: "Cosy, hand-made keepsakes",
  },
  "Paper cut-out": {
    image: paperCutOut,
    slug: "paper-cut-out",
    bestFor: "Playful books for early readers",
  },
  "3D clay": {
    image: threeDClay,
    slug: "3d-clay",
    bestFor: "Funny stories for the youngest readers",
  },
  "Ink & wash": {
    image: inkWash,
    slug: "ink-wash",
    bestFor: "Timeless fables and literary tales",
  },
  "3D cartoon": {
    image: threeDCartoon,
    slug: "3d-cartoon",
    bestFor: "Big adventures with animated energy",
  },
  "Clay village": {
    image: clayVillage,
    slug: "clay-village",
    bestFor: "World-building and place-led stories",
  },
  "Clay character": {
    image: clayCharacter,
    slug: "clay-character",
    bestFor: "Close, character-led emotional moments",
  },
  "Neon fantasy": {
    image: neonFantasy,
    slug: "neon-fantasy",
    bestFor: "Magical, dreamlike and space stories",
  },
  "Oil painting": {
    image: oilPainting,
    slug: "oil-painting",
    bestFor: "Heirloom gift books",
  },
  Engraving: {
    image: engraving,
    slug: "engraving",
    bestFor: "Fairy tales and folklore",
  },
  "Enchanted realism": {
    image: enchantedRealism,
    slug: "enchanted-realism",
    bestFor: "Immersive fantasy for older readers",
  },
  "Comic book": {
    image: comicBook,
    slug: "comic-book",
    bestFor: "Action stories with graphic-novel pacing",
  },
} satisfies Record<ArtStyleId, { image: string; slug: string; bestFor: string }>;

export const SAMPLE_BOOK = {
  cover: {
    image: bookCover,
    title: {
      en: "Fern and the Lantern Fox",
      fr: "Fern et le Renard-Lanterne",
      es: "Fern y el Zorro Farol",
    },
    subtitle: {
      en: "A bedtime adventure for ages 4–6",
      fr: "Une aventure du soir pour les 4–6 ans",
      es: "Una aventura para la hora de dormir, de 4 a 6 años",
    },
    blurb: {
      en: "A lantern goes out. A fox lights the way. A gentle story about being brave in the dark, and the friends who make it easier.",
      fr: "Une lanterne s'éteint. Un renard éclaire le chemin. Une histoire douce sur le courage dans le noir, et sur les amis qui le rendent plus facile.",
      es: "Un farol se apaga. Un zorro ilumina el camino. Una historia tierna sobre ser valiente en la oscuridad y sobre los amigos que lo hacen más fácil.",
    },
  },
  pages: [
    {
      image: bookPage1,
      text: {
        en: "At the edge of Willowmere, Fern's lantern flickered and went dark. Far away, between the trees, something small was glowing.",
        fr: "Au bord de Willowmere, la lanterne de Fern vacilla, puis s'éteignit. Au loin, entre les arbres, quelque chose de tout petit brillait.",
        es: "En las afueras de Willowmere, el farol de Fern parpadeó y se apagó. A lo lejos, entre los árboles, algo pequeño brillaba.",
      },
    },
    {
      image: bookPage2,
      text: {
        en: "The glow was a fox. The tip of his tail shone like a warm ember. “I'm Ember,” said the fox. “I've lost my way home.”",
        fr: "Cette lueur, c'était un renard. Le bout de sa queue brillait comme une braise. « Je m'appelle Ember, dit le renard. Je ne retrouve plus le chemin de la maison. »",
        es: "El brillo era un zorro. La punta de su cola resplandecía como una brasa cálida. —Me llamo Ember —dijo el zorro—. He perdido el camino a casa.",
      },
    },
    {
      image: bookPage3,
      text: {
        en: "“Then we'll find it together,” said Fern. They crossed the mossy bridge, where fireflies blinked hello.",
        fr: "« Alors, nous le chercherons ensemble », dit Fern. Ils traversèrent le pont couvert de mousse, où les lucioles clignaient pour leur dire bonjour.",
        es: "—Entonces lo encontraremos juntos —dijo Fern. Cruzaron el puente cubierto de musgo, donde las luciérnagas parpadeaban para saludar.",
      },
    },
    {
      image: bookPage4,
      text: {
        en: "The forest grew very dark. Fern's knees felt wobbly. Ember curled his glowing tail around her, and the dark felt a little smaller.",
        fr: "La forêt devint très sombre. Les genoux de Fern tremblaient. Ember enroula sa queue lumineuse autour d'elle, et le noir sembla un peu plus petit.",
        es: "El bosque se volvió muy oscuro. A Fern le temblaban las rodillas. Ember enroscó su cola luminosa a su alrededor, y la oscuridad pareció un poco más pequeña.",
      },
    },
    {
      image: bookPage5,
      text: {
        en: "At the old oak, they found a hollow full of soft, sleepy lights. “Home,” Ember whispered.",
        fr: "Au pied du vieux chêne, ils trouvèrent un creux rempli de douces lumières endormies. « La maison », murmura Ember.",
        es: "Junto al viejo roble encontraron un hueco lleno de luces suaves y dormilonas. —Mi casa —susurró Ember.",
      },
    },
    {
      image: bookPage6,
      text: {
        en: "Ember's mother touched Fern's lantern with her tail. It glowed brighter than ever — all the way home.",
        fr: "La maman d'Ember toucha la lanterne de Fern du bout de sa queue. Elle brilla plus fort que jamais — tout le long du chemin du retour.",
        es: "La mamá de Ember tocó el farol de Fern con la punta de su cola. Brilló más que nunca, durante todo el camino a casa.",
      },
    },
  ],
} as const;

export const FORM_SAMPLES = {
  pictureBook: { image: bookPage2 },
  comic: { image: comic },
  poster: { image: poster },
  motion: { image: filmStill },
} as const;

export const WORLD_REFERENCES = {
  characterSheet: { image: characterSheet },
  place: { image: place, name: "Willowmere, the lakeside village" },
  prop: { image: prop, name: "Fern's brass lantern" },
  bookPages: [bookPage1, bookPage2, bookPage3, bookPage4, bookPage5, bookPage6],
} as const;
