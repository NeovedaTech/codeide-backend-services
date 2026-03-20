import { Schema } from 'mongoose'

const OptionSchema = new Schema({
  text: { type: String, required: false },
  image: { type: String, required: false },
  isCorrect: { type: Boolean, default: false }
})

const QuestionSchema = new Schema({
  question: {
    type: String,
    required: [true, 'Question text is required']
  },
  image: {
    type: String
  },
  marks: {
    type: Number,
    required: [true, 'Marks are required'],
    min: [0, 'Marks cannot be negative']
  },
  negative: {
    type: Number,
    default: 0
  },
  topic: {
    type: String
  },
  category: {
    type: String,
    enum: ['MCQ', 'MSQ', 'Text'],
    default: 'MCQ',
    required: true
  },
  answer: {
    type: String,
    required: function () {
      return this.category === 'Text'
    },
    validate: {
      validator: function (v) {
        if (this.category !== 'Text') return !v
        return true
      },
      message: 'Answer should be empty for MCQ or MSQ'
    }
  },
  options: {
    type: [OptionSchema],
    default: [],
    validate: {
      validator: function (arr) {
        if (this.category === 'Text') return true

        if (!Array.isArray(arr) || arr.length < 2) return false

        const correctCount = arr.filter(opt => opt.isCorrect).length

        if (this.category === 'MCQ') return correctCount === 1
        if (this.category === 'MSQ') return correctCount >= 1

        return true
      },
      message: function () {
        if (this.category === 'MCQ') {
          return 'MCQ must have exactly one correct option and at least 2 total options'
        } else if (this.category === 'MSQ') {
          return 'MSQ must have at least one correct option and at least 2 total options'
        } else {
          return 'Options must have at least 2 entries for MCQ or MSQ'
        }
      }
    }
  }
})  

export { QuestionSchema }
