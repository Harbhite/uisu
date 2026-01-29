import { useNavigate } from "react-router-dom";
import { GovernancePage as GovernanceContent } from "@/components/Governance";
import { SEO } from "@/components/SEO";

const governanceFaqs = [
  { 
    question: "What is the structure of the Students' Union?", 
    answer: "The UISU operates on a tripartite system: Executive Council (headed by the President), Students' Representative Council (the legislature), and Judicial Council (handles disputes and constitutional matters)." 
  },
  { 
    question: "How are student leaders elected?", 
    answer: "Student leaders are elected through campus-wide elections held annually. Candidates campaign across faculties and halls, and students vote for their preferred candidates." 
  },
  { 
    question: "What does the Executive Council do?", 
    answer: "The Executive Council implements union policies, represents students to the university administration, organizes events, and manages the day-to-day affairs of the union." 
  },
  { 
    question: "What is the SRC?", 
    answer: "The Students' Representative Council (SRC) is the legislative arm. It comprises representatives from each faculty who deliberate on student matters and pass resolutions." 
  }
];

const GovernancePage = () => {
  const navigate = useNavigate();
  
  return (
    <>
      <SEO
        title="Governance Structure | UISU Executive & Legislature"
        description="Learn how UI Students' Union operates: Executive Council, Students' Representative Council (SRC), Judicial Council, and committee structures. Understand the first student union in Nigeria."
        image="/og/pages-screenshot/governance.png"
        url="/governance"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Governance', url: '/governance' }
        ]}
        faq={governanceFaqs}
      />
      <GovernanceContent onBack={() => navigate("/")} />
    </>
  );
};

export default GovernancePage;
