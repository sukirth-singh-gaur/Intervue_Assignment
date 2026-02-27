import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
    sessionId: string;
    name: string;
    socketId?: string; // Current active socket connection
    joinedAt: Date;
    isActive: boolean;
    isKicked: boolean;
}

const StudentSchema = new Schema({
    sessionId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    socketId: { type: String },
    joinedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    isKicked: { type: Boolean, default: false }
});

export const Student = mongoose.model<IStudent>('Student', StudentSchema);
