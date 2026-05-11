import { Router } from "express";
import { router as profileRouter } from "./profile.routes";
import { router as servicesRouter } from "./services.routes";
import { router as availabilityRouter } from "./availability.routes";
import { router as blocksRouter } from "./blocks.routes";

export const router = Router();

router.use(profileRouter);
router.use(servicesRouter);
router.use(availabilityRouter);
router.use(blocksRouter);
