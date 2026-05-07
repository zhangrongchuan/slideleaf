import { API_URL } from "../../../lib/api";

export default async function SharePage({ params }: { params: Promise<{ shareSlug: string }> }) {
  const { shareSlug } = await params;
  return (
    <main className="h-screen bg-slate-950">
      <iframe
        src={`${API_URL}/share/${shareSlug}`}
        className="h-full w-full border-0 bg-white"
        sandbox="allow-scripts"
        title="Shared presentation"
      />
    </main>
  );
}
