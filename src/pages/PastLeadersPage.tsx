import { useNavigate } from "react-router-dom";
import { PastLeadersPage as PastLeadersContent } from "@/components/PastLeaders";

const PastLeadersPage = () => {
  const navigate = useNavigate();
  
  return <PastLeadersContent onBack={() => navigate("/")} />;
};

export default PastLeadersPage;
