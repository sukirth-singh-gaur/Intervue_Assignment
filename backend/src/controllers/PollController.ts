import { Request, Response } from 'express';
import { PollService } from '../services/PollService.js';
import { StudentService } from '../services/StudentService.js';

export class PollController {

    static async getHistory(req: Request, res: Response) {
        try {
            const polls = await PollService.getAllPolls();
            res.json(polls);
        } catch (err) {
            res.status(500).json({ error: 'Failed to fetch poll history' });
        }
    }

    static async getActiveStudents(req: Request, res: Response) {
        try {
            const students = await StudentService.getActiveStudents();
            res.json(students);
        } catch (err) {
            res.status(500).json({ error: 'Failed to fetch active students' });
        }
    }
}
