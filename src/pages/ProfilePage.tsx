import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  BookOpen, 
  Eye, 
  Clock,
  Edit3,
  Save,
  X,
  Twitter,
  Linkedin,
  Instagram,
  Globe
} from 'lucide-react';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { SEO } from '@/components/SEO';
import { Json } from '@/integrations/supabase/types';

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  socials: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    website?: string;
  } | null;
  created_at: string | null;
}

interface InkPiece {
  id: string;
  title: string;
  type: string;
  summary: string | null;
  cover_image: string | null;
  view_count: number | null;
  created_at: string | null;
  tags: string[] | null;
  content: Json;
}

const calculateReadingTime = (content: Json): number => {
  if (!content || typeof content !== 'object') return 1;
  const blocks = (content as { blocks?: { data?: { text?: string } }[] }).blocks || [];
  const text = blocks.map((block) => block?.data?.text || '').join(' ');
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
};

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAdminCheck();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pieces, setPieces] = useState<InkPiece[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    bio: '',
    twitter: '',
    linkedin: '',
    instagram: '',
    website: ''
  });
  const [saving, setSaving] = useState(false);

  const isOwnProfile = user?.id === id;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;

      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (profileError) throw profileError;
        
        if (profileData) {
          const socials = profileData.socials as Profile['socials'];
          setProfile({
            ...profileData,
            socials
          });
          setEditForm({
            full_name: profileData.full_name || '',
            bio: (profileData as { bio?: string }).bio || '',
            twitter: socials?.twitter || '',
            linkedin: socials?.linkedin || '',
            instagram: socials?.instagram || '',
            website: socials?.website || ''
          });
        }

        // Fetch published pieces by this user
        const { data: piecesData, error: piecesError } = await supabase
          .from('ink_pieces')
          .select('id, title, type, summary, cover_image, view_count, created_at, tags, content')
          .eq('user_id', id)
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        if (piecesError) throw piecesError;
        setPieces(piecesData || []);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const handleSave = async () => {
    if (!user || !isOwnProfile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name,
          bio: editForm.bio,
          socials: {
            twitter: editForm.twitter,
            linkedin: editForm.linkedin,
            instagram: editForm.instagram,
            website: editForm.website
          }
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? {
        ...prev,
        full_name: editForm.full_name,
        bio: editForm.bio,
        socials: {
          twitter: editForm.twitter,
          linkedin: editForm.linkedin,
          instagram: editForm.instagram,
          website: editForm.website
        }
      } : null);

      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-none animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
          <p className="text-muted-foreground mb-6">This user doesn't exist or their profile is private.</p>
          <Link to="/">
            <Button variant="outline" className="rounded-none">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const initials = profile.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <>
      <SEO
        title={`${profile.full_name || 'User'} | UISU`}
        description={profile.bio || `View ${profile.full_name}'s profile and published pieces`}
      />
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Link>
            {isOwnProfile && !isEditing && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-none"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Profile Card */}
          <Card className="rounded-none border-border p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <Avatar className="w-24 h-24 md:w-32 md:h-32 rounded-none border-2 border-border">
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || 'User'} />
                <AvatarFallback className="rounded-none bg-primary/10 text-primary text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1 block">Name</label>
                      <Input
                        value={editForm.full_name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                        placeholder="Your name"
                        className="rounded-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1 block">Bio</label>
                      <Textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself..."
                        className="rounded-none min-h-[100px]"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1 block">Twitter</label>
                        <Input
                          value={editForm.twitter}
                          onChange={(e) => setEditForm(prev => ({ ...prev, twitter: e.target.value }))}
                          placeholder="@username"
                          className="rounded-none"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1 block">LinkedIn</label>
                        <Input
                          value={editForm.linkedin}
                          onChange={(e) => setEditForm(prev => ({ ...prev, linkedin: e.target.value }))}
                          placeholder="linkedin.com/in/username"
                          className="rounded-none"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1 block">Instagram</label>
                        <Input
                          value={editForm.instagram}
                          onChange={(e) => setEditForm(prev => ({ ...prev, instagram: e.target.value }))}
                          placeholder="@username"
                          className="rounded-none"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1 block">Website</label>
                        <Input
                          value={editForm.website}
                          onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                          placeholder="https://yourwebsite.com"
                          className="rounded-none"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-none"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="rounded-none"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">{profile.full_name || 'Anonymous User'}</h1>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                      {profile.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          <span>{profile.email}</span>
                        </div>
                      )}
                      {profile.created_at && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{pieces.length} published piece{pieces.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    {profile.bio && (
                      <p className="text-muted-foreground mb-4 max-w-2xl">{profile.bio}</p>
                    )}

                    {/* Social Links */}
                    {profile.socials && Object.values(profile.socials).some(Boolean) && (
                      <div className="flex gap-3">
                        {profile.socials.twitter && (
                          <a
                            href={profile.socials.twitter.startsWith('http') ? profile.socials.twitter : `https://twitter.com/${profile.socials.twitter.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 border border-border hover:bg-accent transition-colors"
                          >
                            <Twitter className="w-4 h-4" />
                          </a>
                        )}
                        {profile.socials.linkedin && (
                          <a
                            href={profile.socials.linkedin.startsWith('http') ? profile.socials.linkedin : `https://linkedin.com/in/${profile.socials.linkedin}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 border border-border hover:bg-accent transition-colors"
                          >
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}
                        {profile.socials.instagram && (
                          <a
                            href={profile.socials.instagram.startsWith('http') ? profile.socials.instagram : `https://instagram.com/${profile.socials.instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 border border-border hover:bg-accent transition-colors"
                          >
                            <Instagram className="w-4 h-4" />
                          </a>
                        )}
                        {profile.socials.website && (
                          <a
                            href={profile.socials.website.startsWith('http') ? profile.socials.website : `https://${profile.socials.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 border border-border hover:bg-accent transition-colors"
                          >
                            <Globe className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* Published Pieces */}
          <section>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Published Pieces
            </h2>

            {pieces.length === 0 ? (
              <Card className="rounded-none border-border p-8 text-center">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No published pieces yet.</p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pieces.map((piece) => (
                  <Link key={piece.id} to={`/inks-vault/piece/${piece.id}`}>
                    <Card className="rounded-none border-border overflow-hidden hover:border-primary/50 transition-colors h-full flex flex-col">
                      {piece.cover_image && (
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={piece.cover_image}
                            alt={piece.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="rounded-none text-xs">
                            {piece.type}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{calculateReadingTime(piece.content)} min</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Eye className="w-3 h-3" />
                            <span>{piece.view_count || 0}</span>
                          </div>
                        </div>
                        <h3 className="font-semibold mb-2 line-clamp-2">{piece.title}</h3>
                        {piece.summary && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">
                            {piece.summary}
                          </p>
                        )}
                        {piece.tags && piece.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-auto">
                            {piece.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="rounded-none text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-3">
                          {piece.created_at && new Date(piece.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  );
};

export default ProfilePage;
