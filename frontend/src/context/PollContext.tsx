import { createContext, useContext, type ReactNode, useState } from 'react';

export interface Option {
  _id: string;
  text: string;
  isCorrect?: boolean;
  voteCount: number;
}

export interface Poll {
  _id: string;
  question: string;
  options: Option[];
  duration: number;
  startTime: string;
  status: 'active' | 'closed';
}

export interface Student {
  sessionId: string;
  name: string;
}

interface PollContextType {
  poll: Poll | null;
  setPoll: (poll: Poll | null) => void;
  students: Student[];
  setStudents: (students: Student[]) => void;
  role: 'teacher' | 'student' | null;
  setRole: (role: 'teacher' | 'student' | null) => void;
  studentName: string | null;
  setStudentName: (name: string | null) => void;
  sessionId: string | null;
  setSessionId: (id: string | null) => void;
  error: string | null;
  setError: (err: string | null) => void;
  kickedOut: boolean;
  setKickedOut: (status: boolean) => void;
}

const PollContext = createContext<PollContextType | undefined>(undefined);

export const PollProvider = ({ children }: { children: ReactNode }) => {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [role, setRole] = useState<'teacher' | 'student' | null>(null);
  const [studentName, setStudentName] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [kickedOut, setKickedOut] = useState(false);

  return (
    <PollContext.Provider value={{
      poll, setPoll,
      students, setStudents,
      role, setRole,
      studentName, setStudentName,
      sessionId, setSessionId,
      error, setError,
      kickedOut, setKickedOut
    }}>
      {children}
    </PollContext.Provider>
  );
};

export const usePollContext = () => {
  const context = useContext(PollContext);
  if (!context) throw new Error('usePollContext must be used within a PollProvider');
  return context;
};
