import mongoose, { Schema, Document } from 'mongoose';

export interface IVote extends Document {
    pollId: mongoose.Types.ObjectId;
    optionId: mongoose.Types.ObjectId;
    studentSessionId: string;
    createdAt: Date;
}

const VoteSchema = new Schema({
    pollId: { type: Schema.Types.ObjectId, ref: 'Poll', required: true },
    optionId: { type: Schema.Types.ObjectId, required: true },
    studentSessionId: { type: String, required: true }
}, { timestamps: true });

// Ensure a student can only vote once per poll
VoteSchema.index({ pollId: 1, studentSessionId: 1 }, { unique: true });

export const Vote = mongoose.model<IVote>('Vote', VoteSchema);
