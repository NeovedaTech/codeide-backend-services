import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../../config/s3.js";
import { config } from "../../config/config.js";
import AssesmentSolution from "../models/Solution.js";
import { verifyToken } from "../services/auth/auth.service.js";

const VIOLATION_TYPES = new Set(["tab_switch", "window_blur", "fullscreen_exit", "devtools", "no_face", "multiple_faces"]);

/** Find a solution by ID and verify it belongs to the requesting user. */
const findOwnSolution = async (solutionId, reqUserId, projection) => {
  const solution = await AssesmentSolution.findById(solutionId, projection);
  if (!solution) return null;
  // Compare as strings to avoid ObjectId vs string type mismatch
  if (solution.userId.toString() !== reqUserId?.toString()) return null;
  return solution;
};

// ── POST /api/v1/proctoring/presigned-url ─────────────────────────────────────
export const getPresignedUrl = async (req, res) => {
  const { solutionId, assessmentId, chunkIndex, contentType, recordingType } = req.body;
  if (!solutionId || !assessmentId || chunkIndex == null) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  const solution = await findOwnSolution(solutionId, req.user.id);
  if (!solution) return res.status(404).json({ success: false, message: "Solution not found" });

  const isScreen = recordingType === "screen";
  const prefix   = isScreen ? "screen-recordings" : "recordings";
  const key      = `${prefix}/${assessmentId}/${solutionId}/chunk-${chunkIndex}.webm`;

  const command = new PutObjectCommand({
    Bucket: config.aws.bucket,
    Key: key,
    ContentType: contentType || "video/webm",
  });

  const url = await getSignedUrl(s3, command, { expiresIn: config.aws.putExpiry });

  if (isScreen) {
    const update = {
      $set: {
        "proctoringData.screenLastKnownChunkIndex": chunkIndex,
        "proctoringData.screenRecordingStatus":     "active",
        "proctoringData.isEnabled":                 true,
      },
    };
    if (!solution.proctoringData?.screenRecordingStartedAt) {
      update.$set["proctoringData.screenRecordingStartedAt"] = new Date();
    }
    await AssesmentSolution.updateOne({ _id: solutionId }, update);
  } else {
    const update = {
      $set: {
        "proctoringData.lastKnownChunkIndex": chunkIndex,
        "proctoringData.recordingStatus":     "active",
        "proctoringData.isEnabled":           true,
      },
    };
    if (!solution.proctoringData?.recordingStartedAt) {
      update.$set["proctoringData.recordingStartedAt"] = new Date();
    }
    if (solution.proctoringData?.recordingStatus === "interrupted") {
      update.$inc = { "proctoringData.sessionCount": 1 };
    }
    await AssesmentSolution.updateOne({ _id: solutionId }, update);
  }

  return res.json({ url, key, expiresIn: config.aws.putExpiry });
};

// ── POST /api/v1/proctoring/log ───────────────────────────────────────────────
export const logEvents = async (req, res) => {
  const { solutionId, events } = req.body;
  if (!solutionId || !Array.isArray(events) || !events.length) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  const solution = await findOwnSolution(solutionId, req.user.id, "userId proctoringData");
  if (!solution) return res.status(404).json({ success: false, message: "Solution not found" });

  const formattedEvents = events.map((e) => ({
    eventType: e.type,
    timestamp: new Date(e.timestamp),
    detail: e.detail,
  }));

  const violationCount = events.filter((e) => VIOLATION_TYPES.has(e.type)).length;

  const update = {
    $push: { "proctoringData.logs": { $each: formattedEvents } },
  };
  if (violationCount > 0) {
    update.$inc = {
      "proctoringData.violationCount": violationCount,
      ufmAttempts: violationCount,
    };
  }

  const hasSessionEnd = events.some((e) => e.type === "session_end");
  if (hasSessionEnd) {
    update.$set = { "proctoringData.recordingStatus": "interrupted" };
  }

  await AssesmentSolution.updateOne({ _id: solutionId }, update);

  return res.json({ success: true });
};

// ── POST /api/v1/proctoring/complete ─────────────────────────────────────────
export const completeRecording = async (req, res) => {
  const { solutionId, chunks, screenChunks } = req.body;
  if (!solutionId) return res.status(400).json({ success: false, message: "Missing solutionId" });

  const solution = await findOwnSolution(solutionId, req.user.id, "userId");
  if (!solution) return res.status(404).json({ success: false, message: "Solution not found" });

  const $set = {
    "proctoringData.recordingEndedAt": new Date(),
    "proctoringData.recordingStatus":  "completed",
    "proctoringData.chunks":           Array.isArray(chunks) ? chunks : [],
  };

  if (Array.isArray(screenChunks) && screenChunks.length > 0) {
    $set["proctoringData.screenRecordingStatus"] = "completed";
    $set["proctoringData.screenChunks"]          = screenChunks;
    $set["proctoringData.screenRecordingEndedAt"] = new Date();
  }

  await AssesmentSolution.updateOne({ _id: solutionId }, { $set });

  return res.json({ success: true });
};

// ── GET /api/v1/proctoring/session/:solutionId ────────────────────────────────
export const getSession = async (req, res) => {
  const { solutionId } = req.params;

  const solution = await findOwnSolution(solutionId, req.user.id, "userId proctoringData");
  if (!solution) return res.status(404).json({ success: false, message: "Solution not found" });

  const pd = solution.proctoringData || {};
  return res.json({
    recordingStatus: pd.recordingStatus || "not_started",
    lastKnownChunkIndex: pd.lastKnownChunkIndex ?? -1,
    sessionCount: pd.sessionCount ?? 0,
    isEnabled: pd.isEnabled ?? false,
  });
};

// ── POST /api/v1/proctoring/relay-chunk ──────────────────────────────────────
// Called via sendBeacon on page unload — JWT can't go in a header so it is
// passed as ?t=<token>.  The raw video/webm body is uploaded directly to S3.
export const relayChunk = async (req, res) => {
  const { solutionId, assessmentId, chunkIndex, recordingType, t } = req.query;

  if (!solutionId || !assessmentId || chunkIndex == null || !t) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  const payload = verifyToken(t);
  if (!payload) return res.status(401).json({ success: false, message: "Unauthorized" });

  const solution = await findOwnSolution(solutionId, payload.id, "userId");
  if (!solution) return res.status(404).json({ success: false, message: "Solution not found" });

  const isScreen = recordingType === "screen";
  const idx      = Number(chunkIndex);
  const prefix   = isScreen ? "screen-recordings" : "recordings";
  const key      = `${prefix}/${assessmentId}/${solutionId}/chunk-${idx}.webm`;

  await s3.send(new PutObjectCommand({
    Bucket:      config.aws.bucket,
    Key:         key,
    Body:        req.body,
    ContentType: "video/webm",
  }));

  const $set = isScreen
    ? { "proctoringData.screenLastKnownChunkIndex": idx, "proctoringData.screenRecordingStatus": "active", "proctoringData.isEnabled": true }
    : { "proctoringData.lastKnownChunkIndex": idx, "proctoringData.recordingStatus": "active", "proctoringData.isEnabled": true };

  await AssesmentSolution.updateOne({ _id: solutionId }, { $set });

  return res.json({ success: true });
};

// ── GET /api/v1/proctoring/:solutionId  (admin) ───────────────────────────────
export const getProctoringData = async (req, res) => {
  const { solutionId } = req.params;

  const solution = await AssesmentSolution.findById(solutionId)
    .select("proctoringData ufmAttempts assessmentId")
    .lean();
  if (!solution) return res.status(404).json({ success: false, message: "Solution not found" });

  const pd  = solution.proctoringData || {};
  const aid = solution.assessmentId;

  // Helper: build signed-URL list, falling back to reconstructed keys
  const buildPlayback = async (committed, lastIdx, prefix) => {
    let list = committed || [];
    if (!list.length && lastIdx >= 0) {
      list = Array.from({ length: lastIdx + 1 }, (_, i) => ({
        chunkIndex: i,
        s3Key: `${prefix}/${aid}/${solutionId}/chunk-${i}.webm`,
      }));
    }
    return Promise.all(
      list.map(async (chunk) => {
        try {
          const cmd = new GetObjectCommand({ Bucket: config.aws.bucket, Key: chunk.s3Key });
          const url = await getSignedUrl(s3, cmd, { expiresIn: config.aws.getExpiry });
          return { chunkIndex: chunk.chunkIndex, url, expiresIn: config.aws.getExpiry };
        } catch {
          return { chunkIndex: chunk.chunkIndex, url: null };
        }
      }),
    );
  };

  const [playback, screenPlayback] = await Promise.all([
    buildPlayback(pd.chunks, pd.lastKnownChunkIndex, "recordings"),
    buildPlayback(pd.screenChunks, pd.screenLastKnownChunkIndex, "screen-recordings"),
  ]);

  return res.json({
    solutionId,
    violationCount:       pd.violationCount || 0,
    recordingStatus:      pd.recordingStatus,
    recordingStartedAt:   pd.recordingStartedAt,
    recordingEndedAt:     pd.recordingEndedAt,
    screenRecordingStatus: pd.screenRecordingStatus,
    logs:                 pd.logs || [],
    playback,
    screenPlayback,
  });
};
