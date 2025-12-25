import { useNavigate } from "react-router-dom";
import { EventsCalendar } from "@/components/EventsCalendar";

const EventsPage = () => {
  const navigate = useNavigate();
  
  return <EventsCalendar onBack={() => navigate("/")} />;
};

export default EventsPage;