import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardRedirect,
});

function DashboardRedirect() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["my-role"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id);
      if (!roles || roles.length === 0) return "shopkeeper" as const;
      const r = roles.map((x) => x.role);
      if (r.includes("admin")) return "admin" as const;
      if (r.includes("shopkeeper")) return "shopkeeper" as const;
      return "student" as const;
    },
  });

  useEffect(() => {
    if (!data) return;
    navigate({ to: `/${data}`, replace: true });
  }, [data, navigate]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 text-sm text-muted-foreground">
      {isLoading ? "Loading your dashboard…" : "Redirecting…"}
    </div>
  );
}
