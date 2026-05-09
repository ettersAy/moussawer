import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../server/app";
import { prisma } from "../server/db";

const app = createApp();

async function login(email: string) {
  const response = await request(app)
    .post("/api/v1/auth/login")
    .send({ email, password: "password" })
    .expect(200);
  return response.body.data.token as string;
}

describe("Projects API", () => {
  let clientToken = "";
  let otherToken = "";
  let projectId = "";

  beforeAll(async () => {
    clientToken = await login("client@example.com");
    otherToken = await login("photographer-one@example.com");
  });

  afterAll(async () => {
    if (projectId) {
      await prisma.project.deleteMany({ where: { id: projectId } });
    }
    await prisma.$disconnect();
  });

  it("creates a project", async () => {
    const res = await request(app)
      .post("/api/v1/projects")
      .set("Authorization", `Bearer ${clientToken}`)
      .send({
        name: "Test Project",
        description: "A test project",
        githubUrl: "https://github.com/ettersAy/moussawer",
        localPath: "~/dev/test",
      })
      .expect(201);

    expect(res.body.data.name).toBe("Test Project");
    expect(res.body.data.githubUrl).toBe("https://github.com/ettersAy/moussawer");
    expect(res.body.data.localPath).toBe("~/dev/test");
    expect(res.body.data.treeData).toBeDefined();
    expect(res.body.data.treeData.nodes).toBeDefined();
    projectId = res.body.data.id;
  });

  it("lists user's projects", async () => {
    const res = await request(app)
      .get("/api/v1/projects")
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
    const found = res.body.data.find((p: Record<string, unknown>) => p.id === projectId);
    expect(found).toBeDefined();
    // treeData should not be in list (saved server storage for large trees)
  });

  it("gets project by id with treeData", async () => {
    const res = await request(app)
      .get(`/api/v1/projects/${projectId}`)
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(200);

    expect(res.body.data.id).toBe(projectId);
    expect(res.body.data.treeData.nodes).toBeDefined();
  });

  it("updates a project", async () => {
    const res = await request(app)
      .patch(`/api/v1/projects/${projectId}`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ name: "Updated Project", localPath: "/home/user/projects/test" })
      .expect(200);

    expect(res.body.data.name).toBe("Updated Project");
    expect(res.body.data.localPath).toBe("/home/user/projects/test");
  });

  it("prevents other users from accessing a project", async () => {
    await request(app)
      .get(`/api/v1/projects/${projectId}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .expect(403);
  });

  it("requires authentication", async () => {
    await request(app).get("/api/v1/projects").expect(401);
    await request(app).post("/api/v1/projects").send({ name: "X" }).expect(401);
  });

  it("deletes a project", async () => {
    await request(app)
      .delete(`/api/v1/projects/${projectId}`)
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(204);

    await request(app)
      .get(`/api/v1/projects/${projectId}`)
      .set("Authorization", `Bearer ${clientToken}`)
      .expect(404);

    projectId = ""; // already cleaned up
  });

  it("validates a GitHub URL", async () => {
    const res = await request(app)
      .post("/api/v1/projects/github/validate")
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ url: "https://github.com/ettersAy/moussawer" })
      .expect(200);

    expect(res.body.data.valid).toBe(true);
    expect(res.body.data.owner).toBe("ettersAy");
    expect(res.body.data.repo).toBe("moussawer");
  });
});
