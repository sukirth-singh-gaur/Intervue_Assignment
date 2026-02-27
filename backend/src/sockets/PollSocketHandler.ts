import { Server, Socket } from "socket.io";
import { PollService } from "../services/PollService.js";
import { StudentService } from "../services/StudentService.js";

export const handleSockets = (io: Server) => {
  io.on("connection", async (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join room setup
    socket.on(
      "join",
      async (data: {
        role: "teacher" | "student";
        name?: string;
        sessionId?: string;
      }) => {
        if (data.role === "student" && data.sessionId && data.name) {
          await StudentService.registerStudent(data.sessionId, data.name);
          await StudentService.updateSocketId(data.sessionId, socket.id);
          socket.join("students");

          // Notify teacher
          const students = await StudentService.getActiveStudents();
          io.to("teacher").emit("students_updated", students);
        } else if (data.role === "teacher") {
          socket.join("teacher");
        }

        // Send active poll state to the newly joined user
        const activePoll = await PollService.getActivePoll();
        if (activePoll) {
          socket.emit("poll_active", activePoll);
        }
      },
    );

    socket.on(
      "ask_question",
      async (data: {
        question: string;
        options: { text: string; isCorrect?: boolean }[];
        duration: number;
      }) => {
        try {
          const poll = await PollService.createPoll(
            data.question,
            data.options,
            data.duration,
          );
          io.emit("poll_active", poll);
        } catch (err: any) {
          socket.emit("error", { message: err.message });
        }
      },
    );

    socket.on(
      "submit_vote",
      async (data: {
        pollId: string;
        optionId: string;
        studentSessionId: string;
      }) => {
        try {
          const poll = await PollService.submitVote(
            data.pollId,
            data.optionId,
            data.studentSessionId,
          );
          io.emit("poll_updated", poll);
        } catch (err: any) {
          socket.emit("error", { message: err.message });
        }
      },
    );

    socket.on("close_poll", async (data: { pollId: string }) => {
      try {
        const poll = await PollService.closePoll(data.pollId);
        io.emit("poll_closed", poll);
      } catch (err: any) {
        socket.emit("error", { message: err.message });
      }
    });

    socket.on("kick_student", async (data: { sessionId: string }) => {
      try {
        await StudentService.removeStudent(data.sessionId);
        io.emit("student_kicked", { sessionId: data.sessionId });
        const students = await StudentService.getActiveStudents();
        io.to("teacher").emit("students_updated", students);
      } catch (err: any) {
        socket.emit("error", { message: "Failed to kick student" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
      // Note: We don't remove student on disconnect to allow state resilience if they refresh
    });
  });
};
