import { useNavigate } from "react-router-dom";
import { AnnouncementsPage as AnnouncementsComponent } from "@/components/Announcements";

const AnnouncementsPage = () => {
  const navigate = useNavigate();
  
  return <AnnouncementsComponent onBack={() => navigate("/")} />;
};

export default AnnouncementsPage;
