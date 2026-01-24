import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, CheckCircle, AlertTriangle, Scale, BookOpen, Gavel } from "lucide-react";

const TermsOfServicePage = () => {
  const sections = [
    {
      icon: CheckCircle,
      title: "Acceptance of Terms",
      content: [
        "By accessing or using the UISU Archive, you agree to be bound by these Terms of Service",
        "If you do not agree to these terms, you may not access or use our services",
        "We reserve the right to modify these terms at any time with notice to users",
        "Continued use after changes constitutes acceptance of the modified terms"
      ]
    },
    {
      icon: BookOpen,
      title: "Use of Services",
      content: [
        "You must be a member of the University of Ibadan community or have legitimate interest in union history",
        "You agree to use the services only for lawful purposes",
        "You are responsible for maintaining the confidentiality of your account credentials",
        "You must not attempt to gain unauthorized access to any part of the service"
      ]
    },
    {
      icon: FileText,
      title: "Content Guidelines",
      content: [
        "You retain ownership of content you submit, but grant us license to display and distribute it",
        "Content must be accurate, respectful, and relevant to the UISU Archive mission",
        "Submissions must not infringe on any third-party intellectual property rights",
        "We reserve the right to remove content that violates these guidelines",
        "Historical documents must be submitted in good faith with proper attribution"
      ]
    },
    {
      icon: AlertTriangle,
      title: "Prohibited Activities",
      content: [
        "Uploading malicious content, viruses, or harmful code",
        "Impersonating other users or misrepresenting your identity",
        "Harassing, threatening, or defaming other users",
        "Attempting to compromise the security or functionality of the platform",
        "Using the service for commercial purposes without authorization",
        "Scraping or automated data collection without permission"
      ]
    },
    {
      icon: Scale,
      title: "Intellectual Property",
      content: [
        "The UISU Archive name, logo, and original content are protected by intellectual property laws",
        "Historical documents in the archive may have various ownership and usage rights",
        "Users must respect copyright and attribution requirements for all materials",
        "Fair use principles apply to educational and research purposes"
      ]
    },
    {
      icon: Gavel,
      title: "Limitation of Liability",
      content: [
        "The service is provided 'as is' without warranties of any kind",
        "We are not liable for any indirect, incidental, or consequential damages",
        "We do not guarantee the accuracy or completeness of historical records",
        "Users are responsible for verifying information for official purposes",
        "Our total liability is limited to the amount you paid for the service (if any)"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Terms of Service | UISU Archive"
        description="Read the terms and conditions for using UISU Archive. Understand your rights and responsibilities as a user of our platform."
        url="https://uisu.lovable.app/terms-of-service"
      />
      
      <main className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Back Button */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-ui-blue transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-ui-blue/10 rounded-full">
                <FileText className="w-6 h-6 text-ui-blue" />
              </div>
              <span className="text-xs font-bold text-nobel-gold uppercase tracking-widest">Legal</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4">Terms of Service</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              These terms govern your use of the UISU Archive platform. Please read them carefully before using our services.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Effective date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </motion.header>

          {/* Content Sections */}
          <div className="space-y-10">
            {sections.map((section, index) => (
              <motion.section
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card border border-border p-6 md:p-8"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-2 bg-nobel-gold/10 rounded-lg shrink-0">
                    <section.icon className="w-5 h-5 text-nobel-gold" />
                  </div>
                  <h2 className="font-serif text-xl md:text-2xl text-foreground">{section.title}</h2>
                </div>
                <ul className="space-y-3 ml-14">
                  {section.content.map((item, i) => (
                    <li key={i} className="text-muted-foreground leading-relaxed flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-ui-blue rounded-full mt-2 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.section>
            ))}
          </div>

          {/* Agreement Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-12 p-6 bg-ui-blue/5 border border-ui-blue/20"
          >
            <h3 className="font-serif text-lg text-foreground mb-3">Agreement</h3>
            <p className="text-muted-foreground mb-4">
              By creating an account or using the UISU Archive, you acknowledge that you have read, understood, 
              and agree to be bound by these Terms of Service and our Privacy Policy.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/privacy-policy" 
                className="text-sm font-medium text-ui-blue hover:text-nobel-gold transition-colors"
              >
                View Privacy Policy →
              </Link>
              <Link 
                to="/#contact" 
                className="text-sm font-medium text-ui-blue hover:text-nobel-gold transition-colors"
              >
                Contact Us →
              </Link>
            </div>
          </motion.div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-muted-foreground">
              Questions about these terms? Reach out through our{" "}
              <Link to="/#contact" className="text-ui-blue hover:underline">contact form</Link>.
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfServicePage;
