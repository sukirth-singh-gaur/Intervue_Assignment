import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
    sessionId: string;
    name: string;
    socketId?: string; // Current active socket connection
    joinedAt: Date;
}

const StudentSchema = new Schema({
    sessionId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    socketId: { type: String },
    joinedAt: { type: Date, default: Date.now }
});

export const Student = mongoose.model<IStudent>('Student', StudentSchema);
