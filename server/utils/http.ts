import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodSchema } from "zod";

export class AppError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function ok(res: Response, data: unknown, meta?: unknown, status = 200) {
  return res.status(status).json(meta ? { data, meta } : { data });
}

export function created(res: Response, data: unknown, meta?: unknown) {
  return ok(res, data, meta, 201);
}

export function noContent(res: Response) {
  return res.status(204).send();
}

export function validate<T>(schema: ZodSchema<T>, input: unknown): T {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new AppError(422, "VALIDATION_ERROR", "Validation failed", error.flatten());
    }
    throw error;
  }
}

export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export function pagination(query: Request["query"]) {
  const page = Math.max(Number(query.page ?? 1), 1);
  const limit = Math.min(Math.max(Number(query.limit ?? 12), 1), 50);
  return {
    page,
    limit,
    skip: (page - 1) * limit
  };
}

export function safeJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction) {
  if (error instanceof AppError) {
    return res.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    });
  }

  // Malformed JSON body from express.json() / body-parser
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({
      error: {
        code: "MALFORMED_JSON",
        message: "Request body contains invalid JSON",
        details: error.message
      }
    });
  }

  // Prisma errors carry their own metadata
  if (error instanceof Error && "code" in error && "clientVersion" in error) {
    const prismaError = error as Error & { code: string; meta?: unknown };
    console.error(`[${res.locals?.requestId ?? "-"}] Prisma error ${prismaError.code}:`, prismaError.message);
    return res.status(503).json({
      error: {
        code: `DB_${prismaError.code}`,
        message: "Database error — the service may be temporarily unavailable",
        details: process.env.NODE_ENV !== "production" ? prismaError.message : undefined
      }
    });
  }

  const message = error instanceof Error ? error.message : String(error);
  const requestId = res.locals?.requestId ?? "-";
  console.error(`[${requestId}] Unhandled error:`, error);
  return res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: process.env.NODE_ENV === "production" ? "Something went wrong" : message || "Something went wrong",
      requestId
    }
  });
}
