import { Student } from '../models/Student.js';

export class StudentService {

    static async registerStudent(sessionId: string, name: string): Promise<boolean> {
        // Return false if student was kicked
        const existingStudent = await Student.findOne({ sessionId });
        if (existingStudent && existingStudent.isKicked) {
            return false;
        }

        await Student.findOneAndUpdate(
            { sessionId },
            { name, joinedAt: new Date(), isActive: true },
            { upsert: true }
        );
        return true;
    }

    static async updateSocketId(sessionId: string, socketId: string): Promise<void> {
        await Student.updateOne({ sessionId }, { socketId });
    }

    static async setInactiveBySocketId(socketId: string): Promise<void> {
        await Student.updateOne({ socketId }, { isActive: false });
    }

    static async getActiveStudents(): Promise<{ name: string; sessionId: string }[]> {
        return Student.find({ isActive: true, isKicked: false }, 'name sessionId').sort({ joinedAt: 1 });
    }

    static async kickStudent(sessionId: string): Promise<void> {
        await Student.updateOne({ sessionId }, { isKicked: true, isActive: false });
    }
}
