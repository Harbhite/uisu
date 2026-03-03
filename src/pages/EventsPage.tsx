import { useNavigate } from "react-router-dom";
import { EventsCalendar } from "@/components/EventsCalendar";
import { SEO } from "@/components/SEO";

const EventsPage = () => {
  const navigate = useNavigate();
  
  return (
    <>
      <SEO
        title="Events Calendar | UISU Activities & Campus Happenings"
        description="Discover upcoming UI Students' Union events, academic calendar dates, cultural activities, and campus happenings. RSVP to lectures, concerts, and student-led initiatives at Ibadan."
        image="/og/og-events.png"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Events', url: '/events' },
        ]}
      />
      <EventsCalendar onBack={() => navigate("/")} />
    </>
  );
};

export default EventsPage;