import React from 'react';
import { Twitter, Facebook, Linkedin, Link, Share2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SocialShareProps {
  title: string;
  url?: string;
  summary?: string;
  className?: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({ 
  title, 
  url = typeof window !== 'undefined' ? window.location.href : '',
  summary = '',
  className = ''
}) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedSummary = encodeURIComponent(summary);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedSummary}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
        <Share2 size={14} />
        Share
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleShare('twitter')}
          className="w-9 h-9 p-0 hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2]"
          title="Share on Twitter"
        >
          <Twitter size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleShare('facebook')}
          className="w-9 h-9 p-0 hover:bg-[#1877F2]/10 hover:text-[#1877F2]"
          title="Share on Facebook"
        >
          <Facebook size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleShare('linkedin')}
          className="w-9 h-9 p-0 hover:bg-[#0A66C2]/10 hover:text-[#0A66C2]"
          title="Share on LinkedIn"
        >
          <Linkedin size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleShare('whatsapp')}
          className="w-9 h-9 p-0 hover:bg-[#25D366]/10 hover:text-[#25D366]"
          title="Share on WhatsApp"
        >
          <MessageCircle size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="w-9 h-9 p-0 hover:bg-accent/10 hover:text-accent"
          title="Copy link"
        >
          <Link size={16} />
        </Button>
      </div>
    </div>
  );
};

export default SocialShare;
