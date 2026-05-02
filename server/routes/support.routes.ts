import { Router } from "express";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../db";
import { optionalAuth } from "../middleware/auth";
import { notify } from "../services/notifications";
import { asyncHandler, created, validate } from "../utils/http";

export const router = Router();

router.post(
  "/support",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const body = validate(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        subject: z.string().min(3),
        message: z.string().min(10)
      }),
      req.body
    );
    const admins = await prisma.user.findMany({ where: { role: Role.ADMIN } });
    await Promise.all(
      admins.map((admin) =>
        notify(admin.id, "support.request", body.subject, `${body.name} (${body.email}) wrote: ${body.message.slice(0, 160)}`)
      )
    );
    created(res, { message: "Support request received" });
  })
);
