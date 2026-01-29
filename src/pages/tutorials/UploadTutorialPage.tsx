import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Upload, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';

const UploadTutorialPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Tutorial submitted for review!");
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <SEO
        title="Upload Tutorial | UISU SPACE"
        description="Share your knowledge with the Union. Upload tutorials and help fellow students learn and grow."
        image="/og/pages-screenshot/tutorials_upload.png"
        url="/tutorials/upload"
      />
      <Link to="/tutorials" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-ui-blue transition-colors group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
      </Link>

      <div className="bg-white border border-slate-200 shadow-sm">
        <div className="p-8 border-b border-slate-200">
          <h1 className="text-3xl font-serif font-bold text-ui-blue mb-2">Upload a Tutorial</h1>
          <p className="text-slate-500 font-light">Share your knowledge with the Union. All submissions are reviewed.</p>
        </div>
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs uppercase tracking-widest font-bold text-slate-500">Tutorial Title</Label>
              <Input id="title" placeholder="e.g., Introduction to Macroeconomics" required className="rounded-none bg-slate-50 border-slate-200 focus:border-nobel-gold h-12" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="format" className="text-xs uppercase tracking-widest font-bold text-slate-500">Format</Label>
                <Select required>
                  <SelectTrigger className="rounded-none bg-slate-50 border-slate-200 h-12">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="text">Text / Article</SelectItem>
                    <SelectItem value="essay">Essay</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level" className="text-xs uppercase tracking-widest font-bold text-slate-500">Difficulty Level</Label>
                <Select required>
                  <SelectTrigger className="rounded-none bg-slate-50 border-slate-200 h-12">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs uppercase tracking-widest font-bold text-slate-500">Description</Label>
              <Textarea id="description" placeholder="What will students learn?" rows={6} required className="rounded-none bg-slate-50 border-slate-200 focus:border-nobel-gold" />
            </div>

            <div className="space-y-2">
               <Label htmlFor="cover" className="text-xs uppercase tracking-widest font-bold text-slate-500">Cover Image (URL)</Label>
               <Input id="cover" placeholder="https://..." className="rounded-none bg-slate-50 border-slate-200 focus:border-nobel-gold h-12" />
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Leave blank for default.</p>
            </div>

            <div className="pt-6">
              <Button type="submit" className="w-full bg-ui-blue hover:bg-ui-dark rounded-none h-14 uppercase tracking-widest text-xs font-bold" disabled={isSubmitting}>
                {isSubmitting ? 'Uploading...' : 'Submit Tutorial'} <Upload size={16} className="ml-2" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadTutorialPage;
