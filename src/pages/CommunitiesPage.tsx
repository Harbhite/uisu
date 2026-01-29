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
        title="Student Clubs & Societies | UI Campus Communities"
        description="Explore 50+ student organizations at University of Ibadan: departmental associations, religious groups, press clubs, and cultural societies. Find your community and join student life."
        image="/og/pages-screenshot/communities.png"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Communities', url: '/communities' }
        ]}
      />
      <CommunitiesContent
        onBack={() => navigate("/")}
        onClubSelect={(id) => setSelectedClubId(id)}
      />
    </>
  );
};

export default CommunitiesPage;
