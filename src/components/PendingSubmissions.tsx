import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, FileText, CheckCircle2, XCircle, Eye, Loader2,
  Building2, Clock, Download, User, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface PendingJob {
  id: string;
  title: string;
  company: string;
  location: string;
  industry: string;
  description: string;
  requirements: string[];
  salary?: string;
  application_url?: string;
  deadline?: string;
  created_at: string;
  submitted_by?: string;
  submitter?: { full_name: string | null; email: string | null };
}

interface PendingCV {
  id: string;
  title: string;
  description: string;
  file_url: string;
  format: string;
  created_at: string;
  uploaded_by?: string;
  uploader?: { full_name: string | null; email: string | null };
}

const PendingSubmissions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'cvs'>('jobs');
  const [pendingJobs, setPendingJobs] = useState<PendingJob[]>([]);
  const [pendingCVs, setPendingCVs] = useState<PendingCV[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [previewJob, setPreviewJob] = useState<PendingJob | null>(null);
  const [previewCV, setPreviewCV] = useState<PendingCV | null>(null);

  const fetchPendingItems = async () => {
    setLoading(true);
    try {
      // Fetch pending jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('job_listings')
        .select('*')
        .eq('is_approved', false)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;

      // Fetch submitter profiles for jobs
      const jobsWithProfiles = await Promise.all(
        (jobsData || []).map(async (job) => {
          if (job.submitted_by) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', job.submitted_by)
              .maybeSingle();
            return { ...job, submitter: profile };
          }
          return { ...job, submitter: null };
        })
      );

      setPendingJobs(jobsWithProfiles.map(j => ({
        id: j.id,
        title: j.title,
        company: j.company,
        location: j.location,
        industry: j.industry,
        description: j.description || '',
        requirements: j.requirements || [],
        salary: j.salary || undefined,
        application_url: j.application_url || undefined,
        deadline: j.deadline || undefined,
        created_at: j.created_at || new Date().toISOString(),
        submitted_by: j.submitted_by || undefined,
        submitter: j.submitter || undefined
      })));

      // Fetch pending CV templates
      const { data: cvsData, error: cvsError } = await supabase
        .from('cv_templates')
        .select('*')
        .eq('is_approved', false)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (cvsError) throw cvsError;

      // Fetch uploader profiles for CVs
      const cvsWithProfiles = await Promise.all(
        (cvsData || []).map(async (cv) => {
          if (cv.uploaded_by) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', cv.uploaded_by)
              .maybeSingle();
            return { ...cv, uploader: profile };
          }
          return { ...cv, uploader: null };
        })
      );

      setPendingCVs(cvsWithProfiles.map(cv => ({
        id: cv.id,
        title: cv.title,
        description: cv.description || '',
        file_url: cv.file_url || '',
        format: cv.format,
        created_at: cv.created_at || new Date().toISOString(),
        uploaded_by: cv.uploaded_by || undefined,
        uploader: cv.uploader || undefined
      })));

    } catch (error) {
      console.error('Error fetching pending items:', error);
      toast.error('Failed to load pending submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingItems();
  }, []);

  const handleApproveJob = async (id: string) => {
    setProcessing(id);
    try {
      const { error } = await supabase
        .from('job_listings')
        .update({ is_approved: true, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      toast.success('Job listing approved');
      fetchPendingItems();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve job');
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectJob = async (id: string) => {
    if (!confirm('Are you sure you want to reject this job listing? It will be permanently deleted.')) return;
    
    setProcessing(id);
    try {
      const { error } = await supabase
        .from('job_listings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Job listing rejected');
      fetchPendingItems();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject job');
    } finally {
      setProcessing(null);
    }
  };

  const handleApproveCV = async (id: string) => {
    setProcessing(id);
    try {
      const { error } = await supabase
        .from('cv_templates')
        .update({ is_approved: true, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      toast.success('CV template approved');
      fetchPendingItems();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve CV');
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectCV = async (id: string) => {
    if (!confirm('Are you sure you want to reject this CV template? It will be permanently deleted.')) return;
    
    setProcessing(id);
    try {
      const { error } = await supabase
        .from('cv_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('CV template rejected');
      fetchPendingItems();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject CV');
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const totalPending = pendingJobs.length + pendingCVs.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-amber-50 border border-amber-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-amber-600 font-medium uppercase tracking-wider">Total Pending</p>
              <p className="text-2xl font-bold text-amber-700">{totalPending}</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">Internships</p>
              <p className="text-2xl font-bold text-blue-700">{pendingJobs.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-purple-600 font-medium uppercase tracking-wider">CV Templates</p>
              <p className="text-2xl font-bold text-purple-700">{pendingCVs.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'jobs' | 'cvs')}>
        <TabsList className="bg-slate-100 rounded-none">
          <TabsTrigger value="jobs" className="rounded-none data-[state=active]:bg-white">
            <Briefcase size={14} className="mr-2" /> Internships ({pendingJobs.length})
          </TabsTrigger>
          <TabsTrigger value="cvs" className="rounded-none data-[state=active]:bg-white">
            <FileText size={14} className="mr-2" /> CV Templates ({pendingCVs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="mt-4">
          {pendingJobs.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 border border-dashed">
              <Briefcase className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">No pending internship submissions</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {pendingJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white border p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 size={14} className="text-slate-400" />
                          <span className="text-xs text-slate-500">{job.company}</span>
                          <Badge variant="outline" className="text-[9px] rounded-none">
                            {job.industry}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-slate-800 truncate">{job.title}</h4>
                        <p className="text-sm text-slate-600 line-clamp-2 mt-1">{job.description}</p>
                        
                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            {job.submitter?.full_name || job.submitter?.email || 'Unknown'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(job.created_at)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setPreviewJob(job)}
                          className="rounded-none"
                        >
                          <Eye size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleApproveJob(job.id)}
                          disabled={processing === job.id}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 rounded-none"
                        >
                          {processing === job.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={14} />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRejectJob(job.id)}
                          disabled={processing === job.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-none"
                        >
                          <XCircle size={14} />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        <TabsContent value="cvs" className="mt-4">
          {pendingCVs.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 border border-dashed">
              <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">No pending CV template submissions</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {pendingCVs.map((cv, index) => (
                  <motion.div
                    key={cv.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white border p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText size={14} className="text-slate-400" />
                          <Badge variant="outline" className="text-[9px] rounded-none">
                            {cv.format}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-slate-800 truncate">{cv.title}</h4>
                        <p className="text-sm text-slate-600 line-clamp-2 mt-1">{cv.description}</p>
                        
                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            {cv.uploader?.full_name || cv.uploader?.email || 'Unknown'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(cv.created_at)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {cv.file_url && (
                          <Button
                            size="sm"
                            variant="ghost"
                            asChild
                            className="rounded-none"
                          >
                            <a href={cv.file_url} target="_blank" rel="noopener noreferrer">
                              <Download size={14} />
                            </a>
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleApproveCV(cv.id)}
                          disabled={processing === cv.id}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 rounded-none"
                        >
                          {processing === cv.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={14} />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRejectCV(cv.id)}
                          disabled={processing === cv.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-none"
                        >
                          <XCircle size={14} />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Job Preview Modal */}
      <Dialog open={!!previewJob} onOpenChange={() => setPreviewJob(null)}>
        <DialogContent className="max-w-2xl rounded-none">
          <DialogHeader>
            <DialogTitle className="font-serif">{previewJob?.title}</DialogTitle>
          </DialogHeader>
          {previewJob && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span className="flex items-center gap-1">
                  <Building2 size={14} /> {previewJob.company}
                </span>
                <span>{previewJob.location}</span>
                <Badge variant="outline" className="rounded-none">{previewJob.industry}</Badge>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description</h4>
                <p className="text-slate-700">{previewJob.description}</p>
              </div>

              {previewJob.requirements.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Requirements</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {previewJob.requirements.map((req, i) => (
                      <li key={i} className="text-slate-700">{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {previewJob.salary && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Salary</h4>
                  <p className="text-slate-700">{previewJob.salary}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => {
                    handleApproveJob(previewJob.id);
                    setPreviewJob(null);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 rounded-none"
                >
                  <CheckCircle2 size={16} className="mr-2" /> Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleRejectJob(previewJob.id);
                    setPreviewJob(null);
                  }}
                  className="flex-1 rounded-none"
                >
                  <XCircle size={16} className="mr-2" /> Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PendingSubmissions;
