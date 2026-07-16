import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SiteHeader } from "@/components/site-header";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).catch("signin"),
  role: z.enum(["shopkeeper", "student"]).catch("shopkeeper"),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in · Local Bridge" },
      { name: "description", content: "Sign in or create your Local Bridge account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode, role: initialRole } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"shopkeeper" | "student">(initialRole);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        if (data.user) {
          const { error: roleErr } = await supabase
            .from("user_roles")
            .insert({ user_id: data.user.id, role });
          if (roleErr && !roleErr.message.includes("duplicate")) throw roleErr;
        }
        toast.success("Account created!");
        navigate({ to: "/dashboard", replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate({ to: "/dashboard", replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto flex max-w-6xl items-center justify-center px-6 py-16">
        <Card className="w-full max-w-md p-8">
          <h1 className="font-display text-2xl font-semibold">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signup"
              ? "Join Local Bridge in under a minute."
              : "Sign in to your dashboard."}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>I am a…</Label>
                  <RadioGroup
                    value={role}
                    onValueChange={(v) => setRole(v as "shopkeeper" | "student")}
                    className="grid grid-cols-2 gap-3"
                  >
                    <label
                      className={`cursor-pointer rounded-lg border p-3 text-sm ${
                        role === "shopkeeper"
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <RadioGroupItem value="shopkeeper" className="sr-only" />
                      <div className="font-medium">Business owner</div>
                      <div className="text-xs text-muted-foreground">I run a shop</div>
                    </label>
                    <label
                      className={`cursor-pointer rounded-lg border p-3 text-sm ${
                        role === "student" ? "border-primary bg-primary/5" : "border-border"
                      }`}
                    >
                      <RadioGroupItem value="student" className="sr-only" />
                      <div className="font-medium">Student</div>
                      <div className="text-xs text-muted-foreground">I build websites</div>
                    </label>
                  </RadioGroup>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signup" ? (
              <>
                Already have an account?{" "}
                <Link
                  to="/auth"
                  search={{ mode: "signin", role }}
                  className="font-medium text-primary hover:underline"
                >
                  Sign in
                </Link>
              </>
            ) : (
              <>
                New here?{" "}
                <Link
                  to="/auth"
                  search={{ mode: "signup", role }}
                  className="font-medium text-primary hover:underline"
                >
                  Create an account
                </Link>
              </>
            )}
          </p>
        </Card>
      </div>
    </div>
  );
}
