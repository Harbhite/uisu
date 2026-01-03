import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { GovernancePage as GovernanceContent } from "@/components/Governance";
import { SEO } from "@/components/SEO";

const GovernancePage = () => {
  const navigate = useNavigate();
  
  return (
    <>
      <SEO
        title="Governance"
        description="Understand the structure of the University of Ibadan Students' Union. Executive, Legislative, and Student Representative Council."
        image="/og/og-governance.png"
      />
      <GovernanceContent onBack={() => navigate("/")} />
    </>
  );
};

export default GovernancePage;
