import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    email: string;
    name?: string;
    imageUrl?: string;
    industry?: string;
    subIndustry?: string; // ✅ Add this
    bio?: string;
    experience?: number;
    skills: string[];
    isOnboarded?: boolean; // ✅ Add this
    password?: string; // For custom auth
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            trim: true,
            select: false
        },
        name: {
            type: String,
            trim: true,
        },
        industry: {
            type: String,
            ref: 'IndustryInsight',
        },
        subIndustry: {
            type: String,
            trim: true,
        },
        bio: {
            type: String,
        },
        experience: {
            type: Number,
            min: 0,
        },
        skills: {
            type: [String],
            default: [],
        },
        isOnboarded: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password as string, 10)
})

UserSchema.methods = {
    comparePassword: async function (password: string) {
        return await bcrypt.compare(password, this.password)
    }
}

export const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);