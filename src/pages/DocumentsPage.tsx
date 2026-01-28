import { useNavigate } from "react-router-dom";
import { DocumentLibrary as DocumentLibraryContent } from "@/components/DocumentLibrary";
import { SEO } from "@/components/SEO";

const DocumentsPage = () => {
  const navigate = useNavigate();
  
  return (
    <>
      <SEO
        title="Documents Library | UISU Constitution & Historical Records"
        description="Access the complete archive of UI Students' Union documents: constitutions, manifestos, election results, speeches, and policy papers from 1948 to present. Download PDFs free."
        image="/og/pages-screenshot/documents.png"
      />
      <DocumentLibraryContent onBack={() => navigate("/")} />
    </>
  );
};

export default DocumentsPage;
