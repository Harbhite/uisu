import { useNavigate } from "react-router-dom";
import { GovernancePage as GovernanceContent } from "@/components/Governance";
import { SEO } from "@/components/SEO";

const GovernancePage = () => {
  const navigate = useNavigate();
  
  return (
    <>
      <SEO
        title="Governance Structure | UISU Executive & Legislature"
        description="Learn how UI Students' Union operates: Executive Council, Students' Representative Council (SRC), Judicial Council, and committee structures. Understand the first student union in Nigeria."
        image="/og/pages-screenshot/governance.png"
      />
      <GovernanceContent onBack={() => navigate("/")} />
    </>
  );
};

export default GovernancePage;
