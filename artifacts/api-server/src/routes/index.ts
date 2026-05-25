import { Router, type IRouter } from "express";
import healthRouter from "./health";
import wallpapersRouter from "./wallpapers";
import favoritesRouter from "./favorites";

const router: IRouter = Router();

router.use(healthRouter);
router.use(wallpapersRouter);
router.use(favoritesRouter);

export default router;
