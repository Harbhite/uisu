import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';

const UnsubscribePage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const [status, setStatus] = useState<'loading' | 'confirming' | 'success' | 'error' | 'already'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!email) {
      setStatus('error');
      setErrorMessage('No email address provided.');
      return;
    }

    // Check if email exists and is active
    const checkSubscription = async () => {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('id, is_active')
        .eq('email', email.toLowerCase())
        .single();

      if (error || !data) {
        setStatus('error');
        setErrorMessage('Email address not found in our newsletter list.');
        return;
      }

      if (!data.is_active) {
        setStatus('already');
        return;
      }

      setStatus('confirming');
    };

    checkSubscription();
  }, [email]);

  const handleUnsubscribe = async () => {
    if (!email) return;

    setStatus('loading');

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({ is_active: false })
        .eq('email', email.toLowerCase());

      if (error) {
        throw error;
      }

      setStatus('success');
    } catch (error) {
      console.error('Unsubscribe error:', error);
      setStatus('error');
      setErrorMessage('Failed to unsubscribe. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <SEO 
        title="Unsubscribe — UISU SPACE"
        description="Unsubscribe from the UISU SPACE newsletter"
      />
      
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <img 
              src="/newsletter-logo.png" 
              alt="UISU" 
              className="w-20 h-20 mx-auto opacity-80"
            />
          </Link>
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-medium">
            UISU SPACE Newsletter
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-card border border-border rounded-lg shadow-lg p-8">
          {status === 'loading' && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Processing...</p>
            </div>
          )}

          {status === 'confirming' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-foreground mb-3">
                Unsubscribe from Newsletter?
              </h1>
              <p className="text-muted-foreground mb-2">
                You're about to unsubscribe:
              </p>
              <p className="text-foreground font-medium mb-6 bg-muted px-4 py-2 rounded-md">
                {email}
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                You will no longer receive updates about UISU SPACE, including announcements, 
                historical discoveries, and community news.
              </p>
              
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleUnsubscribe}
                  variant="destructive"
                  className="w-full"
                >
                  Yes, Unsubscribe Me
                </Button>
                <Button 
                  asChild
                  variant="outline"
                  className="w-full"
                >
                  <Link to="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    No, Keep Me Subscribed
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-foreground mb-3">
                Successfully Unsubscribed
              </h1>
              <p className="text-muted-foreground mb-6">
                <span className="font-medium text-foreground">{email}</span> has been removed from our newsletter list.
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                We're sorry to see you go. You can always resubscribe from our homepage if you change your mind.
              </p>
              
              <div className="p-4 bg-muted rounded-lg mb-6">
                <p className="text-sm text-muted-foreground italic font-serif">
                  "First and Best"
                </p>
              </div>
              
              <Button asChild variant="outline" className="w-full">
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Return to Archive
                </Link>
              </Button>
            </div>
          )}

          {status === 'already' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-foreground mb-3">
                Already Unsubscribed
              </h1>
              <p className="text-muted-foreground mb-6">
                <span className="font-medium text-foreground">{email}</span> is not currently subscribed to our newsletter.
              </p>
              
              <Button asChild variant="outline" className="w-full">
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Return to Archive
                </Link>
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-foreground mb-3">
                Unable to Unsubscribe
              </h1>
              <p className="text-muted-foreground mb-6">
                {errorMessage}
              </p>
              
              <Button asChild variant="outline" className="w-full">
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Return to Archive
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground">
            UISU SPACE • University of Ibadan Students' Union
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnsubscribePage;
