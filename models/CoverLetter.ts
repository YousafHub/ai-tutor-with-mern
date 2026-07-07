import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICoverLetter extends Document {
  userId: string;
  content: string;
  jobDescription?: string;
  companyName: string;
  jobTitle: string;
  status: 'draft' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const CoverLetterSchema = new Schema<ICoverLetter>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
      ref: 'User',
    },
    content: {
      type: String,
      required: true,
    },
    jobDescription: {
      type: String,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['draft', 'completed'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user + status queries
CoverLetterSchema.index({ userId: 1, status: 1 });

export const CoverLetter: Model<ICoverLetter> = mongoose.models.CoverLetter || mongoose.model<ICoverLetter>('CoverLetter', CoverLetterSchema);