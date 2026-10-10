export type ArchiveKind =
  | 'Article'
  | 'Document guide'
  | 'Digital museum'
  | 'Image gallery'
  | 'Timeline'
  | 'Portrait gallery'
  | 'Oral history'
  | 'Sound archive'
  | 'Map collection';

export interface ArchiveImage {
  src: string;
  alt: string;
  credit: string;
  sourceUrl: string;
}

export interface ArchiveRecord {
  slug: string;
  title: string;
  kind: ArchiveKind;
  period: string;
  summary: string;
  paragraphs: { heading: string; text: string }[];
  relatedLabel?: string;
  relatedPath?: string;
  image?: ArchiveImage;
  gallery?: ArchiveImage[];
  sourceNote?: string;
}

const c20Society = 'https://c20society.org.uk/building-of-the-month/university-of-ibadan-nigeria';
const ccBySa = 'https://creativecommons.org/licenses/by-sa/4.0/';

export const archiveRecords: ArchiveRecord[] = [
  {
    slug: 'a-union-finds-its-voice', title: 'A union finds its voice', kind: 'Article', period: '1948–1960',
    summary: 'An opening chapter on the people, ideas and institutions that make a student union legible across generations.',
    paragraphs: [
      { heading: 'Start with the record', text: 'The earliest chapter of any institution is rarely a single document. It is assembled from charters, meeting records, correspondence, photographs and the memories of people who were there. Read together, these traces show how a community begins to speak in its own name.' },
      { heading: 'Read with care', text: 'Dates and names should be checked against the original record wherever possible. This guide invites readers to connect the Union’s published history with the documents and recollections that continue to surface.' },
    ], relatedLabel: 'Explore the Union history', relatedPath: '/history',
  },
  {
    slug: 'the-campus-in-concrete', title: 'The campus in concrete', kind: 'Digital museum', period: '1948–1958',
    summary: 'A visual introduction to the early campus as an architectural record of learning, climate and public life.',
    paragraphs: [
      { heading: 'A campus planned as a whole', text: 'The University of Ibadan’s early buildings were planned and built between 1948 and 1958. The Twentieth Century Society describes a campus shaped by lecture spaces, residences, places of worship and a central library, designed by Maxwell Fry and Jane Drew.' },
      { heading: 'Architecture is evidence', text: 'A building records choices about movement, gathering and everyday life. Its materials and circulation tell one story; the ways students inhabit it tell another. This exhibit is a starting point for looking closely, not a substitute for first-hand architectural documentation.' },
    ], image: {
      src: '/archive/tekena-tamuno-building.jpg', alt: 'Front view of the Tekena Tamuno Building at the University of Ibadan',
      credit: 'SuperSwift · Wikimedia Commons · CC BY-SA 4.0 (cropped for display)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Front_View_of_the_Tekena_Tamuno_Building,_University_of_Ibadan.jpg',
    }, relatedLabel: 'Read the architectural essay', relatedPath: c20Society,
    sourceNote: 'Building history and dates are summarized from the Twentieth Century Society. The photograph is a contemporary campus view, not a historical image.',
  },
  {
    slug: 'thresholds-and-arrivals', title: 'Thresholds and arrivals', kind: 'Image gallery', period: 'A campus in the present',
    summary: 'A photo-led look at the campus gate as a point of arrival, passage and shared memory.',
    paragraphs: [
      { heading: 'A place to begin', text: 'Gates are practical structures, but they also frame the first impression of a place. This gallery treats the University entrance as a visual threshold between city and campus.' },
      { heading: 'Image note', text: 'The photograph shown here was made in 2010 and is presented as a contemporary view of the entrance. It should not be mistaken for a historical photograph of the Union.' },
    ], image: {
      src: '/archive/ibadan-gate.jpg', alt: 'The University of Ibadan entrance gate',
      credit: 'Eukoha · Wikimedia Commons · CC BY-SA 4.0 (cropped for display)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:University_of_Ibadan_gate,_Ibadan4.jpg',
    }, sourceNote: 'Photograph dated 2 January 2010; author Eukoha. Licensed under Creative Commons Attribution-ShareAlike 4.0.',
  },
  {
    slug: 'the-constitution-as-a-living-record', title: 'The Constitution as a living record', kind: 'Document guide', period: 'Continuing',
    summary: 'How to approach a constitution as both a text and a record of how a community chooses to govern itself.',
    paragraphs: [
      { heading: 'More than clauses', text: 'A constitution sets out offices, powers and procedures. It also preserves a community’s answers to questions about representation, accountability and change.' },
      { heading: 'Compare editions', text: 'When editions are available, compare their dates, amendments and transitional provisions. Always cite the version consulted; a later text may not describe an earlier moment.' },
    ], relatedLabel: 'Open the Constitution', relatedPath: '/constitution',
  },
  {
    slug: 'four-eras-of-student-unionism', title: 'Four eras of student unionism', kind: 'Timeline', period: '1948–present',
    summary: 'A guided reading of four broad eras already used in the public UISU history experience.',
    paragraphs: [
      { heading: 'A framework, not a verdict', text: 'The public history page groups the story into the Colonial Era (1948–1960), the Golden Age (1960–1975), the Resistance (1978–1999) and the Digital Turn (2000–present). These labels are useful orientation points, not a substitute for the more complicated record.' },
      { heading: 'Keep the timeline open', text: 'Period boundaries help organize material, but lives and movements do not always fit neatly between dates. As more sources are reviewed, this timeline should remain open to correction and detail.' },
    ], relatedLabel: 'Explore the history page', relatedPath: '/history',
  },
  {
    slug: 'the-student-press', title: 'The student press', kind: 'Digital museum', period: 'Across generations',
    summary: 'A reading room for student journalism, creative writing and the ways campus communities document themselves.',
    paragraphs: [
      { heading: 'Print as a public record', text: 'Student publications capture arguments and concerns that formal minutes may leave out. Editorials, reports, poems and letters show what people chose to put into circulation.' },
      { heading: 'Preserve the context', text: 'Issue date, publication name, author and page number are part of the evidence. A clipped article without its surrounding issue can lose its original context.' },
    ], relatedLabel: 'Visit Inks Vault', relatedPath: '/inks-vault',
  },
  {
    slug: 'leadership-through-the-years', title: 'Leadership through the years', kind: 'Portrait gallery', period: 'Past and present',
    summary: 'A people-centred route into leadership records, institutional roles and continuity over time.',
    paragraphs: [
      { heading: 'Names need context', text: 'A portrait is only one part of a leader’s record. Offices held, terms of service and the issues of the day help readers understand the work behind a name.' },
      { heading: 'Follow the record', text: 'The leadership directory is the source for published names and profiles. Where a detail is not present there, this exhibit does not guess or fill the gap.' },
    ], relatedLabel: 'Browse past leaders', relatedPath: '/past-leaders',
  },
  {
    slug: 'the-record-of-a-meeting', title: 'The record of a meeting', kind: 'Document guide', period: 'Every term',
    summary: 'A practical guide to agendas, minutes, motions and the small details that make proceedings understandable later.',
    paragraphs: [
      { heading: 'From discussion to record', text: 'Agendas show what participants expected to discuss. Minutes record what was formally noted, including decisions and actions. Neither is a full transcript of every voice in the room.' },
      { heading: 'Keep the chain intact', text: 'A useful meeting record identifies the body, date, chair, attendance and attachments. Linking a motion to the minutes that adopted it makes later research much easier.' },
    ], relatedLabel: 'Browse official documents', relatedPath: '/documents',
  },
  {
    slug: 'manifestos-and-mandates', title: 'Manifestos and mandates', kind: 'Document guide', period: 'Election cycles',
    summary: 'A collection guide for campaign promises and the public record of student representation.',
    paragraphs: [
      { heading: 'Read a manifesto as a source', text: 'A manifesto describes what a candidate or group says it intends to do. It is evidence of a platform at a particular moment, not proof that each proposal was later delivered.' },
      { heading: 'Pair promise with outcome', text: 'Where documentation exists, compare campaign material with later reports, meeting records and budget decisions. Keep the date and author attached to each item.' },
    ], relatedLabel: 'Explore elections', relatedPath: '/elections',
  },
  {
    slug: 'the-library-at-the-centre', title: 'The library at the centre', kind: 'Digital museum', period: 'Campus architecture',
    summary: 'A short exhibit on the library as a landmark in the early campus plan and a place of shared study.',
    paragraphs: [
      { heading: 'A landmark in the plan', text: 'The Twentieth Century Society’s account of the early campus describes the library as lying alongside the sports fields, with a large form and concrete screens intended to encourage cross-breezes.' },
      { heading: 'A working memory institution', text: 'Libraries preserve knowledge while making it available for use. This exhibit connects that civic role to the wider story of student records, publications and access to information.' },
    ], relatedLabel: 'Read the campus architecture source', relatedPath: c20Society,
    sourceNote: 'Architectural description summarized from the Twentieth Century Society’s University of Ibadan essay.',
  },
  {
    slug: 'halls-and-belonging', title: 'Halls and belonging', kind: 'Article', period: 'Campus life',
    summary: 'An invitation to document the places where students build routines, friendships and a sense of home.',
    paragraphs: [
      { heading: 'Everyday places matter', text: 'Residence life is made up of more than buildings. Shared kitchens, courtyards, study corners and traditions become part of how students remember their time on campus.' },
      { heading: 'Tell a specific story', text: 'A good contribution identifies the hall and approximate period, explains who is pictured or quoted, and records permission for publication where needed.' },
    ], relatedLabel: 'Explore halls of residence', relatedPath: '/halls',
  },
  {
    slug: 'a-map-of-campus-memory', title: 'A map of campus memory', kind: 'Map collection', period: 'Places and paths',
    summary: 'A spatial index for connecting buildings and routes to personal and institutional histories.',
    paragraphs: [
      { heading: 'Place is a source', text: 'A map can orient a visitor, but it can also prompt questions: what happened here, what changed, and how did people use this place at different times?' },
      { heading: 'Keep stories grounded', text: 'This page points to the existing campus map. It does not attach unverified events to locations; new place histories should be supported by a source or clearly attributed memory.' },
    ], relatedLabel: 'Open the campus map', relatedPath: '/campus-map',
  },
  {
    slug: 'the-editorial-desk', title: 'The editorial desk', kind: 'Article', period: 'Student journalism',
    summary: 'A behind-the-scenes reading of the work that turns campus events into public reporting.',
    paragraphs: [
      { heading: 'Reporting is a process', text: 'A published story reflects decisions about what to verify, whose voices to include and how to explain the issue. Drafts, corrections and final copies can all matter to researchers.' },
      { heading: 'Preserve more than the headline', text: 'Keep the publication name, byline, date and edition together. If a story is revised, record which version an archive holds.' },
    ], relatedLabel: 'Browse student writing', relatedPath: '/inks-vault',
  },
  {
    slug: 'the-public-notice-board', title: 'The public notice board', kind: 'Document guide', period: 'Current and historical notices',
    summary: 'Notices and announcements as a record of how information reaches students.',
    paragraphs: [
      { heading: 'Small records, large reach', text: 'A notice can document a deadline, a meeting, a call for participation or an institutional change. Its intended audience and publication channel help explain its meaning.' },
      { heading: 'Preserve the details', text: 'For a notice, keep the full text, issuing office, date and any version or distribution note. Remove personal contact information when publication would create a privacy risk.' },
    ], relatedLabel: 'See current announcements', relatedPath: '/announcements',
  },
  {
    slug: 'student-life-in-the-margins', title: 'Student life in the margins', kind: 'Article', period: 'Across generations',
    summary: 'A reading of informal traces—captions, handwritten notes and annotations—that surround official records.',
    paragraphs: [
      { heading: 'The margins speak softly', text: 'Annotations and captions can reveal how a document was used or understood. They are valuable, but they should be described separately from the official text.' },
      { heading: 'Respect the object', text: 'When documenting a marked-up source, note whether the annotation is contemporary, identify the source of that information and preserve the original alongside any transcription.' },
    ],
  },
  {
    slug: 'the-student-society-shelf', title: 'The student society shelf', kind: 'Digital museum', period: 'Clubs and communities',
    summary: 'A directory-led collection for the associations that shape learning and community beyond formal union offices.',
    paragraphs: [
      { heading: 'Many ways to belong', text: 'Societies and student groups create their own histories through events, performances, publications and shared work. Their records add texture to the larger campus story.' },
      { heading: 'Start with the directory', text: 'The communities listing is the current point of entry for student organizations. Historical details should be added with permission and a reliable source.' },
    ], relatedLabel: 'Explore communities', relatedPath: '/communities',
  },
  {
    slug: 'the-practice-of-representation', title: 'The practice of representation', kind: 'Article', period: 'Governance',
    summary: 'A primer on how roles, procedures and public accountability appear in governance records.',
    paragraphs: [
      { heading: 'Follow the responsibility', text: 'An institutional chart explains who holds a role. Meeting records and published decisions show how that responsibility is exercised in practice.' },
      { heading: 'Link the layers', text: 'Readers can move from a governing rule to a committee or office and then to its published records. This connection turns a static organization chart into a usable research path.' },
    ], relatedLabel: 'Explore governance', relatedPath: '/governance',
  },
  {
    slug: 'elections-as-civic-memory', title: 'Elections as civic memory', kind: 'Article', period: 'Election cycles',
    summary: 'A guide to preserving the sequence of a student election without reducing it to a result alone.',
    paragraphs: [
      { heading: 'Keep the sequence', text: 'Notices, candidate statements, procedures, results and post-election reports document different parts of an election. Together they offer a fuller picture of participation.' },
      { heading: 'Document the source', text: 'Record the issuing body, publication date and any amendments. Do not infer turnout or outcomes where an official source is absent.' },
    ], relatedLabel: 'Explore election information', relatedPath: '/elections',
  },
  {
    slug: 'gallery-of-the-everyday-campus', title: 'Gallery of the everyday campus', kind: 'Image gallery', period: 'Campus life',
    summary: 'A visual collection brief for photographs of ordinary campus places and the people who make them meaningful.',
    paragraphs: [
      { heading: 'Beyond the landmark', text: 'A campus gallery should include the small scenes that form everyday life: a study table, a walkway after rain, a notice pinned to a board or an event in preparation.' },
      { heading: 'Caption every photograph', text: 'Useful captions identify the place, approximate date, photographer and people when known. Ask permission before publishing identifiable contemporary portraits.' },
    ], image: {
      src: '/archive/ibadan-gate.jpg', alt: 'A view of the University of Ibadan gate and campus approach',
      credit: 'Eukoha · Wikimedia Commons · CC BY-SA 4.0 (cropped for display)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:University_of_Ibadan_gate,_Ibadan4.jpg',
    }, gallery: [
      {
        src: '/archive/ibadan-gate.jpg', alt: 'A view of the University of Ibadan gate and campus approach',
        credit: 'Eukoha · Wikimedia Commons · CC BY-SA 4.0 (cropped for display)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:University_of_Ibadan_gate,_Ibadan4.jpg',
      },
      {
        src: '/archive/tekena-tamuno-building.jpg', alt: 'The Senate Building, also known as the Tekena Tamuno Building, at the University of Ibadan',
        credit: 'SuperSwift · Wikimedia Commons · CC BY-SA 4.0 (cropped for display)',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Front_View_of_the_Tekena_Tamuno_Building,_University_of_Ibadan.jpg',
      },
    ],
  },
  {
    slug: 'a-building-read-from-the-front', title: 'A building read from the front', kind: 'Image gallery', period: 'Photographed 2018',
    summary: 'A close look at the Senate Building facade through a contemporary campus photograph.',
    paragraphs: [
      { heading: 'Notice the details', text: 'A facade can be read through its openings, shading, structure and relationship to the ground. Looking carefully is a first step toward asking better questions about design and use.' },
      { heading: 'Image note', text: 'The photograph is dated 29 May 2018 on Wikimedia Commons. It is a contemporary view and is not presented as a historical image.' },
    ], image: {
      src: '/archive/tekena-tamuno-building.jpg', alt: 'Front facade of the Tekena Tamuno Building, also known as the Senate Building',
      credit: 'SuperSwift · Wikimedia Commons · CC BY-SA 4.0 (cropped for display)',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Front_View_of_the_Tekena_Tamuno_Building,_University_of_Ibadan.jpg',
    },
  },
  {
    slug: 'voices-of-service', title: 'Voices of service', kind: 'Oral history', period: 'A growing collection',
    summary: 'A guide for building an oral-history collection with consent, context and careful preservation.',
    paragraphs: [
      { heading: 'A record made with people', text: 'Oral history begins with a conversation and an agreement about how it may be used. Contributors should know how their recording will be stored, credited and shared before the interview begins.' },
      { heading: 'Collection status', text: 'No interview recording is embedded in this guide. It sets out a responsible framework for future, consented contributions rather than presenting invented testimony.' },
    ], sourceNote: 'This page is a collection guide; it does not contain a recorded interview.',
  },
  {
    slug: 'the-listening-room', title: 'The listening room', kind: 'Sound archive', period: 'A growing collection',
    summary: 'A listening-room concept for speeches, campus soundscapes and recorded public conversations.',
    paragraphs: [
      { heading: 'Sound carries context', text: 'A recording can preserve tone, rhythm and audience response in ways a transcript cannot. It also requires clear metadata: who recorded it, where, when and under what conditions.' },
      { heading: 'Collection status', text: 'Audio items will be added when source files and publication permissions are confirmed. No audio has been fabricated for this page.' },
    ], sourceNote: 'This page describes a sound collection; there are no playable recordings yet.',
  },
  {
    slug: 'welfare-in-the-record', title: 'Welfare in the record', kind: 'Document guide', period: 'Policy and practice',
    summary: 'A route into documents that describe student needs, institutional response and the work of care.',
    paragraphs: [
      { heading: 'Read policy alongside practice', text: 'Policy states an intended approach. Reports, service information and student feedback can show how that approach was communicated and experienced.' },
      { heading: 'Protect sensitive details', text: 'Welfare material may include personal information. Publish only appropriately reviewed records, and redact details that identify individuals without a clear basis for disclosure.' },
    ], relatedLabel: 'Browse official documents', relatedPath: '/documents',
  },
  {
    slug: 'creative-work-and-campus-life', title: 'Creative work and campus life', kind: 'Digital museum', period: 'Creative archive',
    summary: 'A reading room for poems, essays and creative work that record the imagination of campus life.',
    paragraphs: [
      { heading: 'Creative records are records', text: 'Literature and visual work can preserve atmosphere, argument and aspiration. They should be catalogued with the creator’s name, title, date and the terms under which the work may be shared.' },
      { heading: 'Find the living collection', text: 'The current creative-writing collection is available through Inks Vault. This archive guide points visitors to that live collection rather than duplicating its content.' },
    ], relatedLabel: 'Open Inks Vault', relatedPath: '/inks-vault',
  },
  {
    slug: 'preserving-a-digital-union', title: 'Preserving a digital union', kind: 'Digital museum', period: '2000–present',
    summary: 'A practical look at how a digital institution can keep its records discoverable and trustworthy.',
    paragraphs: [
      { heading: 'Keep the file and its context', text: 'A digital record needs more than a filename. Preserve its creator, date, format, version and relationship to the meeting, event or publication it documents.' },
      { heading: 'Make preservation routine', text: 'Use stable formats, maintain more than one secure copy and review links over time. A public archive should also explain what is missing and how corrections can be submitted.' },
    ],
  },
  {
    slug: 'the-open-shelf', title: 'The open shelf', kind: 'Document guide', period: 'Collection access',
    summary: 'A guide to finding, citing and responsibly sharing the records already available to students.',
    paragraphs: [
      { heading: 'Browse the current shelves', text: 'Start with the public documents library for official records and with the Constitution page for the governing text. Each source should be cited with the exact title and version consulted.' },
      { heading: 'Help the archive grow', text: 'If you hold a record that may belong here, keep its original context and note who created it. Use the feedback channel to offer corrections or suggest material for review.' },
    ], relatedLabel: 'Open the documents library', relatedPath: '/documents',
  },
  {
    slug: 'memory-in-the-making', title: 'Memory in the making', kind: 'Article', period: 'The archive today',
    summary: 'A closing note on archives as shared work: collecting, describing, correcting and returning to the record.',
    paragraphs: [
      { heading: 'An archive is never finished', text: 'Each new document, photograph and recollection changes what can be asked of the past. A thoughtful archive makes its gaps visible and welcomes well-sourced corrections.' },
      { heading: 'Contribute with context', text: 'Share the creator, date, original setting and any use restrictions alongside a proposed item. The care given to a record before publication is part of its history too.' },
    ], relatedLabel: 'Send feedback', relatedPath: '/feedback',
  },
];
