import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
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
  Globe,
  GraduationCap,
  Building2,
  Home,
  Users,
  Layers,
  ExternalLink,
  Bell
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
  faculty: string | null;
  department: string | null;
  hall_of_residence: string | null;
  level: string | null;
  clubs: string[] | null;
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
    faculty: '',
    department: '',
    hall_of_residence: '',
    level: '',
    clubs: '',
    twitter: '',
    linkedin: '',
    instagram: '',
    website: '',
    email_submission_approved: true,
    email_submission_rejected: true
  });
  const [saving, setSaving] = useState(false);

  const isOwnProfile = user?.id === id;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;

      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (profileError) throw profileError;
        
        if (profileData) {
          const socials = profileData.socials as Profile['socials'];
          const typedProfile = profileData as unknown as Profile;
          setProfile({
            ...typedProfile,
            socials
          });
          const emailNotifications = (profileData as any).email_notifications || { submission_approved: true, submission_rejected: true };
          setEditForm({
            full_name: typedProfile.full_name || '',
            bio: typedProfile.bio || '',
            faculty: typedProfile.faculty || '',
            department: typedProfile.department || '',
            hall_of_residence: typedProfile.hall_of_residence || '',
            level: typedProfile.level || '',
            clubs: typedProfile.clubs?.join(', ') || '',
            twitter: socials?.twitter || '',
            linkedin: socials?.linkedin || '',
            instagram: socials?.instagram || '',
            website: socials?.website || '',
            email_submission_approved: emailNotifications.submission_approved ?? true,
            email_submission_rejected: emailNotifications.submission_rejected ?? true
          });
        }

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
      const clubsArray = editForm.clubs
        .split(',')
        .map(c => c.trim())
        .filter(Boolean);

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name,
          bio: editForm.bio,
          faculty: editForm.faculty,
          department: editForm.department,
          hall_of_residence: editForm.hall_of_residence,
          level: editForm.level,
          clubs: clubsArray,
          socials: {
            twitter: editForm.twitter,
            linkedin: editForm.linkedin,
            instagram: editForm.instagram,
            website: editForm.website
          },
          email_notifications: {
            submission_approved: editForm.email_submission_approved,
            submission_rejected: editForm.email_submission_rejected
          }
        } as any)
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? {
        ...prev,
        full_name: editForm.full_name,
        bio: editForm.bio,
        faculty: editForm.faculty,
        department: editForm.department,
        hall_of_residence: editForm.hall_of_residence,
        level: editForm.level,
        clubs: clubsArray,
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

  const totalViews = pieces.reduce((sum, p) => sum + (p.view_count || 0), 0);
  const totalReadTime = pieces.reduce((sum, p) => sum + calculateReadingTime(p.content), 0);

  return (
    <>
      <SEO
        title={`${profile.full_name || 'User'} | UISU`}
        description={profile.bio || `View ${profile.full_name}'s profile and published pieces`}
        image={profile.avatar_url || '/screenshots/profile.png'}
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
          <div className="max-w-4xl mx-auto">
            {/* Main Profile Card - Inspired by reference */}
            <Card className="rounded-none border-border bg-gradient-to-br from-primary/5 via-card to-accent/5 overflow-hidden mb-8">
              {/* Top Section with gradient overlay */}
              <div className="relative bg-gradient-to-r from-primary/10 to-accent/10 p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  {/* Avatar */}
                  <Avatar className="w-20 h-20 md:w-24 md:h-24 rounded-none border-2 border-border shadow-lg">
                    <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || 'User'} />
                    <AvatarFallback className="rounded-none bg-primary text-primary-foreground text-2xl font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  {/* Name and Badge */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h1 className="text-2xl md:text-3xl font-bold">{profile.full_name || 'Anonymous User'}</h1>
                      {profile.level && (
                        <Badge className="rounded-none bg-accent text-accent-foreground font-medium">
                          {profile.level}
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Joined {profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently'}
                    </p>
                  </div>

                  {/* Social Links - Top Right */}
                  {profile.socials && Object.values(profile.socials).some(Boolean) && (
                    <div className="flex gap-2">
                      {profile.socials.twitter && (
                        <a
                          href={profile.socials.twitter.startsWith('http') ? profile.socials.twitter : `https://twitter.com/${profile.socials.twitter.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-card/50 border border-border hover:bg-card hover:border-primary/50 transition-all"
                        >
                          <Twitter className="w-4 h-4" />
                        </a>
                      )}
                      {profile.socials.linkedin && (
                        <a
                          href={profile.socials.linkedin.startsWith('http') ? profile.socials.linkedin : `https://linkedin.com/in/${profile.socials.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-card/50 border border-border hover:bg-card hover:border-primary/50 transition-all"
                        >
                          <Linkedin className="w-4 h-4" />
                        </a>
                      )}
                      {profile.socials.instagram && (
                        <a
                          href={profile.socials.instagram.startsWith('http') ? profile.socials.instagram : `https://instagram.com/${profile.socials.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-card/50 border border-border hover:bg-card hover:border-primary/50 transition-all"
                        >
                          <Instagram className="w-4 h-4" />
                        </a>
                      )}
                      {profile.socials.website && (
                        <a
                          href={profile.socials.website.startsWith('http') ? profile.socials.website : `https://${profile.socials.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-card/50 border border-border hover:bg-card hover:border-primary/50 transition-all"
                        >
                          <Globe className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 border-y border-border">
                <div className="p-4 md:p-6 text-center border-r border-border">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Pieces</p>
                  <p className="text-2xl font-bold text-primary">{pieces.length}</p>
                </div>
                <div className="p-4 md:p-6 text-center md:border-r border-border">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Total Views</p>
                  <p className="text-2xl font-bold text-primary">{totalViews.toLocaleString()}</p>
                </div>
                <div className="p-4 md:p-6 text-center border-r border-t md:border-t-0 border-border">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Read Time</p>
                  <p className="text-2xl font-bold text-primary">{totalReadTime}m</p>
                </div>
                <div className="p-4 md:p-6 text-center border-t md:border-t-0 border-border">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Clubs</p>
                  <p className="text-2xl font-bold text-primary">{profile.clubs?.length || 0}</p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="p-6 md:p-8">
                {isEditing ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Full Name</label>
                        <Input
                          value={editForm.full_name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                          placeholder="Your name"
                          className="rounded-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Level</label>
                        <Input
                          value={editForm.level}
                          onChange={(e) => setEditForm(prev => ({ ...prev, level: e.target.value }))}
                          placeholder="e.g., 400 Level"
                          className="rounded-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Faculty</label>
                        <Input
                          value={editForm.faculty}
                          onChange={(e) => setEditForm(prev => ({ ...prev, faculty: e.target.value }))}
                          placeholder="e.g., Faculty of Engineering"
                          className="rounded-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Department</label>
                        <Input
                          value={editForm.department}
                          onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                          placeholder="e.g., Computer Science"
                          className="rounded-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Hall of Residence</label>
                        <Input
                          value={editForm.hall_of_residence}
                          onChange={(e) => setEditForm(prev => ({ ...prev, hall_of_residence: e.target.value }))}
                          placeholder="e.g., Independence Hall"
                          className="rounded-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Clubs (comma-separated)</label>
                        <Input
                          value={editForm.clubs}
                          onChange={(e) => setEditForm(prev => ({ ...prev, clubs: e.target.value }))}
                          placeholder="e.g., NACOSS, NIFES"
                          className="rounded-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Bio</label>
                      <Textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself..."
                        className="rounded-none min-h-[100px]"
                      />
                    </div>

                    <div className="border-t border-border pt-6">
                      <h3 className="text-sm font-semibold mb-4">Social Links</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Twitter</label>
                          <Input
                            value={editForm.twitter}
                            onChange={(e) => setEditForm(prev => ({ ...prev, twitter: e.target.value }))}
                            placeholder="@username"
                            className="rounded-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">LinkedIn</label>
                          <Input
                            value={editForm.linkedin}
                            onChange={(e) => setEditForm(prev => ({ ...prev, linkedin: e.target.value }))}
                            placeholder="linkedin.com/in/username"
                            className="rounded-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Instagram</label>
                          <Input
                            value={editForm.instagram}
                            onChange={(e) => setEditForm(prev => ({ ...prev, instagram: e.target.value }))}
                            placeholder="@username"
                            className="rounded-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Website</label>
                          <Input
                            value={editForm.website}
                            onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                            placeholder="https://yourwebsite.com"
                            className="rounded-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Email Notification Preferences */}
                    <div className="border-t border-border pt-6">
                      <h3 className="text-sm font-semibold mb-4">Email Notifications</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Submission Approved</p>
                            <p className="text-xs text-muted-foreground">Receive email when your submissions are approved</p>
                          </div>
                          <Switch
                            checked={editForm.email_submission_approved}
                            onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, email_submission_approved: checked }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Submission Rejected</p>
                            <p className="text-xs text-muted-foreground">Receive email when your submissions are rejected</p>
                          </div>
                          <Switch
                            checked={editForm.email_submission_rejected}
                            onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, email_submission_rejected: checked }))}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-none flex-1 md:flex-none"
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
                  <div className="space-y-6">
                    {/* Academic Info Table */}
                    {(profile.faculty || profile.department || profile.hall_of_residence) && (
                      <div className="space-y-3">
                        {profile.faculty && (
                          <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <GraduationCap className="w-4 h-4" />
                              <span className="text-xs uppercase tracking-wider">Faculty</span>
                            </div>
                            <span className="font-medium">{profile.faculty}</span>
                          </div>
                        )}
                        {profile.department && (
                          <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Building2 className="w-4 h-4" />
                              <span className="text-xs uppercase tracking-wider">Department</span>
                            </div>
                            <span className="font-medium">{profile.department}</span>
                          </div>
                        )}
                        {profile.hall_of_residence && (
                          <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Home className="w-4 h-4" />
                              <span className="text-xs uppercase tracking-wider">Hall</span>
                            </div>
                            <span className="font-medium">{profile.hall_of_residence}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Clubs */}
                    {profile.clubs && profile.clubs.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 text-muted-foreground mb-3">
                          <Users className="w-4 h-4" />
                          <span className="text-xs uppercase tracking-wider">Clubs & Associations</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {profile.clubs.map((club, index) => (
                            <Badge key={index} variant="secondary" className="rounded-none">
                              {club}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bio */}
                    {profile.bio && (
                      <div>
                        <div className="flex items-center gap-2 text-muted-foreground mb-3">
                          <User className="w-4 h-4" />
                          <span className="text-xs uppercase tracking-wider">About</span>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
                      </div>
                    )}

                    {/* Email */}
                    {profile.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t border-border/50">
                        <Mail className="w-4 h-4" />
                        <span>{profile.email}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Published Pieces */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Published Pieces
                </h2>
                <Badge variant="outline" className="rounded-none">
                  {pieces.length} {pieces.length === 1 ? 'piece' : 'pieces'}
                </Badge>
              </div>

              {pieces.length === 0 ? (
                <Card className="rounded-none border-border p-8 text-center bg-muted/30">
                  <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No published pieces yet.</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {/* Table Header */}
                  <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                    <div className="col-span-5">Title</div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-2">Views</div>
                    <div className="col-span-2">Date</div>
                    <div className="col-span-1"></div>
                  </div>

                  {/* Pieces as Table Rows */}
                  {pieces.map((piece) => (
                    <Link key={piece.id} to={`/inks-vault/piece/${piece.id}`}>
                      <Card className="rounded-none border-border hover:border-primary/50 hover:bg-accent/5 transition-all">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center">
                          {/* Title with optional cover */}
                          <div className="col-span-5 flex items-center gap-3">
                            {piece.cover_image && (
                              <img
                                src={piece.cover_image}
                                alt=""
                                className="w-10 h-10 object-cover rounded-none hidden sm:block"
                              />
                            )}
                            <div className="min-w-0">
                              <h3 className="font-medium truncate">{piece.title}</h3>
                              <p className="text-xs text-muted-foreground md:hidden">
                                {piece.type} • {piece.view_count || 0} views
                              </p>
                            </div>
                          </div>

                          {/* Type */}
                          <div className="col-span-2 hidden md:block">
                            <Badge variant="outline" className="rounded-none text-xs">
                              {piece.type}
                            </Badge>
                          </div>

                          {/* Views */}
                          <div className="col-span-2 hidden md:flex items-center gap-1 text-sm text-muted-foreground">
                            <Eye className="w-3.5 h-3.5" />
                            <span>{piece.view_count || 0}</span>
                          </div>

                          {/* Date */}
                          <div className="col-span-2 hidden md:block text-sm text-muted-foreground">
                            {piece.created_at
                              ? new Date(piece.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                              : '-'}
                          </div>

                          {/* Action */}
                          <div className="col-span-1 hidden md:flex justify-end">
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </>
  );
};

export default ProfilePage;
