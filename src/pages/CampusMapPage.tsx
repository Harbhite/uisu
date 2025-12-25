import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { CampusMap } from "@/components/CampusMap";

const CampusMapPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Home</span>
            </Link>
            <div className="flex items-center gap-3">
              <img src="/uisu-logo.png" alt="UISU Logo" className="h-8 w-8 object-contain" />
              <span className="font-display text-lg font-bold text-primary">UISU Archive</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Campus Map
            </h1>
            <p className="text-xl text-muted-foreground">
              Explore the halls of residence and their rich histories
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <CampusMap />
        </div>
      </section>
    </div>
  );
};

export default CampusMapPage;
