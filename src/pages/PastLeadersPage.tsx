import { useNavigate } from "react-router-dom";
import { PastLeadersPage as PastLeadersContent } from "@/components/PastLeaders";
import { SEO } from "@/components/SEO";

const PastLeadersPage = () => {
  const navigate = useNavigate();
  
  return (
    <>
      <SEO
        title="Hall of Fame | Past UISU Presidents Since 1948"
        description="Explore 75+ years of UI Students' Union leadership. Discover past presidents, PROs, and executives who shaped Nigerian student activism from Wole Soyinka's era to today."
        image="/og/pages-screenshot/past-leaders.png"
      />
      <PastLeadersContent onBack={() => navigate("/")} />
    </>
  );
};

export default PastLeadersPage;
