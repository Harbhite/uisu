import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { GovernancePage as GovernanceContent } from "@/components/Governance";

const GovernancePage = () => {
  const navigate = useNavigate();
  
  return <GovernanceContent onBack={() => navigate("/")} />;
};

export default GovernancePage;
