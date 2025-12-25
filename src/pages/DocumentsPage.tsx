import { useNavigate } from "react-router-dom";
import { DocumentLibrary as DocumentLibraryContent } from "@/components/DocumentLibrary";

const DocumentsPage = () => {
  const navigate = useNavigate();
  
  return <DocumentLibraryContent onBack={() => navigate("/")} />;
};

export default DocumentsPage;
