function safeJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

export function projectResource(project: {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  githubUrl: string | null;
  localPath: string | null;
  treeData: string;
  githubRepoOwner: string | null;
  githubRepoName: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: project.id,
    userId: project.userId,
    name: project.name,
    description: project.description ?? "",
    githubUrl: project.githubUrl ?? "",
    localPath: project.localPath ?? "",
    treeData: safeJson(project.treeData),
    githubRepoOwner: project.githubRepoOwner ?? "",
    githubRepoName: project.githubRepoName ?? "",
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}
