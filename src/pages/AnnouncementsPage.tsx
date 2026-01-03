import { useNavigate } from "react-router-dom";
import { AnnouncementsPage as AnnouncementsComponent } from "@/components/Announcements";
import { SEO } from "@/components/SEO";
import { Helmet } from "react-helmet";

export default function Announcement() {
  return (
    <>
      <Helmet>
        <title>Announcements — UISU</title>

        <meta property="og:title" content="UISU Announcements" />
        <meta property="og:description" content="Latest announcements and important updates from UISU." />
        <meta property="og:image" content="https://uisu.space/screenshot/announcement.png" />
        <meta property="og:url" content="https://uisu.space/announcement" />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* page content */}
    </>
  );
}

const AnnouncementsPage = () => {
  const navigate = useNavigate();
  
  return (
    <>
      <SEO
        title="Announcements"
        description="Stay informed with the latest news, updates, and official announcements from the University of Ibadan Students' Union."
        image="/screenshots/announcements.png"
      />
      <AnnouncementsComponent onBack={() => navigate("/")} />
    </>
  );
};

export default AnnouncementsPage;
