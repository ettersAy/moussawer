export interface GithubRepoMetadata {
  name: string;
  description: string | null;
  stars: number;
  language: string | null;
  url: string;
}

export function parseGithubUrl(url: string): { owner: string | null; repo: string | null; valid: boolean } {
  if (!url) return { owner: null, repo: null, valid: false };
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "github.com") return { owner: null, repo: null, valid: false };
    const parts = parsed.pathname.replace(/^\//, "").replace(/\.git$/, "").split("/");
    if (parts.length >= 2) {
      const owner = parts[0];
      const repo = parts[1];
      if (owner && repo) return { owner, repo, valid: true };
    }
  } catch {
    // invalid URL
  }
  return { owner: null, repo: null, valid: false };
}

export async function getRepoMetadata(owner: string, repo: string): Promise<GithubRepoMetadata | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, {
      headers: { Accept: "application/vnd.github.v3+json" },
      signal: controller.signal,
    });

    if (!res.ok) return null;

    const data = (await res.json()) as {
      full_name?: string;
      description?: string | null;
      stargazers_count?: number;
      language?: string | null;
      html_url?: string;
    };

    return {
      name: data.full_name || `${owner}/${repo}`,
      description: data.description || null,
      stars: data.stargazers_count || 0,
      language: data.language || null,
      url: data.html_url || `https://github.com/${owner}/${repo}`,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
