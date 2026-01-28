import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Star, Mail, Lock, User, ArrowLeft, Eye, EyeOff, CheckCircle, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { SEO } from "@/components/SEO";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [mode, setMode] = useState<"login" | "signup" | "forgot" | "reset" | "forgot-success" | "reset-success">("login");
  const [resetEmail, setResetEmail] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  // Check for invite params
  const isInvited = searchParams.get('invited') === 'true';
  const invitedRole = searchParams.get('role');

  const isLogin = mode === "login";

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // When user clicks the recovery link, Supabase emits PASSWORD_RECOVERY
      if (event === "PASSWORD_RECOVERY") {
        setMode("reset");
        return;
      }

      // For normal login/signup, go home
      if (session && mode !== "reset") {
        navigate("/");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && mode !== "reset") {
        navigate("/");
      }
    });

    // If user landed on /auth with a recovery token, show reset UI.
    // Supabase puts tokens in the URL hash; the auth client will parse it and emit PASSWORD_RECOVERY.
    if (window.location.hash.includes("type=recovery")) {
      setMode("reset");
    }

    return () => subscription.unsubscribe();
  }, [navigate, mode]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    // Email always required
    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }

    // Password required for login/signup/reset
    if (mode === "login" || mode === "signup" || mode === "reset") {
      try {
        passwordSchema.parse(password);
      } catch (e) {
        if (e instanceof z.ZodError) {
          newErrors.password = e.errors[0].message;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Login Failed",
              description: "Invalid email or password. Please try again.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in.",
          });
        }
      }

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Account Exists",
              description: "This email is already registered. Try logging in instead.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Account Created!",
            description: "Welcome to UISU SPACE.",
          });
        }
      }

      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });

        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          setResetEmail(email);
          setMode("forgot-success");
        }
      }

      if (mode === "reset") {
        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          setPassword("");
          setMode("reset-success");
        }
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-32 pb-16">
      <SEO
        title="Sign In"
        description="Sign in or create an account to access UISU SPACE features, contribute to the Inks Vault, and stay connected with the student union."
        image="/og/og-auth.png"
      />
      <div className="container mx-auto px-6">
        <button 
          onClick={() => navigate("/")}
          className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] hover:text-nobel-gold transition-colors mb-12"
        >
          <div className="p-2 rounded-full border border-border group-hover:border-nobel-gold transition-colors">
            <ArrowLeft size={14} />
          </div>
          <span>Back to Home</span>
        </button>

        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Star className="text-nobel-gold w-6 h-6" fill="currentColor" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground">
              {mode === "login" && "Welcome Back"}
              {mode === "signup" && (isInvited ? "Staff Invitation" : "Join Us")}
              {mode === "forgot" && "Reset Password"}
              {mode === "reset" && "Choose New Password"}
              {mode === "forgot-success" && "Check Your Email"}
              {mode === "reset-success" && "Password Updated"}
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-serif text-ui-blue leading-[0.9] mb-8">
            {mode === "login" && (
              <>Sign <br /> <span className="italic text-muted-foreground">In</span></>
            )}
            {mode === "signup" && (
              <>Create <br /> <span className="italic text-muted-foreground">Account</span></>
            )}
            {mode === "forgot" && (
              <>Forgot <br /> <span className="italic text-muted-foreground">Password</span></>
            )}
            {mode === "reset" && (
              <>New <br /> <span className="italic text-muted-foreground">Password</span></>
            )}
            {mode === "forgot-success" && (
              <>Email <br /> <span className="italic text-muted-foreground">Sent</span></>
            )}
            {mode === "reset-success" && (
              <>Success <br /> <span className="italic text-muted-foreground">!</span></>
            )}
          </h1>

          {/* Success screens */}
          {mode === "forgot-success" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border p-8"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Send className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-serif text-2xl text-foreground mb-4">Check Your Inbox</h3>
                <p className="text-muted-foreground mb-6">
                  We've sent a password reset link to:
                </p>
                <p className="text-lg font-medium text-foreground bg-muted px-4 py-2 rounded mb-6 break-all">
                  {resetEmail}
                </p>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <p>Click the link in the email to reset your password.</p>
                  <p className="text-xs">
                    Didn't receive the email? Check your spam folder or{" "}
                    <button
                      onClick={() => setMode("forgot")}
                      className="text-nobel-gold hover:underline"
                    >
                      try again
                    </button>
                    .
                  </p>
                </div>
                <button
                  onClick={() => setMode("login")}
                  className="mt-8 w-full py-4 bg-ui-blue text-white text-xs font-bold uppercase tracking-widest hover:bg-nobel-gold hover:text-foreground transition-all"
                >
                  Return to Sign In
                </button>
              </div>
            </motion.div>
          )}

          {mode === "reset-success" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border p-8"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-serif text-2xl text-foreground mb-4">Password Updated!</h3>
                <p className="text-muted-foreground mb-6">
                  Your password has been successfully changed. You can now sign in with your new password.
                </p>
                <button
                  onClick={() => setMode("login")}
                  className="w-full py-4 bg-ui-blue text-white text-xs font-bold uppercase tracking-widest hover:bg-nobel-gold hover:text-foreground transition-all"
                >
                  Sign In Now
                </button>
              </div>
            </motion.div>
          )}

          {/* Regular form */}
          {mode !== "forgot-success" && mode !== "reset-success" && (

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="bg-card border border-border p-8 space-y-6"
          >
            {(mode === "signup") && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full pl-12 pr-4 py-4 bg-background border border-border focus:border-nobel-gold focus:outline-none font-serif text-lg transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full pl-12 pr-4 py-4 bg-background border ${errors.email ? 'border-destructive' : 'border-border'} focus:border-nobel-gold focus:outline-none font-serif text-lg transition-colors`}
                  required
                />
              </div>
              {errors.email && (
                <p className="text-destructive text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {mode !== "forgot" && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-12 py-4 bg-background border ${errors.password ? 'border-destructive' : 'border-border'} focus:border-nobel-gold focus:outline-none font-serif text-lg transition-colors`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-destructive text-sm mt-1">{errors.password}</p>
                )}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-ui-blue text-white text-xs font-bold uppercase tracking-widest hover:bg-nobel-gold hover:text-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Processing..."
                : mode === "login"
                  ? "Sign In"
                  : mode === "signup"
                    ? "Create Account"
                    : mode === "forgot"
                      ? "Send Reset Link"
                      : "Update Password"}
            </motion.button>

            <div className="pt-4 border-t border-border space-y-3">
              {mode === "login" && (
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setErrors({});
                      setPassword("");
                    }}
                    className="text-xs text-muted-foreground hover:text-nobel-gold transition-colors"
                  >
                    Forgot password?
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setErrors({});
                    }}
                    className="text-xs text-muted-foreground hover:text-nobel-gold transition-colors font-light"
                  >
                    Don&apos;t have an account? <span className="font-bold text-ui-blue">Sign Up</span>
                  </button>
                </div>
              )}

              {mode === "signup" && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setErrors({});
                    }}
                    className="text-muted-foreground hover:text-nobel-gold transition-colors font-light"
                  >
                    Already have an account? <span className="font-bold text-ui-blue">Sign In</span>
                  </button>
                </div>
              )}

              {mode === "forgot" && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setErrors({});
                    }}
                    className="text-muted-foreground hover:text-nobel-gold transition-colors font-light"
                  >
                    Back to <span className="font-bold text-ui-blue">Sign In</span>
                  </button>
                </div>
              )}

              {mode === "reset" && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setErrors({});
                    }}
                    className="text-muted-foreground hover:text-nobel-gold transition-colors font-light"
                  >
                    Back to <span className="font-bold text-ui-blue">Sign In</span>
                  </button>
                </div>
              )}
            </div>
          </motion.form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
