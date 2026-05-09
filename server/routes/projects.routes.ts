import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";
import { projectResource } from "../services/resources";
import { getRepoMetadata, parseGithubUrl, type GithubRepoMetadata } from "../services/github";
import { AppError, asyncHandler, created, noContent, ok, pagination } from "../utils/http";

export const router = Router();

// POST /projects/github/validate — validate a GitHub URL and fetch metadata
router.post(
  "/projects/github/validate",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { url } = z.object({ url: z.string().url() }).parse(req.body);
    const parsed = parseGithubUrl(url);

    if (!parsed.valid || !parsed.owner || !parsed.repo) {
      ok(res, { valid: false, owner: null, repo: null, metadata: null });
      return;
    }

    const metadata: GithubRepoMetadata | null = await getRepoMetadata(parsed.owner, parsed.repo);
    ok(res, { valid: true, owner: parsed.owner, repo: parsed.repo, metadata });
  }),
);

function defaultTreeData(): string {
  return JSON.stringify({
    nodes: [
      {
        id: "root",
        type: "task",
        position: { x: 120, y: 120 },
        data: {
          title: "New Project",
          content: "Break this project into manageable tasks.",
          tags: [],
          taskStatus: "todo",
          width: 340,
          parentId: null,
          collapsed: false,
          notes: "",
          notesOpen: false,
        },
      },
    ],
    edges: [],
  });
}

const createSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  githubUrl: z.string().url().optional().or(z.literal("")),
  localPath: z.string().max(500).optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  githubUrl: z.string().url().optional().or(z.literal("")),
  localPath: z.string().max(500).optional(),
  treeData: z.string().optional(),
});

// GET /projects — list user's projects
router.get(
  "/projects",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { skip, limit } = pagination(req.query);
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: { userId: req.user!.id },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          userId: true,
          name: true,
          description: true,
          githubUrl: true,
          localPath: true,
          githubRepoOwner: true,
          githubRepoName: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.project.count({ where: { userId: req.user!.id } }),
    ]);
    ok(res, projects.map((p) => projectResource({ ...p, treeData: "{}" })), {
      page: Math.ceil(skip / limit) + 1,
      limit,
      total,
    });
  }),
);

// POST /projects — create a new project
router.post(
  "/projects",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = createSchema.parse(req.body);
    const { owner, repo } = parseGithubUrl(body.githubUrl || "");

    const project = await prisma.project.create({
      data: {
        userId: req.user!.id,
        name: body.name,
        description: body.description || null,
        githubUrl: body.githubUrl || null,
        localPath: body.localPath || null,
        githubRepoOwner: owner,
        githubRepoName: repo,
        treeData: defaultTreeData(),
      },
    });

    created(res, projectResource(project));
  }),
);

// GET /projects/:id — get project with treeData
router.get(
  "/projects/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
    });

    if (!project) throw new AppError(404, "NOT_FOUND", "Project not found");
    if (project.userId !== req.user!.id) throw new AppError(403, "FORBIDDEN", "Access denied");

    ok(res, projectResource(project));
  }),
);

// PATCH /projects/:id — update project
router.patch(
  "/projects/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
    });

    if (!project) throw new AppError(404, "NOT_FOUND", "Project not found");
    if (project.userId !== req.user!.id) throw new AppError(403, "FORBIDDEN", "Access denied");

    const body = updateSchema.parse(req.body);
    const { owner, repo } = parseGithubUrl(body.githubUrl !== undefined ? (body.githubUrl || "") : (project.githubUrl || ""));

    const updated = await prisma.project.update({
      where: { id: project.id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description || null }),
        ...(body.githubUrl !== undefined && {
          githubUrl: body.githubUrl || null,
          githubRepoOwner: owner,
          githubRepoName: repo,
        }),
        ...(body.localPath !== undefined && { localPath: body.localPath || null }),
        ...(body.treeData !== undefined && { treeData: body.treeData }),
      },
    });

    ok(res, projectResource(updated));
  }),
);

// DELETE /projects/:id — delete project
router.delete(
  "/projects/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
    });

    if (!project) throw new AppError(404, "NOT_FOUND", "Project not found");
    if (project.userId !== req.user!.id) throw new AppError(403, "FORBIDDEN", "Access denied");

    await prisma.project.delete({ where: { id: project.id } });
    noContent(res);
  }),
);
