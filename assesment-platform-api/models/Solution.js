import mongoose, {  Schema } from "mongoose";

const SectionResponseSchema = new Schema({
  sectionId: { type: Schema.Types.ObjectId, required: true },
  sectionType: { type: String, enum: ['quiz', 'coding'], required: true },
  quizAnswers: {type:[mongoose.Schema.Types.Mixed] , default:[]},
  codingAnswers: {type:[mongoose.Schema.Types.Mixed], default:[]},
  totalQuestions  : {type:Number,default:-1},
  correctAnswers:{type:Number,default:-1},
  startedAt: {type:Date},
  pausedAt: {type:Date},
  durationUnavailaible : {type:Date},
  isSubmitted:{ type:Boolean,default:false},
});

const ProctoringLogSchema = new Schema({
  eventType: {
    type: String,
    enum: ["tab_switch", "window_blur", "devtools", "keystroke", "fullscreen_exit", "session_end", "reconnect", "no_face", "multiple_faces"],
    required: true,
  },
  timestamp: { type: Date, required: true },
  detail:    { type: String },
}, { _id: false });

const RecordingChunkSchema = new Schema({
  chunkIndex: { type: Number, required: true },
  s3Key:      { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
}, { _id: false });

const ProctoringDataSchema = new Schema({
  isProctored:         { type: Boolean, default: false },
  isAvEnabled:         { type: Boolean, default: false },
  isScreenCapture:     { type: Boolean, default: false },
  isEnabled:           { type: Boolean, default: false },
  // Camera / mic recording
  recordingStatus: {
    type: String,
    enum: ["not_started", "active", "interrupted", "completed", "n/a"],
    default: "n/a",
  },
  lastKnownChunkIndex: { type: Number, default: -1 },
  sessionCount:        { type: Number, default: 0 },
  recordingStartedAt:  { type: Date },
  recordingEndedAt:    { type: Date },
  chunks:              [RecordingChunkSchema],
  // Screen recording
  screenRecordingStatus: {
    type: String,
    enum: ["not_started", "active", "interrupted", "completed", "n/a"],
    default: "n/a",
  },
  screenLastKnownChunkIndex: { type: Number, default: -1 },
  screenChunks:              [RecordingChunkSchema],
  logs:                [ProctoringLogSchema],
  violationCount:      { type: Number, default: 0 },
}, { _id: false });

const AssesmentSolutionSchema = new Schema({
  userId : {type: mongoose.Schema.ObjectId , ref : 'User'},
  assessmentId : {type:mongoose.Schema.ObjectId, ref: 'Assesment'},
  currSection : {type : Number , default: 0},
  ufmAttempts: {type : Number, default: 0},
  assesmentSnapshot: {type:[mongoose.Schema.Types.Mixed] , default:[]},
  response: [SectionResponseSchema],
  hasAgreed: {type:Boolean , default:false},
  isSubmitted: {type:Boolean, default:false},
  userDetails:[mongoose.Schema.Types.Mixed],
  isEvaluated: {type:Boolean , default:false},
  feedback:[mongoose.Schema.Types.Mixed],
  notified: {type:Boolean,default:false},
  certificateSent: {type:Boolean, default:false},
  proctoringData: { type: ProctoringDataSchema, default: () => ({}) },
},
{
  timestamps:true
});
AssesmentSolutionSchema.index({
  userId: 1,
  assesmentId: 1,
})
const AssesmentSolution =  mongoose.model('AssesmentSolution', AssesmentSolutionSchema);  //
export default AssesmentSolution;