import { Router } from "express";
import { router as incidentsRouter } from "./incidents.routes";
import { router as disputesRouter } from "./disputes.routes";

export const router = Router();

router.use(incidentsRouter);
router.use(disputesRouter);
