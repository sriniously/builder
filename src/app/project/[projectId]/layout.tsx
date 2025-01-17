import { AppSidebar } from "./_client/sidebar";

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
  params: {
    projectId: string;
  };
}) {
  return (
    <div className="flex w-full">
      <AppSidebar />
      <div className="flex-1 p-5">{children}</div>
    </div>
  );
}
