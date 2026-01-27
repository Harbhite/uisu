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
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/tutorials" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-ui-blue transition-colors">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-serif text-ui-blue">Upload a Tutorial</CardTitle>
          <CardDescription>Share your knowledge with the Union. All submissions are reviewed.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Tutorial Title</Label>
              <Input id="title" placeholder="e.g., Introduction to Macroeconomics" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="format">Format</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="text">Text / Article</SelectItem>
                    <SelectItem value="essay">Essay</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Difficulty Level</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="What will students learn?" rows={4} required />
            </div>

            <div className="space-y-2">
               <Label htmlFor="cover">Cover Image (URL)</Label>
               <Input id="cover" placeholder="https://..." />
               <p className="text-[10px] text-slate-400">Leave blank for default.</p>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full bg-ui-blue hover:bg-ui-dark" disabled={isSubmitting}>
                {isSubmitting ? 'Uploading...' : 'Submit Tutorial'} <Upload size={16} className="ml-2" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadTutorialPage;
