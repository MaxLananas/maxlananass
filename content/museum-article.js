// Editorial coverage of the Muséum de Toulouse / BuildTheEarth France project.
// The museum photo stays on its publisher's domain and is attributed as published.
export const MUSEUM_ARTICLE_PATH = "/articles/toulouse-pont-neuf-minecraft/";

const image = {
  editorial: true,
  src: "https://museum.toulouse-metropole.fr/wp-content/uploads/sites/6/2026/09/1000047330.jpg",
  width: 1000,
  height: 563,
  title: {
    en: "Pont Neuf in Toulouse recreated in Minecraft by MaxLananas",
    fr: "Le Pont-Neuf de Toulouse reconstruit dans Minecraft par MaxLananas",
    es: "El Pont Neuf de Toulouse recreado en Minecraft por MaxLananas"
  },
  caption: {
    en: "The second photograph at the end of the Muséum de Toulouse article shows MaxLananas’s Minecraft recreation of Toulouse’s Pont Neuf. The museum credits the photograph to BTE France.",
    fr: "La seconde photographie en fin d’article du Muséum de Toulouse montre ma reproduction Minecraft du Pont-Neuf de Toulouse. Le Muséum crédite la photographie à BTE France.",
    es: "La segunda fotografía al final del artículo del Muséum de Toulouse muestra la recreación en Minecraft del Pont Neuf de Toulouse por MaxLananas. El museo acredita la fotografía a BTE France."
  },
  creator: "BuildTheEarth France (photo credit published by the Muséum de Toulouse)",
  copyrightNotice: "Photograph credited to BTE France by the Muséum de Toulouse. The Minecraft Pont Neuf build is by MaxLananas. All rights remain with their respective owners.",
  license: "https://maxlananas.is-a.dev/about/#image-rights",
  acquireLicensePage: "https://maxlananas.is-a.dev/about/#image-rights"
};

export const MUSEUM_ARTICLE = {
  image,
  en: {
    title: "My Toulouse Pont Neuf build featured by the Muséum",
    heading: "My Toulouse Pont Neuf build featured by the Muséum",
    description: "The Muséum de Toulouse’s Minecraft feature includes my Pont Neuf build. See the image, credits and details of the BuildTheEarth France project.",
    sections: [
      { title: "A Toulouse museum project in Minecraft", paragraphs: [
        "The Muséum de Toulouse has invited BuildTheEarth France to recreate the museum in Minecraft at a reported one block per metre scale. The museum’s event page describes a public project running from 14 September 2026 to 1 February 2027, with the first stone ceremony announced for 2 October.",
        "The article is about the museum recreation. The photograph below appears as the second image at the end of that article; it shows a different Toulouse landmark, the Pont Neuf."
      ] },
      { title: "The Pont Neuf build is mine", paragraphs: [
        "I created the Minecraft Pont Neuf shown in that photograph. Seeing this build included in the Muséum’s coverage of the BuildTheEarth France community is a meaningful credit and a great way to connect a personal build with Toulouse’s architectural heritage.",
        "To be precise about the scope: this photograph documents my Pont Neuf recreation; it does not mean that I built the Muséum project or represent BuildTheEarth France. The Muséum’s image credit reads “BTE France.”"
      ] },
      { title: "Sources and image credits", paragraphs: [
        "The event details and image are published by the Muséum de Toulouse. The photograph is displayed here from the museum’s original page, with its published BTE France credit retained. Image rights remain with their respective owners; see the image-rights information before reuse.",
        "BuildTheEarth France is a collaborative community. Visit its official site for the project and participation information."
      ] }
    ],
    sourceLabel: "Read the Muséum de Toulouse article",
    bteLabel: "BuildTheEarth France",
    rightsLabel: "Image rights and reuse information"
  },
  fr: {
    title: "Mon Pont-Neuf de Toulouse mis en avant par le Muséum",
    heading: "Mon Pont-Neuf de Toulouse mis en avant par le Muséum",
    description: "L’article Minecraft du Muséum de Toulouse présente mon build du Pont-Neuf. Retrouvez la photo, les crédits et le contexte du projet BuildTheEarth France.",
    sections: [
      { title: "Un projet Minecraft au Muséum de Toulouse", paragraphs: [
        "Le Muséum de Toulouse a invité BuildTheEarth France à reproduire le Muséum dans Minecraft, à l’échelle annoncée d’un bloc par mètre. La page de l’événement annonce une période du 14 septembre 2026 au 1er février 2027 et une pose de première pierre le 2 octobre.",
        "L’article du Muséum porte sur la reproduction du musée. La photographie ci-dessous est la seconde image à la fin de cet article ; elle montre un autre monument toulousain : le Pont-Neuf."
      ] },
      { title: "Le build du Pont-Neuf est le mien", paragraphs: [
        "J’ai réalisé le Pont-Neuf de Toulouse visible sur cette photographie. Voir ce build repris dans l’article du Muséum consacré à la communauté BuildTheEarth France est une belle reconnaissance et un lien fort entre une création personnelle et le patrimoine architectural toulousain.",
        "Pour être précis : cette photo documente ma reproduction du Pont-Neuf ; cela ne signifie pas que j’ai construit le projet du Muséum ni que je représente BuildTheEarth France. Le crédit photo indiqué par le Muséum est « BTE France »."
      ] },
      { title: "Sources et crédits de l’image", paragraphs: [
        "Les informations sur l’événement et la photographie sont publiées par le Muséum de Toulouse. L’image est affichée depuis la page d’origine du Muséum et conserve le crédit BTE France qui y est indiqué. Les droits restent à leurs titulaires respectifs ; consultez les informations sur les droits avant toute réutilisation.",
        "BuildTheEarth France est une communauté collaborative. Consultez son site officiel pour en savoir plus sur le projet et les modalités de participation."
      ] }
    ],
    sourceLabel: "Lire l’article du Muséum de Toulouse",
    bteLabel: "BuildTheEarth France",
    rightsLabel: "Droits et réutilisation des images"
  },
  es: {
    title: "El Muséum destaca mi build del Pont Neuf de Toulouse",
    heading: "El Muséum destaca mi build del Pont Neuf de Toulouse",
    description: "El artículo Minecraft del Muséum de Toulouse incluye mi build del Pont Neuf. Consulta la imagen, los créditos y el contexto de BuildTheEarth France.",
    sections: [
      { title: "Un proyecto Minecraft en el museo de Toulouse", paragraphs: [
        "El Muséum de Toulouse invitó a BuildTheEarth France a recrear el museo en Minecraft a una escala anunciada de un bloque por metro. La página del evento indica que tendrá lugar del 14 de septiembre de 2026 al 1 de febrero de 2027, con una ceremonia de inicio prevista para el 2 de octubre.",
        "El artículo del museo trata sobre la recreación del Muséum. La fotografía siguiente es la segunda imagen al final del artículo y muestra otro monumento de Toulouse: el Pont Neuf."
      ] },
      { title: "El build del Pont Neuf es mío", paragraphs: [
        "Yo construí en Minecraft el Pont Neuf de Toulouse que aparece en esa fotografía. Que el Muséum incluya este build en su cobertura de la comunidad BuildTheEarth France es un reconocimiento importante y conecta una creación personal con el patrimonio arquitectónico de Toulouse.",
        "Para precisar el alcance: la fotografía documenta mi recreación del Pont Neuf; no significa que haya construido el proyecto del Muséum ni que represente a BuildTheEarth France. El crédito de la fotografía que publica el museo es «BTE France»."
      ] },
      { title: "Fuentes y créditos de imagen", paragraphs: [
        "La información del evento y la fotografía están publicadas por el Muséum de Toulouse. La imagen se muestra desde la página original del museo y conserva el crédito BTE France indicado allí. Los derechos corresponden a sus respectivos titulares; consulta la información sobre derechos antes de reutilizarla.",
        "BuildTheEarth France es una comunidad colaborativa. Visita su web oficial para conocer el proyecto y cómo participar."
      ] }
    ],
    sourceLabel: "Leer el artículo del Muséum de Toulouse",
    bteLabel: "BuildTheEarth France",
    rightsLabel: "Derechos y reutilización de imágenes"
  }
};
