import { Router } from "express";
import { router as statsRouter } from "./stats.routes";
import { router as usersRouter } from "./users.routes";
import { router as categoriesRouter } from "./categories.routes";
import { router as bookingsRouter } from "./bookings.routes";
import { router as activityRouter } from "./activity.routes";

export const router = Router();

router.use(statsRouter);
router.use(usersRouter);
router.use(categoriesRouter);
router.use(bookingsRouter);
router.use(activityRouter);
