import Project from "@/components/magicsubs/project";
import { fetchSingleProjects } from "@/lib/actions/magicsubs.action";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const ProjectPage = async ({ params }: { params: { projectId: string } }) => {
  const { userId } = auth();
  if (!userId) {
    return redirect("/sign-in");
  }

  const { projectId } = params;
  const project = await fetchSingleProjects(projectId)
  if (!project) {
    return redirect("/magicsubs");
  }

  return <Project project={project} />;
};

export default ProjectPage;
