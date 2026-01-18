
export interface HistoryNode {
    id: string;
    year: string;
    title: string;
    subtitle: string;
    chapter: "Global" | "Africa" | "Nigeria" | "UI" | "Union";
    description: string[];
    quote?: string;
}

export const historyTimeline: HistoryNode[] = [
    {
        id: "global-1",
        year: "1088",
        title: "Bologna & Paris",
        subtitle: "The Student Guilds",
        chapter: "Global",
        description: [
            "The concept of 'Universitas' was born not from administrative decree, but from student necessity. In Bologna, foreign students formed 'nations' to protect themselves from local laws.",
            "This early collective bargaining established the foundational principle: the university is a community of scholars, where students are active participants, not passive recipients."
        ]
    },
    {
        id: "africa-1",
        year: "1925",
        title: "WASU",
        subtitle: "West African Students' Union",
        chapter: "Africa",
        description: [
            "Founded in London by Ladipo Solanke and Herbert Bankole-Bright, WASU became the intellectual engine of West African nationalism.",
            "It wasn't just a student group; it was a political training ground. Leaders like Kwame Nkrumah and Jomo Kenyatta cut their teeth here, linking student welfare directly to the struggle for independence."
        ],
        quote: "We are the vanguard of a new Africa."
    },
    {
        id: "nigeria-1",
        year: "1956",
        title: "NUNS",
        subtitle: "National Union of Nigerian Students",
        chapter: "Nigeria",
        description: [
            "As Nigeria marched toward independence, the need for a unified student voice became critical. NUNS was established to coordinate student activities across the emerging tertiary institutions.",
            "Segun Okeowo and other early leaders ensured that students were a formidable pressure group in national discourse."
        ]
    },
    {
        id: "ui-1",
        year: "1948",
        title: "University College",
        subtitle: "The Premier Institution",
        chapter: "UI",
        description: [
            "Established as a college of the University of London, UI began with 104 students transferred from Yaba Higher College.",
            "The initial campus culture was heavily influenced by British traditions, but a distinct Nigerian student identity began to ferment in the halls of Mellamby and Tedder."
        ]
    },
    {
        id: "ui-2",
        year: "1959",
        title: "Ashby Commission",
        subtitle: "Investment in Education",
        chapter: "UI",
        description: [
            "The Commission on Post-School Certificate and Higher Education in Nigeria, led by Sir Eric Ashby, was a watershed moment.",
            "Its report recommended the expansion of higher education, directly leading to UI's transition from a university college to a fully autonomous university."
        ]
    },
    {
        id: "ui-3",
        year: "1962",
        title: "Autonomy",
        subtitle: "University of Ibadan",
        chapter: "UI",
        description: [
            "Severing ties with London, UI became a full-fledged university. This legal autonomy empowered the student body to demand a more localized and representative union structure.",
            "The Students' Union Constitution was drafted to reflect the aspirations of a newly independent nation."
        ]
    },
    {
        id: "union-1",
        year: "1971",
        title: "Adepeju's Sacrifice",
        subtitle: "The Martyrdom",
        chapter: "Union",
        description: [
            "During a protest against poor catering services and welfare conditions, the police opened fire. Kunle Adepeju, a second-year Agricultural student, was killed.",
            "His death galvanized the union, turning it from a welfare association into a militant force for justice. The 'Kunle Adepeju Memorial' remains the spiritual center of unionism at UI."
        ]
    },
    {
        id: "union-2",
        year: "1978",
        title: "Ali Must Go",
        subtitle: "National Struggle",
        chapter: "Union",
        description: [
            "UI students played a central role in the nationwide 'Ali Must Go' protests against the hike in tuition fees.",
            "Despite the violent crackdown and the banning of the union, the spirit of Aluta continued underground, proving that the union is in the students, not the building."
        ]
    },
    {
        id: "union-3",
        year: "1990s",
        title: "Anti-SAP Era",
        subtitle: "Fighting Austerity",
        chapter: "Union",
        description: [
            "The Structural Adjustment Program (SAP) decimated the middle class and education funding. The UI Students' Union led fierce resistance against the commercialization of education.",
            "This era defined the modern 'Aluta' culture: intellectual radicalism combined with mass mobilization."
        ]
    },
    {
        id: "union-4",
        year: "2024",
        title: "The Renaissance",
        subtitle: "Modern Unionism",
        chapter: "Union",
        description: [
            "Today, the Union evolves to meet digital challenges. From 'Aluta' to 'Intellectual Unionism', the focus shifts to welfare, capacity building, and smart negotiation.",
            "The struggle continues, but the methods adapt. The legacy of 1948, 1962, and 1971 lives on in every chant and every policy paper."
        ]
    }
];
