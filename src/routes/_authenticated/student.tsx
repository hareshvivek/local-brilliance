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
import { GraduationCap, Layers, Rocket } from "lucide-react";

export const Route = createFileRoute("/_authenticated/student")({
  component: StudentDashboard,
});

function StudentDashboard() {
  const { data: userData } = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await supabase.auth.getUser()).data.user,
  });
  const userId = userData?.id;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8">
        <div className="text-sm text-muted-foreground">Student developer</div>
        <h1 className="font-display text-3xl font-semibold">Your builder workspace</h1>
      </header>

      <Tabs defaultValue="board">
        <TabsList>
          <TabsTrigger value="board">
            <Layers className="mr-2 h-4 w-4" /> Project board
          </TabsTrigger>
          <TabsTrigger value="sprint">
            <Rocket className="mr-2 h-4 w-4" /> My sprint
          </TabsTrigger>
          <TabsTrigger value="profile">
            <GraduationCap className="mr-2 h-4 w-4" /> Portfolio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="mt-6">
          <ProjectBoard userId={userId} />
        </TabsContent>
        <TabsContent value="sprint" className="mt-6">
          <SprintWorkspace userId={userId} />
        </TabsContent>
        <TabsContent value="profile" className="mt-6">
          <PortfolioForm userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProjectBoard({ userId }: { userId: string | undefined }) {
  const qc = useQueryClient();
  const { data: businesses } = useQuery({
    queryKey: ["all-businesses"],
    queryFn: async () => {
      const { data } = await supabase.from("businesses").select("*").order("created_at", {
        ascending: false,
      });
      return data ?? [];
    },
  });
  const { data: mine } = useQuery({
    enabled: !!userId,
    queryKey: ["my-requests", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("match_requests")
        .select("business_id")
        .eq("student_id", userId!);
      return new Set((data ?? []).map((r) => r.business_id));
    },
  });

  const request = useMutation({
    mutationFn: async (business_id: string) => {
      if (!userId) return;
      const { error } = await supabase.from("match_requests").insert({ business_id, student_id: userId });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Match requested — admin will review.");
      qc.invalidateQueries({ queryKey: ["my-requests"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {(!businesses || businesses.length === 0) && (
        <Card className="col-span-full p-8 text-sm text-muted-foreground">
          No businesses waiting right now. Check back soon.
        </Card>
      )}
      {businesses?.map((b) => (
        <Card key={b.id} className="flex flex-col p-6">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">{b.category}</Badge>
          </div>
          <h3 className="mt-3 font-display text-lg font-semibold">{b.name}</h3>
          <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
            {b.description || "No description yet."}
          </p>
          <div className="mt-auto pt-4">
            <Button
              size="sm"
              className="w-full"
              disabled={!!mine?.has(b.id) || request.isPending}
              onClick={() => request.mutate(b.id)}
            >
              {mine?.has(b.id) ? "Requested" : "Request match"}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function SprintWorkspace({ userId }: { userId: string | undefined }) {
  const qc = useQueryClient();
  const [staging, setStaging] = useState("");

  const { data: project } = useQuery({
    enabled: !!userId,
    queryKey: ["my-project", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("projects")
        .select("*, businesses(*)")
        .eq("student_id", userId!)
        .in("stage", ["matched", "design", "qa"])
        .maybeSingle();
      return data;
    },
  });

  const submit = useMutation({
    mutationFn: async () => {
      if (!project) return;
      const { error } = await supabase
        .from("projects")
        .update({ staging_link: staging, stage: "qa" })
        .eq("id", project.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Sent to admin for QA");
      setStaging("");
      qc.invalidateQueries({ queryKey: ["my-project"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  if (!project) {
    return (
      <Card className="p-8 text-sm text-muted-foreground">
        You're not on a sprint yet. Request a match from the project board.
      </Card>
    );
  }

  const b = project.businesses as {
    name: string;
    category: string;
    instagram: string | null;
    description: string | null;
    menu_notes: string | null;
    design_preferences: string | null;
  } | null;

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <Card className="p-6">
        <Badge>{project.stage}</Badge>
        <h3 className="mt-3 font-display text-2xl font-semibold">{b?.name}</h3>
        <p className="text-sm text-muted-foreground">{b?.category}</p>

        <dl className="mt-6 space-y-4 text-sm">
          <Field label="Instagram">{b?.instagram || "—"}</Field>
          <Field label="Description">{b?.description || "—"}</Field>
          <Field label="Menu / products">{b?.menu_notes || "—"}</Field>
          <Field label="Design preferences">{b?.design_preferences || "—"}</Field>
        </dl>

        {project.admin_feedback && (
          <div className="mt-6 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm">
            <div className="font-medium text-destructive">Admin feedback</div>
            <p className="mt-1">{project.admin_feedback}</p>
          </div>
        )}
      </Card>
      <Card className="p-6">
        <h3 className="font-display text-lg font-semibold">Submit for QA</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Send your staging link. Admin will approve & launch or send back notes.
        </p>
        <div className="mt-4 space-y-2">
          <Label>Staging URL</Label>
          <Input
            placeholder="https://staging.example.com"
            value={staging || project.staging_link || ""}
            onChange={(e) => setStaging(e.target.value)}
          />
        </div>
        <Button
          className="mt-4 w-full"
          disabled={!staging.trim() || submit.isPending}
          onClick={() => submit.mutate()}
        >
          {submit.isPending ? "Submitting…" : "Send to admin QA"}
        </Button>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap">{children}</dd>
    </div>
  );
}

function PortfolioForm({ userId }: { userId: string | undefined }) {
  const qc = useQueryClient();
  const { data: profile } = useQuery({
    enabled: !!userId,
    queryKey: ["student-profile", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      return data;
    },
  });
  const { data: launched } = useQuery({
    enabled: !!userId,
    queryKey: ["launched-projects", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("projects")
        .select("id, live_url, businesses(name, category)")
        .eq("student_id", userId!)
        .eq("stage", "live");
      return data ?? [];
    },
  });

  const [form, setForm] = useState({
    university: "",
    course: "",
    skills: "",
    bio: "",
  });

  const loaded = profile ?? null;
  const values = {
    university: form.university || loaded?.university || "",
    course: form.course || loaded?.course || "",
    skills: form.skills || loaded?.skills || "",
    bio: form.bio || loaded?.bio || "",
  };

  const save = useMutation({
    mutationFn: async () => {
      if (!userId) return;
      const payload = { user_id: userId, ...values, available: true };
      const { error } = loaded
        ? await supabase.from("student_profiles").update(payload).eq("user_id", userId)
        : await supabase.from("student_profiles").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile saved");
      qc.invalidateQueries({ queryKey: ["student-profile"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <Card className="p-6">
        <h3 className="font-display text-lg font-semibold">Your profile</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>University</Label>
            <Input
              value={values.university}
              onChange={(e) => setForm({ ...form, university: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Course</Label>
            <Input
              value={values.course}
              onChange={(e) => setForm({ ...form, course: e.target.value })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Skills</Label>
            <Input
              placeholder="React, Tailwind, Node…"
              value={values.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Short bio</Label>
            <Textarea
              rows={4}
              value={values.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>
        </div>
        <Button className="mt-4" onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save profile"}
        </Button>
      </Card>
      <Card className="p-6">
        <h3 className="font-display text-lg font-semibold">Launched sites</h3>
        <div className="mt-4 space-y-3">
          {!launched || launched.length === 0 ? (
            <p className="text-sm text-muted-foreground">No launches yet. Ship your first sprint.</p>
          ) : (
            launched.map((p) => {
              const biz = p.businesses as { name: string; category: string } | null;
              return (
                <div key={p.id} className="rounded-lg border border-border p-3">
                  <div className="font-medium">{biz?.name}</div>
                  <div className="text-xs text-muted-foreground">{biz?.category}</div>
                  {p.live_url && (
                    <a
                      href={p.live_url}
                      className="mt-2 inline-block text-sm text-primary hover:underline"
                    >
                      {p.live_url}
                    </a>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
