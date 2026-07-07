import mongoose, { Schema, Document, Model } from 'mongoose';

export type DemandLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type MarketOutlook = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

export interface IIndustryInsight extends Document {
  industry: string;
  salaryRanges: Array<{
    role: string;
    min: number;
    max: number;
    median: number;
    currency?: string;
  }>;
  growthRate: number;
  demandLevel: DemandLevel;
  topSkills: string[];
  marketOutlook: MarketOutlook;
  keyTrends: string[];
  recommendedSkills: string[];
  lastUpdated: Date;
  nextUpdate: Date;
}

const IndustryInsightSchema = new Schema<IIndustryInsight>(
  {
    industry: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    salaryRanges: {
      type: [
        {
          role: { type: String, required: true },
          min: { type: Number, required: true },
          max: { type: Number, required: true },
          median: { type: Number, required: true },
          currency: { type: String, default: 'USD' },
        },
      ],
      default: [],
    },
    growthRate: {
      type: Number,
      required: true,
    },
    demandLevel: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW'],
      required: true,
    },
    topSkills: {
      type: [String],
      default: [],
    },
    marketOutlook: {
      type: String,
      enum: ['POSITIVE', 'NEUTRAL', 'NEGATIVE'],
      required: true,
    },
    keyTrends: {
      type: [String],
      default: [],
    },
    recommendedSkills: {
      type: [String],
      default: [],
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    nextUpdate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for industry queries
IndustryInsightSchema.index({ industry: 1 });

export const IndustryInsight: Model<IIndustryInsight> = mongoose.models.IndustryInsight || mongoose.model<IIndustryInsight>('IndustryInsight', IndustryInsightSchema);