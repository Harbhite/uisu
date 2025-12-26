import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Star, Mail, Lock, User, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const AuthPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<"login" | "signup" | "forgot" | "reset">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

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
            description: "Welcome to UISU Archive.",
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
          toast({
            title: "Check your email",
            description: "We sent a password reset link to your email address.",
          });
          setMode("login");
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
          toast({
            title: "Password updated",
            description: "You can now sign in with your new password.",
          });
          setPassword("");
          setMode("login");
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
              {mode === "signup" && "Join Us"}
              {mode === "forgot" && "Reset Password"}
              {mode === "reset" && "Choose New Password"}
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
          </h1>

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
                <p className="text-xs text-muted-foreground text-center">
                  Enter a new password to complete your reset.
                </p>
              )}
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;