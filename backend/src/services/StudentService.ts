import { Student } from '../models/Student.js';

export class StudentService {

    static async registerStudent(sessionId: string, name: string): Promise<void> {
        await Student.findOneAndUpdate(
            { sessionId },
            { name, joinedAt: new Date() },
            { upsert: true }
        );
    }

    static async updateSocketId(sessionId: string, socketId: string): Promise<void> {
        await Student.updateOne({ sessionId }, { socketId });
    }

    static async getActiveStudents(): Promise<{ name: string; sessionId: string }[]> {
        return Student.find({}, 'name sessionId').sort({ joinedAt: 1 });
    }

    static async removeStudent(sessionId: string): Promise<void> {
        await Student.deleteOne({ sessionId });
    }
}
