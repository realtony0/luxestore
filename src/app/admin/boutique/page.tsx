import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth-admin";
import AdminBoutique from "./AdminBoutique";

export const metadata: Metadata = {
  title: "Manage store",
  description: "Luxe Store product administration",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminBoutiquePage() {
  if (!(await isAdmin())) {
    redirect("/admin");
  }
  return <AdminBoutique />;
}
