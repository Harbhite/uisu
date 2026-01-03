import { useNavigate } from "react-router-dom";
import { EventsCalendar } from "@/components/EventsCalendar";
import { SEO } from "@/components/SEO";

const EventsPage = () => {
  const navigate = useNavigate();
  
  return (
    <>
      <SEO
        title="Events"
        description="Stay updated with the latest union activities, academic calendar, and campus events."
        image="/og/og-events.png"
      />
      <EventsCalendar onBack={() => navigate("/")} />
    </>
  );
};

export default EventsPage;