import { useNavigate } from "react-router-dom";
import { DocumentLibrary as DocumentLibraryContent } from "@/components/DocumentLibrary";
import { SEO } from "@/components/SEO";

const DocumentsPage = () => {
  const navigate = useNavigate();
  
  return (
    <>
      <SEO
        title="Documents Library"
        description="Access constitutions, manifestos, speeches, and historical records of the University of Ibadan Students' Union."
      />
      <DocumentLibraryContent onBack={() => navigate("/")} />
    </>
  );
};

export default DocumentsPage;
