import { useNavigate } from "react-router-dom";
import { DocumentLibrary as DocumentLibraryContent } from "@/components/DocumentLibrary";
import { SEO } from "@/components/SEO";
<Helmet>
  <title>Documents — UISU</title>

  <meta property="og:title" content="UISU Documents & Resources" />
  <meta property="og:description" content="Download UISU documents, forms, reports, and important resources."
  />
  <meta property="og:image" content="https://uisu.space/screenshot/documents.png" />
  <meta property="og:url" content="https://uisu.space/documents" />
  <meta property="og:type" content="website" />

  <!-- Optional but helpful -->
  <meta name="twitter:card" content="summary_large_image" />
</Helmet>

const DocumentsPage = () => {
  const navigate = useNavigate();
  
  return (
    <>
      <SEO
        title="Documents Library"
        description="Access constitutions, manifestos, speeches, and historical records of the University of Ibadan Students' Union."
        image="/screenshots/documents.png"
      />
      <DocumentLibraryContent onBack={() => navigate("/")} />
    </>
  );
};

export default DocumentsPage;
