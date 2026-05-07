import { WorkspaceClient } from "../../../components/WorkspaceClient";

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <WorkspaceClient projectId={projectId} />;
}
