import { Router } from "express";
import {
  getRoles,
  getSkills,
  getMappings,
  getSkillsByRole,
} from "../../controllers/role-skill/role-skill.controller.js";

const roleSkillRouter = Router();

roleSkillRouter.get("/roles", getRoles);
roleSkillRouter.get("/skills", getSkills);
roleSkillRouter.get("/mappings", getMappings);
roleSkillRouter.get("/roles/:roleId/skills", getSkillsByRole);

export default roleSkillRouter;
