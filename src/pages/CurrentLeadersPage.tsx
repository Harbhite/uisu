import { useNavigate } from "react-router-dom";
import { CurrentLeaders as CurrentLeadersContent } from "@/components/CurrentLeaders";
import { SEO } from "@/components/SEO";

const CurrentLeadersPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="Current Leaders"
        description="Meet the current executive council, legislators, and hall leaders of the University of Ibadan Students' Union."
        image="/og/og-leaders.png"
      />
      <CurrentLeadersContent onBack={() => navigate("/")} />
    </>
  );
};

export default CurrentLeadersPage;
