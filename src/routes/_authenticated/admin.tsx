import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign, ShieldCheck, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return false;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", u.user.id)
        .eq("role", "admin")
        .maybeSingle();
      return !!data;
    },
  });

  if (isLoading) {
    return <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-muted-foreground">Loading…</div>;
  }
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Card className="p-8">
          <h1 className="font-display text-xl font-semibold">Admin only</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This dashboard is for the Local Bridge internal team. Ask an existing admin to grant
            you the admin role.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8">
        <div className="text-sm text-muted-foreground">Internal team</div>
        <h1 className="font-display text-3xl font-semibold">Admin console</h1>
      </header>
      <Tabs defaultValue="match">
        <TabsList>
          <TabsTrigger value="match">
            <Users className="mr-2 h-4 w-4" /> Matchmaker
          </TabsTrigger>
          <TabsTrigger value="qa">
            <ShieldCheck className="mr-2 h-4 w-4" /> QA queue
          </TabsTrigger>
          <TabsTrigger value="revenue">
            <DollarSign className="mr-2 h-4 w-4" /> Revenue & payouts
          </TabsTrigger>
        </TabsList>
        <TabsContent value="match" className="mt-6">
          <Matchmaker />
        </TabsContent>
        <TabsContent value="qa" className="mt-6">
          <QAQueue />
        </TabsContent>
        <TabsContent value="revenue" className="mt-6">
          <RevenuePanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Matchmaker() {
  const qc = useQueryClient();

  const { data: pendingBusinesses } = useQuery({
    queryKey: ["admin-pending-businesses"],
    queryFn: async () => {
      const { data: biz } = await supabase.from("businesses").select("*");
      const { data: proj } = await supabase.from("projects").select("business_id");
      const taken = new Set((proj ?? []).map((p) => p.business_id));
      return (biz ?? []).filter((b) => !taken.has(b.id));
    },
  });

  const { data: students } = useQuery({
    queryKey: ["admin-students"],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "student");
      const ids = (roles ?? []).map((r) => r.user_id);
      if (ids.length === 0) return [];
      const { data: profs } = await supabase.from("profiles").select("id, full_name, email").in("id", ids);
      return profs ?? [];
    },
  });

  const { data: matchReqs } = useQuery({
    queryKey: ["admin-match-reqs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("match_requests")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const [pick, setPick] = useState<Record<string, string>>({});

  const match = useMutation({
    mutationFn: async ({ business_id, student_id }: { business_id: string; student_id: string }) => {
      const { error } = await supabase
        .from("projects")
        .insert({ business_id, student_id, stage: "matched", subscription_active: true });
      if (error) throw error;
      await supabase
        .from("match_requests")
        .update({ status: "matched" })
        .eq("business_id", business_id);
    },
    onSuccess: () => {
      toast.success("Matched!");
      qc.invalidateQueries();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <Card className="p-6">
        <h3 className="font-display text-lg font-semibold">Pending businesses</h3>
        <div className="mt-4 space-y-3">
          {!pendingBusinesses || pendingBusinesses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No unmatched businesses.</p>
          ) : (
            pendingBusinesses.map((b) => (
              <div key={b.id} className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium">{b.name}</div>
                    <div className="text-xs text-muted-foreground">{b.category}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={pick[b.id] ?? ""}
                      onValueChange={(v) => setPick({ ...pick, [b.id]: v })}
                    >
                      <SelectTrigger className="w-56">
                        <SelectValue placeholder="Pick a student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students?.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.full_name || s.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      disabled={!pick[b.id] || match.isPending}
                      onClick={() =>
                        match.mutate({ business_id: b.id, student_id: pick[b.id] })
                      }
                    >
                      Match
                    </Button>
                  </div>
                </div>
                {b.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{b.description}</p>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-display text-lg font-semibold">Student requests</h3>
        <div className="mt-4 space-y-2">
          {!matchReqs || matchReqs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending requests.</p>
          ) : (
            matchReqs.map((r) => (
              <div key={r.id} className="rounded-lg border border-border p-3 text-sm">
                <div className="text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString()}
                </div>
                <div className="mt-1">
                  Student <code className="text-xs">{r.student_id.slice(0, 8)}</code> ↔ business{" "}
                  <code className="text-xs">{r.business_id.slice(0, 8)}</code>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

function QAQueue() {
  const qc = useQueryClient();
  const { data: queue } = useQuery({
    queryKey: ["admin-qa-queue"],
    queryFn: async () => {
      const { data } = await supabase
        .from("projects")
        .select("*, businesses(name, category)")
        .eq("stage", "qa")
        .order("updated_at", { ascending: false });
      return data ?? [];
    },
  });

  const [feedback, setFeedback] = useState<Record<string, string>>({});

  const approve = useMutation({
    mutationFn: async (id: string) => {
      const p = queue?.find((x) => x.id === id);
      const { error } = await supabase
        .from("projects")
        .update({ stage: "live", live_url: p?.staging_link, admin_feedback: null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Launched 🚀");
      qc.invalidateQueries();
    },
  });

  const sendBack = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("projects")
        .update({ stage: "design", admin_feedback: feedback[id] })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Sent back to student");
      qc.invalidateQueries();
    },
  });

  return (
    <Card className="p-6">
      <h3 className="font-display text-lg font-semibold">Awaiting QA</h3>
      <div className="mt-4 space-y-4">
        {!queue || queue.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing in the QA queue.</p>
        ) : (
          queue.map((p) => {
            const biz = p.businesses as { name: string; category: string } | null;
            return (
              <div key={p.id} className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium">{biz?.name}</div>
                    <div className="text-xs text-muted-foreground">{biz?.category}</div>
                    {p.staging_link && (
                      <a
                        href={p.staging_link}
                        className="mt-2 inline-block text-sm text-primary hover:underline"
                      >
                        {p.staging_link}
                      </a>
                    )}
                  </div>
                  <Badge>{p.stage}</Badge>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
                  <Textarea
                    rows={2}
                    placeholder="Feedback notes (only needed when sending back)"
                    value={feedback[p.id] ?? ""}
                    onChange={(e) => setFeedback({ ...feedback, [p.id]: e.target.value })}
                  />
                  <Button
                    variant="outline"
                    disabled={!feedback[p.id]?.trim() || sendBack.isPending}
                    onClick={() => sendBack.mutate(p.id)}
                  >
                    Send back
                  </Button>
                  <Button
                    disabled={approve.isPending}
                    onClick={() => approve.mutate(p.id)}
                    className="bg-success text-success-foreground hover:bg-success/90"
                  >
                    Approve & launch
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}

function RevenuePanel() {
  const { data: projects } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: async () => {
      const { data } = await supabase
        .from("projects")
        .select("*, businesses(name)");
      return data ?? [];
    },
  });

  const qc = useQueryClient();

  const activeSubs = (projects ?? []).filter((p) => p.subscription_active && p.stage === "live");
  const mrr = activeSubs.length * 39;
  const readyForPayout = (projects ?? []).filter((p) => p.stage === "live" && !p.stipend_paid);

  const markPaid = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").update({ stipend_paid: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Marked as paid");
      qc.invalidateQueries({ queryKey: ["admin-projects"] });
    },
  });

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Active subscriptions" value={activeSubs.length.toString()} />
        <Stat label="Monthly recurring" value={`$${mrr}`} accent />
        <Stat label="Sites launched" value={(projects ?? []).filter((p) => p.stage === "live").length.toString()} />
      </div>
      <Card className="p-6">
        <h3 className="font-display text-lg font-semibold">Student stipend queue</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Cleared for flat payout once their sprint site is live.
        </p>
        <div className="mt-4 space-y-2">
          {readyForPayout.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending payouts.</p>
          ) : (
            readyForPayout.map((p) => {
              const biz = p.businesses as { name: string } | null;
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">{biz?.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Student <code>{p.student_id?.slice(0, 8)}</code>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => markPaid.mutate(p.id)}>
                    Mark stipend paid
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <Card className="p-6">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div
        className={`mt-2 font-display text-3xl font-semibold ${
          accent ? "text-success" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </Card>
  );
}
