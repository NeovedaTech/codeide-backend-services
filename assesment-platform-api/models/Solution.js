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

const AssesmentSolutionSchema = new Schema({
  userId : {type: mongoose.Schema.ObjectId , ref : 'Users'}, 
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
  certificateSent: {type:Boolean, default:false}
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