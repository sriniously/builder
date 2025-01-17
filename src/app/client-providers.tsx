"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export const ClientProviders = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <SidebarProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SidebarProvider>
  );
};
