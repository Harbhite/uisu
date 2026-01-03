import { useNavigate } from "react-router-dom";
import { PastLeadersPage as PastLeadersContent } from "@/components/PastLeaders";
import { SEO } from "@/components/SEO";

const PastLeadersPage = () => {
  const navigate = useNavigate();
  
  return (
    <>
      <SEO
        title="Past Leaders"
        description="Explore the Hall of Fame. Celebrating the presidents and executives who shaped the history of the University of Ibadan Students' Union."
        image="/screenshots/past-leaders.png"
      />
      <PastLeadersContent onBack={() => navigate("/")} />
    </>
  );
};

export default PastLeadersPage;
