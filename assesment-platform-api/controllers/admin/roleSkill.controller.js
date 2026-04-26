import * as svc from "../../services/admin/roleSkill.service.js";

// ── Roles ─────────────────────────────────────────────────────────────────────

export const listRoles = async (req, res) => {
  try {
    const data = await svc.listRoles();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

export const createRole = async (req, res) => {
  try {
    const data = await svc.createRole(req.body);
    return res.status(201).json({ success: true, data });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

export const updateRole = async (req, res) => {
  try {
    const data = await svc.updateRole(req.params.id, req.body);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

export const deleteRole = async (req, res) => {
  try {
    await svc.deleteRole(req.params.id);
    return res.status(200).json({ success: true, message: "Role deleted" });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

// ── Skills ────────────────────────────────────────────────────────────────────

export const listSkills = async (req, res) => {
  try {
    const data = await svc.listSkills();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

export const createSkill = async (req, res) => {
  try {
    const data = await svc.createSkill(req.body);
    return res.status(201).json({ success: true, data });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

export const updateSkill = async (req, res) => {
  try {
    const data = await svc.updateSkill(req.params.id, req.body);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

export const deleteSkill = async (req, res) => {
  try {
    await svc.deleteSkill(req.params.id);
    return res.status(200).json({ success: true, message: "Skill deleted" });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

// ── Mappings ──────────────────────────────────────────────────────────────────

export const listMappings = async (req, res) => {
  try {
    const data = await svc.listMappings();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

export const createMapping = async (req, res) => {
  try {
    const data = await svc.createMapping(req.body);
    return res.status(201).json({ success: true, data });
  } catch (err) {
    // Unique index violation
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "This role-skill mapping already exists" });
    }
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

export const deleteMapping = async (req, res) => {
  try {
    await svc.deleteMapping(req.params.id);
    return res.status(200).json({ success: true, message: "Mapping deleted" });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};
