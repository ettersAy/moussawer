import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { config } from "../config";
import { prisma } from "../db";
import { AppError } from "../utils/http";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: string;
};

export type AuthedRequest = Request & {
  user?: AuthUser;
};

type JwtPayload = {
  sub: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

function readBearer(req: Request) {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length);
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = readBearer(req);
  if (!token) return next();

  try {
    const payload = jwt.verify(token, config.jwtSecret) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true, status: true }
    });
    if (user && user.status === "ACTIVE") req.user = user;
  } catch {
    req.user = undefined;
  }

  return next();
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = readBearer(req);
  if (!token) return next(new AppError(401, "UNAUTHORIZED", "Authentication is required"));

  try {
    const payload = jwt.verify(token, config.jwtSecret) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true, status: true }
    });

    if (!user || user.status !== "ACTIVE") {
      return next(new AppError(401, "UNAUTHORIZED", "Authentication is required"));
    }

    req.user = user;
    return next();
  } catch {
    return next(new AppError(401, "UNAUTHORIZED", "Invalid or expired token"));
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError(401, "UNAUTHORIZED", "Authentication is required"));
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, "FORBIDDEN", "You do not have access to this resource"));
    }
    return next();
  };
}

export function signToken(userId: string) {
  return jwt.sign({ sub: userId }, config.jwtSecret, { expiresIn: "14d" });
}
