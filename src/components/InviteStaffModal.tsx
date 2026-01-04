import { useState } from "react";
import { motion } from "framer-motion";
import { X, Copy, Check, Mail, Loader2, Link as LinkIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");

interface InviteStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string | undefined;
}

const InviteStaffModal = ({ isOpen, onClose, currentUserId }: InviteStaffModalProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "moderator">("moderator");
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmail = () => {
    try {
      emailSchema.parse(email);
      setEmailError(null);
      return true;
    } catch (e) {
      if (e instanceof z.ZodError) {
        setEmailError(e.errors[0].message);
      }
      return false;
    }
  };

  const generateInvite = async () => {
    if (!validateEmail()) return;
    
    setLoading(true);
    try {
      // Generate a signup link
      const signupLink = `${window.location.origin}/auth?invited=true&role=${role}`;
      setInviteLink(signupLink);
      
      // Log the invite to audit
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await supabase.from("audit_logs" as any).insert({
        user_id: currentUserId,
        action: "staff_invite",
        table_name: "user_roles",
        record_id: null,
        old_data: null,
        new_data: { 
          invited_email: email, 
          invited_role: role,
          invite_type: "signup_link"
        },
      });

      // Send email notification
      try {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", currentUserId)
          .maybeSingle();
        
        await supabase.functions.invoke('send-staff-notification', {
          body: {
            type: 'invite',
            email: email,
            role: role,
            invitedBy: profileData?.full_name || 'An administrator',
            inviteLink: signupLink,
          }
        });
        
        toast({
          title: "Invite Sent",
          description: `Invite link generated and email sent to ${email}.`,
        });
      } catch (emailError) {
        console.error("Email notification failed:", emailError);
        toast({
          title: "Invite Link Generated",
          description: `Share this link with ${email}. Email notification could not be sent.`,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate invite";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!inviteLink) return;
    
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Invite link copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Copy failed",
        description: "Please select and copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setEmail("");
    setRole("moderator");
    setInviteLink(null);
    setCopied(false);
    setEmailError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card border border-border max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-nobel-gold" />
            <h2 className="font-serif text-2xl text-foreground">Invite Staff</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!inviteLink ? (
            <>
              <p className="text-sm text-muted-foreground">
                Generate a secure invite link to add new staff members. They'll be able to sign up and get the assigned role automatically.
              </p>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(null);
                  }}
                  placeholder="colleague@university.edu"
                  className={`w-full px-4 py-3 bg-background border ${emailError ? 'border-destructive' : 'border-border'} focus:border-nobel-gold focus:outline-none transition-colors`}
                />
                {emailError && (
                  <p className="text-destructive text-sm mt-1">{emailError}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "admin" | "moderator")}
                  className="w-full px-4 py-3 bg-background border border-border focus:border-nobel-gold focus:outline-none transition-colors"
                >
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    <strong>Moderator:</strong> Can manage content but not staff.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <strong>Admin:</strong> Full access including staff management.
                  </p>
                </div>
              </div>

              <button
                onClick={generateInvite}
                disabled={loading || !email.trim()}
                className="w-full py-3 bg-ui-blue text-white text-xs font-bold uppercase tracking-widest hover:bg-nobel-gold hover:text-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-4 h-4" />
                    Generate Invite Link
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-serif text-xl text-foreground mb-2">Invite Created!</h3>
                <p className="text-sm text-muted-foreground">
                  Share this link with <strong>{email}</strong> to invite them as <strong>{role}</strong>.
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded border border-border">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inviteLink}
                    readOnly
                    className="flex-1 bg-transparent text-sm text-foreground font-mono truncate focus:outline-none"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="p-2 text-muted-foreground hover:text-nobel-gold transition-colors shrink-0"
                  >
                    {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                  </button>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded">
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  <strong>Note:</strong> After the user signs up, you'll need to manually assign their role in the Staff tab. This invite has been logged for audit purposes.
                </p>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3 border border-border text-foreground text-xs font-bold uppercase tracking-widest hover:bg-muted transition-colors"
              >
                Done
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InviteStaffModal;
