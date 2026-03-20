import Role from "../../models/Role.js";
import Skill from "../../models/Skill.js";
import RoleSkill from "../../models/RoleSkills.js";

export const getRoles = async ({ page, limit, search }) => {
  page = Math.max(1, parseInt(page) || 1);
  limit = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const skip = (page - 1) * limit;

  const filter = search?.trim() ? { name: { $regex: search.trim(), $options: "i" } } : {};

  const [data, total] = await Promise.all([
    Role.find(filter).skip(skip).limit(limit).sort({ roleId: 1 }),
    Role.countDocuments(filter),
  ]);

  return { data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

export const getSkills = async ({ page, limit, search }) => {
  page = Math.max(1, parseInt(page) || 1);
  limit = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const skip = (page - 1) * limit;

  const filter = search?.trim() ? { name: { $regex: search.trim(), $options: "i" } } : {};

  const [data, total] = await Promise.all([
    Skill.find(filter).skip(skip).limit(limit).sort({ skillId: 1 }),
    Skill.countDocuments(filter),
  ]);

  return { data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

export const getMappings = async ({ page, limit, roleId, skillId, level }) => {
  page = Math.max(1, parseInt(page) || 1);
  limit = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const skip = (page - 1) * limit;

  const filter = {};
  if (level) filter.level = level.toLowerCase();

  if (roleId) {
    const role = await Role.findOne({ roleId: Number(roleId) });
    if (role) filter.role = role._id;
  }
  if (skillId) {
    const skill = await Skill.findOne({ skillId: Number(skillId) });
    if (skill) filter.skill = skill._id;
  }

  const [data, total] = await Promise.all([
    RoleSkill.find(filter)
      .populate("role", "roleId name")
      .populate("skill", "skillId name")
      .skip(skip)
      .limit(limit)
      .sort({ _id: 1 }),
    RoleSkill.countDocuments(filter),
  ]);

  return { data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

export const getSkillsByRole = async ({ roleId, page, limit }) => {
  page = Math.max(1, parseInt(page) || 1);
  limit = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const skip = (page - 1) * limit;

  const role = await Role.findOne({ roleId: Number(roleId) });
  if (!role) {
    const err = new Error("Role not found");
    err.status = 404;
    throw err;
  }

  const filter = { role: role._id };

  const [mappings, total] = await Promise.all([
    RoleSkill.find(filter)
      .populate("skill", "skillId name")
      .skip(skip)
      .limit(limit)
      .sort({ level: 1 }),
    RoleSkill.countDocuments(filter),
  ]);

  return {
    role: { roleId: role.roleId, name: role.name },
    data: mappings.map((m) => ({ ...m.skill.toObject(), level: m.level })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};
