/**
 * Chapters for the UISU history reel.
 *
 * Facts are drawn from the University of Ibadan's own history pages
 * (ui.edu.ng), the Wikipedia article on the university, the Bodleian /
 * Cambridge archive catalogues and the Fry & Drew architecture write-ups.
 *
 * IMAGES
 *  - `commons(...)` chapters hotlink Wikimedia Commons (verified file names).
 *  - `local(...)` chapters expect a file in /public/history-reel/. Drop the photo in
 *    and it appears; until then the slide shows a typographic fallback.
 */

export interface Fact {
  label: string;
  value: string;
}

export interface Mark {
  label: string;
  quote: string;
}

export interface Chapter {
  id: string;
  eyebrow: string;
  category: string;
  titleLines: string[];
  year: string;
  figure: Fact;
  /** Returns an image URL for a requested pixel width. */
  image: (w: number) => string;
  credit: string;
  marks: [Mark, Mark, Mark];
  description: string;
  facts: [Fact, Fact, Fact, Fact, Fact, Fact];
}

const commons =
  (file: string, maxW: number) =>
  (w: number): string =>
    `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${Math.min(w, maxW)}`;

const local =
  (path: string) =>
  (): string =>
    path;

export const CHAPTERS: Chapter[] = [
  {
    id: "eleyele-1948",
    eyebrow: "UNIVERSITY COLLEGE IBADAN · 18 JANUARY 1948",
    category: "THE FOUNDATION",
    titleLines: ["THE COLLEGE", "AT ELEYELE"],
    year: "1948",
    figure: { label: "PRINCIPAL", value: "KENNETH MELLANBY" },
    image: local("/history-reel/01-eleyele-1948.jpg"),
    credit: "",
    marks: [
      { label: "FOUNDATION STUDENTS", quote: "104 BEGIN CLASSES" },
      { label: "AFFILIATION", quote: "A COLLEGE OF LONDON" },
      { label: "A FIRST", quote: "NIGERIA'S FIRST DEGREE COLLEGE" },
    ],
    description:
      "On 18 January 1948, 104 foundation students began their courses at University College, Ibadan, the first degree-awarding institution in Nigeria. Staff, students and equipment had come down from Yaba Higher College, and the college set up first on an old military hospital site at Eleyele, about eight kilometres from where its permanent campus would rise. Kenneth Mellanby, named Principal in 1947, led it; the formal opening followed on 25 March.",
    facts: [
      { label: "FOUNDED", value: "1948" },
      { label: "STUDENTS", value: "104" },
      { label: "PRINCIPAL", value: "K. MELLANBY" },
      { label: "AFFILIATION", value: "UNIV. OF LONDON" },
      { label: "OPENED", value: "25 MAR 1948" },
      { label: "FIRST SITE", value: "ELEYELE" },
    ],
  },
  {
    id: "foundation-day-1948",
    eyebrow: "THE PERMANENT SITE · 17 NOVEMBER 1948",
    category: "FOUNDATION DAY",
    titleLines: ["THE SOD", "IS CUT"],
    year: "1948",
    figure: { label: "OBSERVED", value: "EVERY 17 NOVEMBER" },
    image: local("/history-reel/02-foundation-day.jpg"),
    credit: "",
    marks: [
      { label: "17 NOVEMBER 1948", quote: "GROUND IS BROKEN" },
      { label: "ARCHITECTS", quote: "FRY, DREW & PARTNERS" },
      { label: "THE LANDMARK", quote: "A TOWER FOR THE SKYLINE" },
    ],
    description:
      "On 17 November 1948 the sod of the permanent site was cut, a date the university has kept ever since as Foundation Day. The plans drawn up by Fry, Drew and partners would turn the cleared ground into lecture halls, residential colleges and a tower meant to stand as a symbol and landmark over a low-rise campus.",
    facts: [
      { label: "DATE", value: "17 NOV 1948" },
      { label: "SITE", value: "PERMANENT CAMPUS" },
      { label: "ARCHITECTS", value: "FRY & DREW" },
      { label: "KEPT AS", value: "FOUNDATION DAY" },
      { label: "SYMBOL", value: "THE TOWER" },
      { label: "STYLE", value: "TROPICAL MODERN" },
    ],
  },
  {
    id: "first-halls-1952",
    eyebrow: "MELLANBY & TEDDER HALLS · 17 NOVEMBER 1952",
    category: "HALLS OF RESIDENCE",
    titleLines: ["THE FIRST", "HALLS"],
    year: "1952",
    figure: { label: "OPENED BY", value: "LORD TEDDER" },
    image: commons(
      "ASC_Leiden_-_NSAG_-_van_Es_13_-_031_-_Ibadan_University._Steps_in_the_innercourt_leading_to_a_three-storey_modern_apartment_flat_building_-_Ibadan,_Oyo_State,_Nigeria_-_February_1962.tif",
      3200,
    ),
    credit: "Inner court, Ibadan University, Feb. 1962 · ASC Leiden (van Es) · Wikimedia Commons",
    marks: [
      { label: "FIRST HALL", quote: "MELLANBY OPENS" },
      { label: "RAF MARSHAL", quote: "LORD TEDDER OPENS BOTH" },
      { label: "NEXT", quote: "KUTI HALL IN 1954" },
    ],
    description:
      "Mellanby Hall, the university's first hall of residence, and Tedder Hall were formally opened on 17 November 1952 by Lord Tedder, Marshal of the Royal Air Force. Kuti Hall followed in 1954, and the hall system that still organises student life on the campus had begun.",
    facts: [
      { label: "FIRST HALL", value: "MELLANBY" },
      { label: "SECOND HALL", value: "TEDDER" },
      { label: "OPENED", value: "17 NOV 1952" },
      { label: "OPENED BY", value: "LORD TEDDER" },
      { label: "THEN", value: "KUTI, 1954" },
      { label: "DESIGN", value: "FRY & DREW" },
    ],
  },
  {
    id: "library-trenchard-1954",
    eyebrow: "FOUNDATION DAY · 17 NOVEMBER 1954",
    category: "THE CAMPUS ARRIVES",
    titleLines: ["THE LIBRARY", "& TRENCHARD"],
    year: "1954",
    figure: { label: "ARCHITECTS", value: "FRY, DREW & PARTNERS" },
    image: commons("Nigeria.JPG", 1603),
    credit: "Kenneth Dike Library · Koopman · Wikimedia Commons",
    marks: [
      { label: "THE HALL", quote: "TRENCHARD OPENS" },
      { label: "THE LIBRARY", quote: "THE MAIN LIBRARY IS COMMISSIONED" },
      { label: "THE SCREENS", quote: "SHADE AND AIR, IN CONCRETE" },
    ],
    description:
      "By Foundation Day 1954 the new campus had its centre. Trenchard Hall opened that day and the Protestant chapel was consecrated, and the library, commissioned on 17 November 1954 as the Main Library, took its place beside the Faculty of Arts. It was later named for Kenneth Dike, the university's first Nigerian Vice-Chancellor.",
    facts: [
      { label: "LIBRARY", value: "17 NOV 1954" },
      { label: "HALL", value: "TRENCHARD" },
      { label: "CHAPEL", value: "CONSECRATED 1954" },
      { label: "DESIGN", value: "FRY & DREW" },
      { label: "LATER NAMED", value: "KENNETH DIKE" },
      { label: "FEATURE", value: "CONCRETE SCREENS" },
    ],
  },
  {
    id: "independence-1962",
    eyebrow: "UNIVERSITY OF IBADAN · 1962",
    category: "AN INDEPENDENT UNIVERSITY",
    titleLines: ["A UNIVERSITY", "OF ITS OWN"],
    year: "1962",
    figure: { label: "FIRST NIGERIAN V-C", value: "KENNETH DIKE" },
    image: commons(
      "ASC_Leiden_-_NSAG_-_van_Dis_4_-_200_-_Prime_minister_of_Northern_Nigeria_Ahmadu_Bello_opens_Sultan_Bello_Hall_-_Ibadan,_Oyo_State,_South_West_Nigeria_-_1-13_February_1962.tif",
      3200,
    ),
    credit: "Opening of Sultan Bello Hall, Feb. 1962 · ASC Leiden (van Dis) · Wikimedia Commons",
    marks: [
      { label: "STATUS", quote: "OLDEST DEGREE-AWARDING UNIVERSITY" },
      { label: "LEADERSHIP", quote: "A NIGERIAN V-C" },
      { label: "FEB 1962", quote: "SULTAN BELLO HALL OPENS" },
    ],
    description:
      "In 1962 University College, Ibadan became the University of Ibadan, an independent institution and still the oldest degree-awarding university in Nigeria. Kenneth Dike, the historian who had led the college as its first African Principal, became Vice-Chancellor, serving until 1967. In February 1962 he stood beside Ahmadu Bello, Premier of Northern Nigeria, as Sultan Bello Hall was opened.",
    facts: [
      { label: "BECAME A UNIVERSITY", value: "1962" },
      { label: "VICE-CHANCELLOR", value: "K. DIKE" },
      { label: "TERM", value: "1962–1967" },
      { label: "NEW HALL", value: "SULTAN BELLO" },
      { label: "OPENED BY", value: "AHMADU BELLO" },
      { label: "STANDING", value: "OLDEST IN NIGERIA" },
    ],
  },
  {
    id: "the-union",
    eyebrow: "THE STUDENTS' UNION · FROM THE COLLEGE YEARS",
    category: "STUDENT UNIONISM",
    titleLines: ["THE UNION", "SPEAKS"],
    year: "1952–",
    figure: { label: "UNION ORGAN", value: "THE UNIVERSITY VOICE" },
    image: local("/history-reel/06-students-union.jpg"),
    credit: "",
    marks: [
      { label: "1952", quote: "THE UNIVERSITY VOICE IS PRINTED" },
      { label: "1962", quote: "A NATION-WIDE PROTEST" },
      { label: "1973", quote: "STUDENTS ON COMMITTEES" },
    ],
    description:
      "From its inception the university encouraged student unionism, and the Students' Union has been a fixture of campus life since the college years; its organ, The University Voice, was in print by September 1952. In 1962 Ibadan students led a nation-wide demonstration against the Anglo-Nigerian Defence Pact. Since 1973 students have sat on university committees, from welfare to community development.",
    facts: [
      { label: "UNION ORGAN", value: "THE UNIVERSITY VOICE" },
      { label: "FIRST ISSUE", value: "SEPT 1952" },
      { label: "1962", value: "DEFENCE PACT PROTEST" },
      { label: "FROM 1973", value: "COMMITTEE SEATS" },
      { label: "REPRESENTS", value: "ALL STUDENTS" },
      { label: "MOTTO", value: "RECTE SAPERE FONS" },
    ],
  },
];

export const FOUNDED_YEAR = 1948;
