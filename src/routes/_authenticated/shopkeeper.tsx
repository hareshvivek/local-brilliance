import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Check, Store, ClipboardList, Radio } from "lucide-react";

export const Route = createFileRoute("/_authenticated/shopkeeper")({
  component: ShopkeeperDashboard,
});

const STAGES = [
  { key: "matched", label: "Matched" },
  { key: "design", label: "Design Phase" },
  { key: "qa", label: "Quality Check" },
  { key: "live", label: "Live" },
] as const;

function ShopkeeperDashboard() {
  const qc = useQueryClient();

  const { data: userData } = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await supabase.auth.getUser()).data.user,
  });
  const userId = userData?.id;

  const { data: business } = useQuery({
    enabled: !!userId,
    queryKey: ["business", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", userId!)
        .maybeSingle();
      return data;
    },
  });

  const { data: project } = useQuery({
    enabled: !!business?.id,
    queryKey: ["project-for-business", business?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("business_id", business!.id)
        .maybeSingle();
      return data;
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8">
        <div className="text-sm text-muted-foreground">Shopkeeper</div>
        <h1 className="font-display text-3xl font-semibold">
          {business?.name ?? "Welcome to Local Bridge"}
        </h1>
      </header>

      <Tabs defaultValue={business ? "project" : "business"}>
        <TabsList>
          <TabsTrigger value="business">
            <Store className="mr-2 h-4 w-4" /> Business
          </TabsTrigger>
          <TabsTrigger value="project">
            <Radio className="mr-2 h-4 w-4" /> Active project
          </TabsTrigger>
          <TabsTrigger value="content">
            <ClipboardList className="mr-2 h-4 w-4" /> Content manager
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="mt-6">
          <BusinessForm business={business} userId={userId} onSaved={() => qc.invalidateQueries()} />
        </TabsContent>

        <TabsContent value="project" className="mt-6">
          <ProjectTimeline project={project} hasBusiness={!!business} />
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <ContentManager project={project} business={business} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

type Business = {
  id: string;
  name: string;
  category: string;
  instagram: string | null;
  description: string | null;
  menu_notes: string | null;
  design_preferences: string | null;
};

function BusinessForm({
  business,
  userId,
  onSaved,
}: {
  business: Business | null | undefined;
  userId: string | undefined;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: business?.name ?? "",
    category: business?.category ?? "",
    instagram: business?.instagram ?? "",
    description: business?.description ?? "",
    menu_notes: business?.menu_notes ?? "",
    design_preferences: business?.design_preferences ?? "",
  });
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    try {
      const payload = { ...form, owner_id: userId };
      const { error } = business?.id
        ? await supabase.from("businesses").update(payload).eq("id", business.id)
        : await supabase.from("businesses").insert(payload);
      if (error) throw error;
      toast.success(business ? "Business updated" : "Business added — we'll match you soon!");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="p-8">
      <h2 className="font-display text-xl font-semibold">
        {business ? "Business details" : "Tell us about your business"}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        This is the brief your student developer will build from.
      </p>
      <form onSubmit={save} className="mt-6 grid gap-5 md:grid-cols-2">
        <div className="space-y-2 md:col-span-1">
          <Label>Business name</Label>
          <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Input
            required
            placeholder="Bakery, Cafe, Boutique…"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Instagram / current website</Label>
          <Input
            placeholder="https://instagram.com/yourshop"
            value={form.instagram}
            onChange={(e) => setForm({ ...form, instagram: e.target.value })}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Short description</Label>
          <Textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Menu / product list</Label>
          <Textarea
            rows={4}
            placeholder="Paste your menu or product list. You can attach photos in chat with your student later."
            value={form.menu_notes}
            onChange={(e) => setForm({ ...form, menu_notes: e.target.value })}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Design preferences</Label>
          <Textarea
            rows={3}
            placeholder="Warm & cozy? Modern & minimal? Any brand colors?"
            value={form.design_preferences}
            onChange={(e) => setForm({ ...form, design_preferences: e.target.value })}
          />
        </div>
        <Button type="submit" disabled={saving} className="md:col-span-2 w-fit">
          {saving ? "Saving…" : business ? "Save changes" : "Submit for matching"}
        </Button>
      </form>
    </Card>
  );
}

function ProjectTimeline({
  project,
  hasBusiness,
}: {
  project: { stage: string; live_url: string | null; staging_link: string | null } | null | undefined;
  hasBusiness: boolean;
}) {
  if (!hasBusiness) {
    return (
      <Card className="p-8 text-sm text-muted-foreground">
        Fill in your business details first — we'll start matching you the moment you submit.
      </Card>
    );
  }
  if (!project) {
    return (
      <Card className="p-8">
        <Badge variant="secondary">Awaiting match</Badge>
        <p className="mt-3 text-sm text-muted-foreground">
          Our team is reviewing your submission and matching you with a student developer.
          You'll see the sprint timeline here as soon as you're matched.
        </p>
      </Card>
    );
  }

  const currentIdx = STAGES.findIndex((s) => s.key === project.stage);
  return (
    <Card className="p-8">
      <h2 className="font-display text-xl font-semibold">3-week sprint</h2>
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {STAGES.map((s, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          return (
            <div
              key={s.key}
              className={`relative rounded-xl border p-5 ${
                active
                  ? "border-primary bg-primary/5"
                  : done
                    ? "border-success/40 bg-success/5"
                    : "border-border"
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`grid h-7 w-7 place-items-center rounded-full text-xs font-semibold ${
                    done
                      ? "bg-success text-success-foreground"
                      : active
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <div className="font-medium">{s.label}</div>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                {active ? "In progress" : done ? "Complete" : "Upcoming"}
              </div>
            </div>
          );
        })}
      </div>
      {project.live_url && (
        <div className="mt-6 rounded-lg border border-success/30 bg-success/5 p-4 text-sm">
          🎉 Your site is live:{" "}
          <a href={project.live_url} className="font-medium text-primary underline">
            {project.live_url}
          </a>
        </div>
      )}
    </Card>
  );
}

function ContentManager({
  project,
  business,
}: {
  project: { id: string } | null | undefined;
  business: { id: string } | null | undefined;
}) {
  const qc = useQueryClient();
  const [message, setMessage] = useState("");

  const { data: requests } = useQuery({
    enabled: !!business?.id,
    queryKey: ["content-requests", business?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("content_requests")
        .select("*")
        .eq("business_id", business!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const submit = useMutation({
    mutationFn: async () => {
      if (!project?.id || !business?.id) throw new Error("No live project yet");
      const { error } = await supabase
        .from("content_requests")
        .insert({ project_id: project.id, business_id: business.id, message });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Request submitted");
      setMessage("");
      qc.invalidateQueries({ queryKey: ["content-requests"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <Card className="p-6">
        <h3 className="font-display text-lg font-semibold">Request a change</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          New hours? Menu update? Price change? Send it here — part of your $39/mo.
        </p>
        <Textarea
          rows={6}
          className="mt-4"
          placeholder="Update Tuesday hours to 8am–3pm. Add new croissant at $4.50."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button
          className="mt-4"
          disabled={!message.trim() || submit.isPending}
          onClick={() => submit.mutate()}
        >
          {submit.isPending ? "Submitting…" : "Submit request"}
        </Button>
      </Card>
      <Card className="p-6">
        <h3 className="font-display text-lg font-semibold">Recent requests</h3>
        <div className="mt-4 space-y-3">
          {!requests || requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No requests yet.</p>
          ) : (
            requests.map((r) => (
              <div key={r.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <Badge variant={r.status === "done" ? "default" : "secondary"}>
                    {r.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-2 text-sm">{r.message}</p>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
