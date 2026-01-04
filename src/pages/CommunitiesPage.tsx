import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CommunitiesPage as CommunitiesContent, ClubDetailPage } from "@/components/Communities";
import { SEO } from "@/components/SEO";

const CommunitiesPage = () => {
  const navigate = useNavigate();
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  
  if (selectedClubId) {
    return (
      <ClubDetailPage
        clubId={selectedClubId}
        onBack={() => setSelectedClubId(null)}
      />
    );
  }
  
  return (
    <>
      <SEO
        title="Communities"
        description="Discover the vibrant student organizations, clubs, and societies on campus."
        image="/screenshots/communities.png"
      />
      <CommunitiesContent
        onBack={() => navigate("/")}
        onClubSelect={(id) => setSelectedClubId(id)}
      />
    </>
  );
};

export default CommunitiesPage;
