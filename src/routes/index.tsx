import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Sparkles, Store, GraduationCap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Local Bridge — Custom websites for local shops, built by students" },
      {
        name: "description",
        content:
          "Get a custom website for your bakery, cafe, or shop for $50 + $39/mo. Students build real portfolio pieces and earn a stipend.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundImage: "var(--gradient-hero)" }}
      >
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              A marketplace for main-street websites
            </div>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              A custom website for your shop. <br />
              <span className="text-primary">Built by a student who cares.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Local Bridge pairs local micro-businesses with vetted student developers for a
              three-week sprint. Beautiful sites for shopkeepers. Real portfolio pieces —
              and a stipend — for students.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="min-w-56">
                <Link to="/auth" search={{ mode: "signup", role: "shopkeeper" }}>
                  Sign up as a Business
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="min-w-56">
                <Link to="/auth" search={{ mode: "signup", role: "student" }}>
                  Apply as a Student
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              No credit card required · Cancel anytime · 3-week sprint guarantee
            </p>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="relative overflow-hidden p-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Store className="h-3.5 w-3.5" /> For Shopkeepers
            </div>
            <h2 className="font-display text-3xl font-semibold">
              A website worth $3,000 for $50 up front.
            </h2>
            <p className="mt-3 text-muted-foreground">
              We match your bakery, cafe or shop with a student developer. In three weeks
              you get a live, mobile-ready website — plus ongoing content updates.
            </p>
            <div className="mt-6 flex items-baseline gap-2">
              <span className="font-display text-4xl font-semibold text-primary">$50</span>
              <span className="text-muted-foreground">setup</span>
              <span className="mx-2 text-muted-foreground">+</span>
              <span className="font-display text-4xl font-semibold text-success">$39</span>
              <span className="text-muted-foreground">/mo hosting & updates</span>
            </div>
            <ul className="mt-6 space-y-2 text-sm">
              {[
                "Matched with a vetted student in under a week",
                "Live, hosted site in 3 weeks",
                "Submit menu / hours / price changes any time",
                "Admin QA before anything goes live",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {f}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-8 w-full sm:w-auto">
              <Link to="/auth" search={{ mode: "signup", role: "shopkeeper" }}>
                Start my business setup
              </Link>
            </Button>
          </Card>

          <Card className="relative overflow-hidden p-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-success/15 px-3 py-1 text-xs font-medium text-accent-foreground">
              <GraduationCap className="h-3.5 w-3.5" /> For Students
            </div>
            <h2 className="font-display text-3xl font-semibold">
              Real clients. Real portfolio. Real stipend.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Ship real websites for real shops on a structured three-week sprint. Every
              launch is portfolio-ready and comes with a flat stipend on completion.
            </p>
            <div className="mt-6 rounded-xl border border-border bg-secondary/50 p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Stipend per launched project
              </div>
              <div className="mt-1 font-display text-3xl font-semibold text-success">
                Flat payout on approval
              </div>
            </div>
            <ul className="mt-6 space-y-2 text-sm">
              {[
                "Browse a live board of local businesses",
                "One-click Request Match",
                "Sprint workspace with brief & assets",
                "Admin QA — you learn from real feedback",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {f}
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" className="mt-8 w-full sm:w-auto">
              <Link to="/auth" search={{ mode: "signup", role: "student" }}>
                Apply to build
              </Link>
            </Button>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-secondary/40 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center font-display text-3xl font-semibold">
            One clean pipeline. Every time.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            The same 3-week sprint powers every launch — so shopkeepers know what to
            expect and students learn a repeatable process.
          </p>
          <div className="mt-12 grid gap-4 md:grid-cols-4">
            {[
              { n: "01", t: "Matched", d: "Admin pairs a student with a business." },
              { n: "02", t: "Design Phase", d: "Student builds using shared assets." },
              { n: "03", t: "Quality Check", d: "Admin reviews the staging link." },
              { n: "04", t: "Live", d: "Site goes live. Stipend is cleared." },
            ].map((s) => (
              <Card key={s.n} className="p-6">
                <div className="font-display text-sm text-primary">{s.n}</div>
                <div className="mt-2 font-display text-xl font-semibold">{s.t}</div>
                <div className="mt-2 text-sm text-muted-foreground">{s.d}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" /> Every site QA'd by our team
            </div>
            <h3 className="mt-3 font-display text-2xl font-semibold">
              You never launch alone.
            </h3>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Nothing ships until an admin approves the staging link. Shopkeepers get a
              polished result. Students get real feedback on real work.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild size="lg">
              <Link to="/auth" search={{ mode: "signup", role: "shopkeeper" }}>
                I'm a shop
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/auth" search={{ mode: "signup", role: "student" }}>
                I'm a student
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 text-sm text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} Local Bridge</span>
          <span>Made for main-street shops.</span>
        </div>
      </footer>
    </div>
  );
}
