import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { GovernancePage as GovernanceContent } from "@/components/Governance";
import { SEO } from "@/components/SEO";
import { Helmet } from "react-helmet";
<Helmet>
  <title>Governance — UISU</title>

  <meta property="og:title" content="UISU Governance" />
  <meta
    property="og:description"
    content="Learn how UISU is structured — from executives to committees and decision-making bodies."
  />
  <meta property="og:image" content="https://uisu.space/screenshot/governance.png" />
  <meta property="og:url" content="https://uisu.space/governance" />
  <meta property="og:type" content="website" />

  <meta name="twitter:card" content="summary_large_image" />
</Helmet>

const GovernancePage = () => {
  const navigate = useNavigate();
  
  return (
    <>
      <SEO
        title="Governance"
        description="Understand the structure of the University of Ibadan Students' Union. Executive, Legislative, and Student Representative Council."
        image="/screenshots/governance.png"
      />
      <GovernanceContent onBack={() => navigate("/")} />
    </>
  );
};

export default GovernancePage;
