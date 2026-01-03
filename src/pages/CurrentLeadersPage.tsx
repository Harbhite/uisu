import { useNavigate } from "react-router-dom";
import { CurrentLeaders as CurrentLeadersContent } from "@/components/CurrentLeaders";
import { SEO } from "@/components/SEO";
import { Helmet } from "react-helmet";

export default function CurrentLeaders() {
  return (
    <>
      <Helmet>
        <title>Current Leaders — UISU</title>

        <meta property="og:title" content="Meet the Current UISU Leaders" />
        <meta property="og:description" content="Profiles of the current UISU executives and representatives." />
        <meta property="og:image" content="https://uisu.space/screenshot/current-leaders.png" />
        <meta property="og:url" content="https://uisu.space/current-leaders" />
      </Helmet>
    </>
  );
}

const CurrentLeadersPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="Current Leaders"
        description="Meet the current executive council, legislators, and hall leaders of the University of Ibadan Students' Union."
        image="/screenshots/current-leaders.png"
      />
      <CurrentLeadersContent onBack={() => navigate("/")} />
    </>
  );
};

export default CurrentLeadersPage;
