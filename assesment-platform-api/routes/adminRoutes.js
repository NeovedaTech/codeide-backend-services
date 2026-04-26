import { Router } from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { isAllowed }       from "../middlewares/isAllowed.js";

import * as assessmentCtrl  from "../controllers/admin/assessment.controller.js";
import * as solutionCtrl    from "../controllers/admin/solution.controller.js";
import * as problemCtrl     from "../controllers/admin/problem.controller.js";
import * as poolCtrl        from "../controllers/admin/questionPool.controller.js";
import * as roleSkillCtrl   from "../controllers/admin/roleSkill.controller.js";
import { metrics }          from "../controllers/admin/metrics.controller.js";

const adminRouter = Router();

// All admin routes require authentication + admin role
adminRouter.use(isAuthenticated, isAllowed);

// ── Dashboard ─────────────────────────────────────────────────────────────────
adminRouter.get("/metrics", metrics);

// ── Assessments ───────────────────────────────────────────────────────────────
adminRouter.get   ("/assessments",      assessmentCtrl.list);
adminRouter.post  ("/assessments",      assessmentCtrl.create);
adminRouter.get   ("/assessments/:id",  assessmentCtrl.getOne);
adminRouter.put   ("/assessments/:id",  assessmentCtrl.update);
adminRouter.delete("/assessments/:id",  assessmentCtrl.remove);

// ── Solutions (candidate submissions) ────────────────────────────────────────
adminRouter.get("/solutions",                 solutionCtrl.list);
adminRouter.get("/solutions/:solutionId",     solutionCtrl.getOne);

// ── Problems ──────────────────────────────────────────────────────────────────
adminRouter.get   ("/problems",      problemCtrl.list);
adminRouter.post  ("/problems",      problemCtrl.create);
adminRouter.get   ("/problems/:id",  problemCtrl.getOne);
adminRouter.put   ("/problems/:id",  problemCtrl.update);
adminRouter.delete("/problems/:id",  problemCtrl.remove);

// ── Question Pools ────────────────────────────────────────────────────────────
adminRouter.get   ("/question-pools",                               poolCtrl.list);
adminRouter.post  ("/question-pools",                               poolCtrl.create);
adminRouter.get   ("/question-pools/:id",                           poolCtrl.getOne);
adminRouter.put   ("/question-pools/:id",                           poolCtrl.update);
adminRouter.delete("/question-pools/:id",                           poolCtrl.remove);
adminRouter.post  ("/question-pools/:id/questions",                 poolCtrl.addQuestion);
adminRouter.put   ("/question-pools/:id/questions/:questionId",     poolCtrl.updateQuestion);
adminRouter.delete("/question-pools/:id/questions/:questionId",     poolCtrl.deleteQuestion);

// ── Roles ─────────────────────────────────────────────────────────────────────
adminRouter.get   ("/roles",      roleSkillCtrl.listRoles);
adminRouter.post  ("/roles",      roleSkillCtrl.createRole);
adminRouter.put   ("/roles/:id",  roleSkillCtrl.updateRole);
adminRouter.delete("/roles/:id",  roleSkillCtrl.deleteRole);

// ── Skills ────────────────────────────────────────────────────────────────────
adminRouter.get   ("/skills",      roleSkillCtrl.listSkills);
adminRouter.post  ("/skills",      roleSkillCtrl.createSkill);
adminRouter.put   ("/skills/:id",  roleSkillCtrl.updateSkill);
adminRouter.delete("/skills/:id",  roleSkillCtrl.deleteSkill);

// ── Role-Skill Mappings ───────────────────────────────────────────────────────
adminRouter.get   ("/role-skill-mappings",      roleSkillCtrl.listMappings);
adminRouter.post  ("/role-skill-mappings",      roleSkillCtrl.createMapping);
adminRouter.delete("/role-skill-mappings/:id",  roleSkillCtrl.deleteMapping);

export default adminRouter;
