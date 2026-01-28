import { useNavigate } from "react-router-dom";
import { AnnouncementsPage as AnnouncementsComponent } from "@/components/Announcements";
import { SEO } from "@/components/SEO";

const AnnouncementsPage = () => {
  const navigate = useNavigate();
  
  return (
    <>
      <SEO
        title="Official Announcements | UISU News & Updates"
        description="Get the latest official news from UI Students' Union: policy updates, election notices, academic calendar changes, and important campus announcements. Stay informed, Uite."
        image="/og/pages-screenshot/announcements.png"
      />
      <AnnouncementsComponent onBack={() => navigate("/")} />
    </>
  );
};

export default AnnouncementsPage;
