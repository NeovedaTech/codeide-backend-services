import Role      from "../../models/Role.js";
import Skill     from "../../models/Skill.js";
import RoleSkill from "../../models/RoleSkills.js";

// ── Roles ─────────────────────────────────────────────────────────────────────

export const listRoles = async () => Role.find().sort({ roleId: 1 });

export const createRole = async ({ name }) => {
  const last   = await Role.findOne().sort({ roleId: -1 });
  const roleId = (last?.roleId || 0) + 1;
  return Role.create({ roleId, name });
};

export const updateRole = async (id, { name }) => {
  const role = await Role.findByIdAndUpdate(
    id,
    { name },
    { new: true, runValidators: true },
  );
  if (!role) {
    const err = new Error("Role not found");
    err.status = 404;
    throw err;
  }
  return role;
};

export const deleteRole = async (id) => {
  const deleted = await Role.findByIdAndDelete(id);
  if (!deleted) {
    const err = new Error("Role not found");
    err.status = 404;
    throw err;
  }
  // Cascade: remove all mappings for this role
  await RoleSkill.deleteMany({ role: id });
  return { deleted: true };
};

// ── Skills ────────────────────────────────────────────────────────────────────

export const listSkills = async () => Skill.find().sort({ skillId: 1 });

export const createSkill = async ({ name }) => {
  const last    = await Skill.findOne().sort({ skillId: -1 });
  const skillId = (last?.skillId || 0) + 1;
  return Skill.create({ skillId, name });
};

export const updateSkill = async (id, { name }) => {
  const skill = await Skill.findByIdAndUpdate(
    id,
    { name },
    { new: true, runValidators: true },
  );
  if (!skill) {
    const err = new Error("Skill not found");
    err.status = 404;
    throw err;
  }
  return skill;
};

export const deleteSkill = async (id) => {
  const deleted = await Skill.findByIdAndDelete(id);
  if (!deleted) {
    const err = new Error("Skill not found");
    err.status = 404;
    throw err;
  }
  // Cascade: remove all mappings for this skill
  await RoleSkill.deleteMany({ skill: id });
  return { deleted: true };
};

// ── Role-Skill Mappings ───────────────────────────────────────────────────────

export const listMappings = async () =>
  RoleSkill.find()
    .populate("role",  "name roleId")
    .populate("skill", "name skillId")
    .sort({ createdAt: -1 });

export const createMapping = async ({ role, skill, level }) => {
  return RoleSkill.create({ role, skill, level });
};

export const deleteMapping = async (id) => {
  const deleted = await RoleSkill.findByIdAndDelete(id);
  if (!deleted) {
    const err = new Error("Mapping not found");
    err.status = 404;
    throw err;
  }
  return { deleted: true };
};
