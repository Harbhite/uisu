import { useNavigate } from "react-router-dom";
import { AnnouncementsPage as AnnouncementsComponent } from "@/components/Announcements";
import { SEO } from "@/components/SEO";

const AnnouncementsPage = () => {
  const navigate = useNavigate();
  
  return (
    <>
      <SEO
        title="Announcements"
        description="Stay informed with the latest news, updates, and official announcements from the University of Ibadan Students' Union."
        image="/og/og-announcements.png"
      />
      <AnnouncementsComponent onBack={() => navigate("/")} />
    </>
  );
};

export default AnnouncementsPage;
