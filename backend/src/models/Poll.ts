import mongoose, { Schema, Document } from 'mongoose';

export interface IOption {
    _id?: string;
    text: string;
    isCorrect?: boolean;
    voteCount: number;
}

export interface IPoll extends Document {
    question: string;
    options: IOption[];
    duration: number; // in seconds
    startTime?: Date;
    status: 'active' | 'closed';
    createdAt: Date;
}

const OptionSchema = new Schema({
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false },
    voteCount: { type: Number, default: 0 }
});

const PollSchema = new Schema({
    question: { type: String, required: true },
    options: [OptionSchema],
    duration: { type: Number, required: true, default: 60 },
    startTime: { type: Date },
    status: { type: String, enum: ['active', 'closed'], default: 'active' }
}, { timestamps: true });

export const Poll = mongoose.model<IPoll>('Poll', PollSchema);
