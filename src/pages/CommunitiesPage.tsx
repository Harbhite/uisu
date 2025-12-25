import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CommunitiesPage as CommunitiesContent, ClubDetailPage } from "@/components/Communities";

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
    <CommunitiesContent 
      onBack={() => navigate("/")} 
      onClubSelect={(id) => setSelectedClubId(id)} 
    />
  );
};

export default CommunitiesPage;
