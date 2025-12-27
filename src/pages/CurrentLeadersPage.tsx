import { useNavigate } from "react-router-dom";
import { CurrentLeaders as CurrentLeadersContent } from "@/components/CurrentLeaders";

const CurrentLeadersPage = () => {
  const navigate = useNavigate();

  return <CurrentLeadersContent onBack={() => navigate("/")} />;
};

export default CurrentLeadersPage;
