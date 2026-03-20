import * as roleSkillService from "../../services/role-skill/role-skill.service.js";

export const getRoles = async (req, res, next) => {
  try {
    const result = await roleSkillService.getRoles(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getSkills = async (req, res, next) => {
  try {
    const result = await roleSkillService.getSkills(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getMappings = async (req, res, next) => {
  try {
    const result = await roleSkillService.getMappings(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getSkillsByRole = async (req, res, next) => {
  try {
    const result = await roleSkillService.getSkillsByRole({
      ...req.query,
      roleId: req.params.roleId,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};
