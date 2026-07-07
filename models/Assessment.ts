import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAssessment extends Document {
  userId: string;
  quizScore: number;
  questions: any[];
  category: string;
  improvementTip?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AssessmentSchema = new Schema<IAssessment>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
      ref: 'User',
    },
    quizScore: {
      type: Number,
      required: true,
      min: 0,
    },
    questions: {
      type: [Schema.Types.Mixed] as any, // Type assertion
      required: true,
      default: [],
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    improvementTip: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user + category queries
AssessmentSchema.index({ userId: 1, category: 1 });

export const Assessment: Model<IAssessment> =
  mongoose.models.Assessment ||
  mongoose.model<IAssessment>('Assessment', AssessmentSchema);