import React, { useState } from 'react';
import { Send, Upload, Paperclip, Trash2, Bug, Lightbulb, CheckCircle2 } from 'lucide-react';
import { Select, Textarea } from '../components/FormControls';

export default function FeedbackView() {
  const [category, setCategory] = useState<'bug' | 'feature'>('bug');
  const [comments, setComments] = useState('');
  const [attachments, setAttachments] = useState<{ name: string; url: string; size: number }[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((file: File) => ({
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file)
      }));
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => {
      const newAttachments = [...prev];
      newAttachments.splice(index, 1);
      return newAttachments;
    });
  };

  const generateMarkdown = () => {
    return `# User Feedback
    
**Category:** ${category === 'bug' ? 'Bug Report' : 'New Feature Request'}
**Date:** ${new Date().toLocaleString()}

## Comments
${comments}

## Attachments
${attachments.length > 0 ? attachments.map(a => `- ${a.name}`).join('\n') : 'None'}
`;
  };

  const handleSendFeedback = () => {
    if (!comments.trim()) return;

    // 1. Generate and download markdown file
    const md = generateMarkdown();
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback-${new Date().getTime()}.md`;
    a.click();
    URL.revokeObjectURL(url);

    // 2. Open mailto link
    const subject = encodeURIComponent(`App Feedback: ${category === 'bug' ? 'Bug Report' : 'Feature Request'}`);
    const body = encodeURIComponent('Please find the attached markdown file with my feedback.\n\nThank you.');
    window.location.href = `mailto:vinay.datu@capitol.tn.gov?subject=${subject}&body=${body}`;

    setIsSubmitted(true);
    setTimeout(() => {
      setComments('');
      setAttachments([]);
      setIsSubmitted(false);
    }, 5000);
  };

  if (isSubmitted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-primary-950 mb-2">Feedback Initiated</h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            A markdown file containing your feedback has been downloaded to your device. 
            Your default email client should also open shortly. Please remember to attach the downloaded file and any screenshots!
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="px-6 py-2.5 bg-primary-950 text-white text-sm font-bold uppercase tracking-wide rounded hover:bg-primary-900 transition-colors"
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-accent-500 rounded flex items-center justify-center shadow-sm">
            <Send className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary-950 tracking-tight">Submit Feedback</h1>
            <p className="text-sm text-slate-500">Report bugs or request new features to improve the application.</p>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
          
          <div className="space-y-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Category</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setCategory('bug')}
                className={`flex flex-col items-center justify-center gap-3 p-4 border-2 rounded-xl transition-all ${
                  category === 'bug' 
                    ? 'border-accent-500 bg-accent-50 text-amber-900' 
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                }`}
              >
                <Bug className={`w-8 h-8 ${category === 'bug' ? 'text-accent-500' : 'text-slate-400'}`} />
                <span className="font-bold text-sm">Report a Bug</span>
              </button>
              
              <button
                onClick={() => setCategory('feature')}
                className={`flex flex-col items-center justify-center gap-3 p-4 border-2 rounded-xl transition-all ${
                  category === 'feature' 
                    ? 'border-blue-500 bg-blue-50 text-primary-900' 
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                }`}
              >
                <Lightbulb className={`w-8 h-8 ${category === 'feature' ? 'text-blue-500' : 'text-slate-400'}`} />
                <span className="font-bold text-sm">Request Feature</span>
              </button>
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-6">
            <Textarea 
              label="Comments" 
              value={comments} 
              onChange={e => setComments(e.target.value)} 
              placeholder={category === 'bug' ? "Please describe the issue you encountered in detail..." : "Describe the new feature or enhancement you'd like to see..."}
              className="w-full min-h-[160px]" 
            />
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-6">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Screenshots & Attachments</label>
            
            {attachments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {attachments.map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <Paperclip className="w-4 h-4 text-slate-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(i)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Remove attachment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div>
              <input
                type="file"
                id="feedback-file-upload"
                className="hidden"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileUpload}
              />
              <label
                htmlFor="feedback-file-upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-700 uppercase tracking-wide hover:bg-slate-50 transition-colors cursor-pointer shadow-sm"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Attachments
              </label>
              <p className="text-[10px] text-slate-400 mt-2">Supported formats: JPG, PNG, PDF (Max 10MB)</p>
            </div>
          </div>

        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSendFeedback}
            disabled={!comments.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-primary-950 hover:bg-primary-900 text-white font-bold text-sm uppercase tracking-wide rounded shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
            Generate & Send
          </button>
        </div>
      </div>
    </div>
  );
}
