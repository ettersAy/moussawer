import http from "node:http";

const server = http.createServer((req, res) => {
  const body = JSON.stringify({
    node: process.version,
    hasJwt: !!process.env.JWT_SECRET,
    hasDbUrl: !!process.env.DATABASE_URL,
    jwtLength: (process.env.JWT_SECRET || "").length,
    dbUrlPrefix: (process.env.DATABASE_URL || "").slice(0, 30),
    vercelEnv: process.env.VERCEL_ENV,
    url: req.url,
  });
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(body);
});

export default server;
