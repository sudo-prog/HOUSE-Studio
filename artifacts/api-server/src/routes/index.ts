import { Router, type IRouter } from "express";
import healthRouter from "./health";
import projectsRouter from "./projects";
import materialsRouter from "./materials";
import moodboardRouter from "./moodboard";
import openaiRouter from "./openai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(projectsRouter);
router.use(materialsRouter);
router.use(moodboardRouter);
router.use(openaiRouter);

export default router;
