import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CommunitiesPage as CommunitiesContent, ClubDetailPage } from "@/components/Communities";
import { SEO } from "@/components/SEO";
import { Helmet } from "react-helmet";
<Helmet>
  <title>Communities — UISU</title>

  <meta property="og:title" content="UISU Communities" />
  <meta
    property="og:description"
    content="Discover student communities, clubs, and initiatives across University of Ibadan."
  />
  <meta property="og:image" content="https://uisu.space/screenshot/communities.png" />
  <meta property="og:url" content="https://uisu.space/communities" />
  <meta property="og:type" content="website" />

  <meta name="twitter:card" content="summary_large_image" />
</Helmet>

const CommunitiesPage = () => {
  const navigate = useNavigate();
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  
  if (selectedClubId) {
    return (
      <>
        {/* Note: ClubDetailPage handles its own dynamic SEO inside the component if needed,
            but for now we can wrap it or let it be.
            Ideally, ClubDetailPage should have SEO.
            For this plan, I'll add a generic one here or assume ClubDetailPage needs update.
            Let's stick to the page wrapper for now.
        */}
        <ClubDetailPage
          clubId={selectedClubId}
          onBack={() => setSelectedClubId(null)}
        />
      </>
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
