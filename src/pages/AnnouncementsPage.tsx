import { useNavigate } from "react-router-dom";
import { AnnouncementsPage as Announcements } from "@/components/Announcements";

const AnnouncementsPage = () => {
  const navigate = useNavigate();
  
  return <Announcements onBack={() => navigate("/")} />;
};

export default AnnouncementsPage;
