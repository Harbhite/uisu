import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Trash2, Loader2, Megaphone, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface HallPost {
  id: string;
  hall_id: string;
  user_id: string;
  content: string;
  post_type: string;
  likes_count: number;
  created_at: string;
  profile?: { full_name: string | null; avatar_url: string | null } | null;
}

interface Props {
  hallId: string;
  hallColor: string;
}

const HallCommunityFeed = ({ hallId, hallColor }: Props) => {
  const { isStaff } = useAdminCheck();
  const [posts, setPosts] = useState<HallPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [newContent, setNewContent] = useState('');
  const [postType, setPostType] = useState('discussion');
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'announcement' | 'discussion'>('all');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user?.id || null));
    fetchPosts();
  }, [hallId]);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('hall_posts')
      .select('*')
      .eq('hall_id', hallId)
      .order('created_at', { ascending: false });
    if (!error && data) {
      // Fetch profiles for posts
      const userIds = [...new Set(data.map(p => p.user_id))];
      const { data: profiles } = await supabase.from('profiles').select('id, full_name, avatar_url').in('id', userIds);
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      const postsWithProfiles = data.map(p => ({ ...p, profile: profileMap.get(p.user_id) || null }));
      setPosts(postsWithProfiles);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!newContent.trim()) return;
    if (!currentUser) { toast.error('Please sign in'); return; }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('hall_posts').insert({
        hall_id: hallId, user_id: currentUser, content: newContent.trim(),
        post_type: isStaff ? postType : 'discussion',
      });
      if (error) throw error;
      setNewContent('');
      toast.success('Posted!');
      fetchPosts();
    } catch { toast.error('Failed to post'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    const { error } = await supabase.from('hall_posts').delete().eq('id', id);
    if (!error) { toast.success('Deleted'); fetchPosts(); }
  };

  const filtered = filter === 'all' ? posts : posts.filter(p => p.post_type === filter);

  return (
    <div className="bg-white p-8 shadow-xl border-t-4" style={{ borderTopColor: hallColor }}>
      <div className="flex items-center gap-3 mb-6 text-slate-400 font-bold uppercase text-xs tracking-widest">
        <Users size={16} /> Community Feed
      </div>

      {/* Post input */}
      {currentUser && (
        <div className="mb-6 space-y-3">
          <Textarea
            placeholder="Share something with your hall community..."
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            rows={3}
          />
          <div className="flex items-center gap-3">
            {isStaff && (
              <Tabs value={postType} onValueChange={setPostType}>
                <TabsList className="h-8">
                  <TabsTrigger value="discussion" className="text-xs h-7">Discussion</TabsTrigger>
                  <TabsTrigger value="announcement" className="text-xs h-7">Announcement</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
            <Button size="sm" onClick={handleSubmit} disabled={submitting || !newContent.trim()} className="ml-auto gap-1">
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Post
            </Button>
          </div>
        </div>
      )}

      {/* Filter */}
      <Tabs value={filter} onValueChange={v => setFilter(v as any)} className="mb-4">
        <TabsList className="h-8">
          <TabsTrigger value="all" className="text-xs h-7">All</TabsTrigger>
          <TabsTrigger value="announcement" className="text-xs h-7">Announcements</TabsTrigger>
          <TabsTrigger value="discussion" className="text-xs h-7">Discussions</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Posts */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-center py-8 text-slate-400 text-sm">No posts yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {filtered.map(post => (
            <div key={post.id} className={`border border-slate-100 p-4 ${post.post_type === 'announcement' ? 'bg-amber-50/50 border-amber-200/50' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 mb-2">
                  {post.profile?.avatar_url ? (
                    <img src={post.profile.avatar_url} className="w-7 h-7 rounded-full object-cover" alt="" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                      {post.profile?.full_name?.[0] || '?'}
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium text-slate-800">{post.profile?.full_name || 'Anonymous'}</span>
                    <span className="text-[10px] text-slate-400 ml-2">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                  </div>
                  {post.post_type === 'announcement' && (
                    <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 ml-1">
                      <Megaphone size={10} className="mr-1" /> Announcement
                    </Badge>
                  )}
                </div>
                {(currentUser === post.user_id || isStaff) && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-destructive" onClick={() => handleDelete(post.id)}>
                    <Trash2 size={13} />
                  </Button>
                )}
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{post.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HallCommunityFeed;
