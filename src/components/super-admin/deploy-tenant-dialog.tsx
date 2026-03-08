'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Loader2, ArrowLeft, ArrowRight, Rocket, Check } from 'lucide-react';
import { createAgency } from '@/app/super-admin/actions';

const STEPS = ['Basic Info', 'Modules', 'Plan & Review'] as const;

export function DeployTenantDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1 state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [domain, setDomain] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Step 2 state
  const [modules, setModules] = useState({
    tours: true,
    hotels: true,
    blog: true,
    upsell: true,
    contact: true,
    reviews: true,
  });

  // Step 3 state
  const [tier, setTier] = useState('free');

  function resetForm() {
    setStep(0);
    setName('');
    setSlug('');
    setDomain('');
    setContactEmail('');
    setContactPhone('');
    setModules({
      tours: true,
      hotels: true,
      blog: true,
      upsell: true,
      contact: true,
      reviews: true,
    });
    setTier('free');
  }

  function handleOpenChange(value: boolean) {
    setOpen(value);
    if (!value) resetForm();
  }

  async function handleDeploy() {
    setIsLoading(true);
    try {
      const fd = new FormData();
      fd.set('name', name);
      fd.set('slug', slug);
      fd.set('domain', domain);
      fd.set('contactEmail', contactEmail);
      fd.set('contactPhone', contactPhone);
      fd.set('tier', tier);
      Object.entries(modules).forEach(([key, enabled]) => {
        if (enabled) fd.set(`module_${key}`, 'on');
      });
      await createAgency(fd);
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const canAdvanceStep1 = name.trim() && slug.trim();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Deploy Tenant
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Deploy New Tenant</DialogTitle>
          <DialogDescription>
            Step {step + 1} of {STEPS.length} — {STEPS[step]}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center gap-2 py-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  i < step
                    ? 'bg-green-100 text-green-700'
                    : i === step
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-100 text-zinc-400'
                }`}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 ${i < step ? 'bg-green-300' : 'bg-zinc-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 0 && (
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="w-name">Agency Name *</Label>
              <Input
                id="w-name"
                placeholder="E.g. Pyramids Travel"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="w-slug">Unique Slug *</Label>
              <Input
                id="w-slug"
                placeholder="pyramids-travel"
                className="font-mono"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="w-domain">Custom Domain (Optional)</Label>
              <Input
                id="w-domain"
                placeholder="travel.example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="w-email">Contact Email</Label>
                <Input
                  id="w-email"
                  type="email"
                  placeholder="admin@agency.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="w-phone">Phone</Label>
                <Input
                  id="w-phone"
                  placeholder="+1 555 000"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Modules */}
        {step === 1 && (
          <div className="py-2 space-y-3">
            <p className="text-sm text-muted-foreground">
              Select which modules to enable for this agency.
            </p>
            {Object.entries(modules).map(([key, enabled]) => (
              <label
                key={key}
                className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-zinc-50 transition-colors"
              >
                <span className="text-sm font-medium capitalize">{key}</span>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setModules((prev) => ({ ...prev, [key]: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
            ))}
          </div>
        )}

        {/* Step 3: Plan & Review */}
        {step === 2 && (
          <div className="py-2 space-y-4">
            <div className="space-y-2">
              <Label>Select Tier</Label>
              <div className="grid grid-cols-2 gap-2">
                {['free', 'starter', 'pro', 'enterprise'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTier(t)}
                    className={`rounded-lg border p-3 text-sm font-medium capitalize transition-colors ${
                      tier === t
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-zinc-200 hover:bg-zinc-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-lg border bg-zinc-50 p-4 space-y-2 text-sm">
              <h4 className="font-semibold text-zinc-900">Summary</h4>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Slug</span>
                <span className="font-mono">{slug}</span>
              </div>
              {domain && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Domain</span>
                  <span>{domain}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tier</span>
                <Badge variant="outline" className="capitalize">
                  {tier}
                </Badge>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground">Modules</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {Object.entries(modules)
                    .filter(([, v]) => v)
                    .map(([k]) => (
                      <Badge key={k} variant="secondary" className="text-[10px] capitalize">
                        {k}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex !justify-between">
          <div>
            {step > 0 && (
              <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Back
              </Button>
            )}
          </div>
          <div>
            {step < STEPS.length - 1 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 0 && !canAdvanceStep1}
              >
                Next
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleDeploy}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Rocket className="mr-1.5 h-4 w-4" />
                )}
                Deploy Instance
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
