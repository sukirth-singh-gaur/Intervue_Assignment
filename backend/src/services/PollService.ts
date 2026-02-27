import { Poll, IPoll } from '../models/Poll.js';
import { Vote } from '../models/Vote.js';
import { Student } from '../models/Student.js';
import mongoose from 'mongoose';

export class PollService {

    static async createPoll(question: string, options: { text: string, isCorrect?: boolean }[], duration: number): Promise<IPoll> {
        // Check if there is an active poll
        const existingActive = await Poll.findOne({ status: 'active' });
        if (existingActive) {
            throw new Error('A poll is already active');
        }

        const poll = new Poll({
            question,
            options: options.map(opt => ({ ...opt, voteCount: 0 })),
            duration,
            startTime: new Date(),
            status: 'active'
        });
        return poll.save();
    }

    static async getActivePoll(): Promise<IPoll | null> {
        return Poll.findOne({ status: 'active' });
    }

    static async getAllPolls(): Promise<IPoll[]> {
        return Poll.find().sort({ createdAt: -1 });
    }

    static async submitVote(pollId: string, optionId: string, studentSessionId: string): Promise<IPoll> {
        const poll = await Poll.findById(pollId);
        if (!poll) throw new Error('Poll not found');
        if (poll.status !== 'active') throw new Error('Poll is closed');

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Check for duplicate vote
            const existingVote = await Vote.findOne({ pollId, studentSessionId }).session(session);
            if (existingVote) throw new Error('Student has already voted');

            // Create vote
            const vote = new Vote({ pollId, optionId, studentSessionId });
            await vote.save({ session });

            // Increment poll option vote count
            await Poll.updateOne(
                { _id: pollId, "options._id": optionId },
                { $inc: { "options.$.voteCount": 1 } },
                { session }
            );

            await session.commitTransaction();

            const updatedPoll = await Poll.findById(pollId);
            return updatedPoll!;
        } catch (err: any) {
            await session.abortTransaction();
            throw err;
        } finally {
            session.endSession();
        }
    }

    static async closePoll(pollId: string): Promise<IPoll | null> {
        return Poll.findByIdAndUpdate(pollId, { status: 'closed' }, { returnDocument: 'after'});
    }

}
