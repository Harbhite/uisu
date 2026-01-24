import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Eye, Database, Lock, Users, Mail } from "lucide-react";

const PrivacyPolicyPage = () => {
  const sections = [
    {
      icon: Database,
      title: "Information We Collect",
      content: [
        "Personal information you provide when creating an account (name, email, student information)",
        "Usage data including pages visited, features used, and interaction patterns",
        "Device information such as browser type, operating system, and IP address",
        "Content you submit including documents, articles, comments, and profile information"
      ]
    },
    {
      icon: Eye,
      title: "How We Use Your Information",
      content: [
        "To provide and maintain the UISU Archive services",
        "To communicate with you about updates, announcements, and newsletters",
        "To improve our services and develop new features",
        "To ensure the security and integrity of our platform",
        "To comply with legal obligations"
      ]
    },
    {
      icon: Lock,
      title: "Data Security",
      content: [
        "We use industry-standard encryption to protect your data in transit and at rest",
        "Access to personal information is restricted to authorized personnel only",
        "Regular security audits and updates are performed to maintain protection",
        "We implement secure authentication practices for all user accounts"
      ]
    },
    {
      icon: Users,
      title: "Information Sharing",
      content: [
        "We do not sell or rent your personal information to third parties",
        "Public content you post (articles, comments) may be visible to other users",
        "We may share anonymized, aggregated data for research or analytical purposes",
        "We may disclose information when required by law or to protect our rights"
      ]
    },
    {
      icon: Shield,
      title: "Your Rights",
      content: [
        "Access and request a copy of your personal data",
        "Request correction of inaccurate information",
        "Request deletion of your account and associated data",
        "Opt out of newsletter subscriptions at any time",
        "Withdraw consent for data processing where applicable"
      ]
    },
    {
      icon: Mail,
      title: "Contact Us",
      content: [
        "For any privacy-related questions or concerns, please contact us through the contact form on our homepage",
        "We will respond to your inquiries within a reasonable timeframe",
        "For data deletion requests, please allow up to 30 days for processing"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Privacy Policy | UISU Archive"
        description="Learn how UISU Archive collects, uses, and protects your personal information. Our commitment to your privacy and data security."
        url="https://uisu.lovable.app/privacy-policy"
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
                <Shield className="w-6 h-6 text-ui-blue" />
              </div>
              <span className="text-xs font-bold text-nobel-gold uppercase tracking-widest">Legal</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Your privacy is important to us. This policy explains how we collect, use, and protect your personal information when you use the UISU Archive.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
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

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-12 p-6 bg-muted border border-border text-center"
          >
            <p className="text-muted-foreground">
              By using UISU Archive, you agree to the terms outlined in this Privacy Policy. 
              We may update this policy from time to time, and will notify you of any significant changes.
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
