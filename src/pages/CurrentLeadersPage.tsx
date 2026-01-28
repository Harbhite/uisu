import { useNavigate } from "react-router-dom";
import { CurrentLeaders as CurrentLeadersContent } from "@/components/CurrentLeaders";
import { SEO } from "@/components/SEO";

const CurrentLeadersPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="Current Student Leaders | UISU Executive & Legislature 2024/25"
        description="Meet the serving UI Students' Union executives, SRC legislators, and hall majority leaders. Contact your representatives, view portfolios, and connect with student government."
        image="/og/pages-screenshot/current-leaders.png"
      />
      <CurrentLeadersContent onBack={() => navigate("/")} />
    </>
  );
};

export default CurrentLeadersPage;
