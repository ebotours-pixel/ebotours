'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Mail } from 'lucide-react';
import { sendBroadcastEmail } from '@/app/super-admin/actions';

export function BroadcastEmailDialog() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [filter, setFilter] = useState('all');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  function handleSend() {
    if (!subject.trim() || !body.trim()) return;
    startTransition(async () => {
      await sendBroadcastEmail({
        subject: subject.trim(),
        body: body.trim(),
        filter,
      });
      setOpen(false);
      setSubject('');
      setBody('');
      setFilter('all');
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Mail className="mr-1.5 h-4 w-4" />
          Email All Agencies
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Broadcast Email</DialogTitle>
          <DialogDescription>Send an email to all agencies matching the filter.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="broadcastFilter">Target Group</Label>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger id="broadcastFilter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agencies</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="trial_expiring">Trials Expiring Soon</SelectItem>
                <SelectItem value="free">Free Tier</SelectItem>
                <SelectItem value="starter">Starter Tier</SelectItem>
                <SelectItem value="professional">Professional Tier</SelectItem>
                <SelectItem value="enterprise">Enterprise Tier</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="broadcastSubject">Subject</Label>
            <Input
              id="broadcastSubject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="broadcastBody">Body</Label>
            <Textarea
              id="broadcastBody"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message to all agencies..."
              rows={8}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={pending || !subject.trim() || !body.trim()}>
            <Mail className="mr-1.5 h-4 w-4" />
            {pending ? 'Sending...' : 'Send Broadcast'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
