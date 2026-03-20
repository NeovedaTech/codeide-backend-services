import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters long'],
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                'Please provide a valid email address',
            ],
        },
        password: {
            type: String,
            required: false, // Optional for existing simple flow
        },
        skillLevel: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            required: [true, 'Skill level is required'],
        },
        assessmentId: {
            type: String,
            required: true,
        },
        assessmentStatus: {
            type: String,
            enum: ['not_started', 'in_progress', 'completed'],
            default: 'not_started',
        },
        startedAt: {
            type: Date,
            default: null,
        },
        completedAt: {
            type: Date,
            default: null,
        },
        score: {
            type: Number,
            default: null,
        },
        totalScore: {
            type: Number,
            default: null,
        },
        responseData: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        
    },
    {
        timestamps: true, // Adds createdAt and updatedAt automatically
    }
);

// Index for faster queries
userSchema.index({ createdAt: -1 });

// // Pre-save hook for additional validation
// userSchema.pre('save', function (next) {
//     if (this.isModified('email')) {
//         this.email = this.email.toLowerCase().trim();
//     }
//     next();
// });

// Method to update assessment status
userSchema.methods.updateAssessmentStatus = function (status, data = null) {
    this.assessmentStatus = status;
    
    if (status === 'in_progress' && !this.startedAt) {
        this.startedAt = new Date();
    }
    
    if (status === 'completed') {
        this.completedAt = new Date();
        if (data) {
            this.score = data.score;
            this.totalScore = data.totalScore;
            this.responseData = data.responseData;
        }
    }
    
    return this.save();
};

// Static method to find user by email or userId
userSchema.statics.findByIdentifier = function (identifier) {
    if (identifier.includes('@')) {
        return this.findOne({ email: identifier.toLowerCase() });
    }
    return this.findOne({ userId: identifier });
};

const User = mongoose.model('User', userSchema);

export default User;