import { Router, type IRouter } from "express";
import healthRouter from "./health";
import projectsRouter from "./projects";
import materialsRouter from "./materials";
import moodboardRouter from "./moodboard";
import openaiRouter from "./openai";
import toolsRouter from "./tools";

const router: IRouter = Router();

router.use(healthRouter);
router.use(projectsRouter);
router.use(materialsRouter);
router.use(moodboardRouter);
router.use(openaiRouter);
router.use(toolsRouter);

export default router;
