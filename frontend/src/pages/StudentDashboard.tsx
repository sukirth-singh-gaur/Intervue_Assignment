import { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { usePollContext } from '../context/PollContext';
import { usePollTimer } from '../hooks/usePollTimer';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const socket = useSocket();
  const { poll, sessionId, setSessionId, studentName, setStudentName, kickedOut, error } = usePollContext();
  const timeLeft = usePollTimer();
  const navigate = useNavigate();
  
  const [nameInput, setNameInput] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Initialize session
  useEffect(() => {
    if (!sessionId) {
      const existingSession = sessionStorage.getItem('studentSessionId');
      if (existingSession) {
        setSessionId(existingSession);
      } else {
        const newSession = Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem('studentSessionId', newSession);
        setSessionId(newSession);
      }
    }
    
    // Resume session if name is in session storage
    if (!studentName) {
      const existingName = sessionStorage.getItem('studentName');
      if (existingName) {
        setStudentName(existingName);
      }
    }
  }, [sessionId, studentName, setSessionId, setStudentName]);

  const handleJoin = () => {
    if (nameInput.trim()) {
      sessionStorage.setItem('studentName', nameInput.trim());
      setStudentName(nameInput.trim());
    }
  };

  const handleSubmitVote = () => {
    if (!selectedOption || !poll || !sessionId) return;
    
    socket?.emit('submit_vote', {
      pollId: poll._id,
      optionId: selectedOption,
      studentSessionId: sessionId
    });
    setHasSubmitted(true);
  };

  // Reset submission state when a new poll starts
  useEffect(() => {
    if (poll?.status === 'active' && timeLeft > 0 && !hasSubmitted) {
      // Logic for new poll resets
      setSelectedOption(null);
      setHasSubmitted(false);
    }
  }, [poll?._id]);

  if (kickedOut) {
    return (
      <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center p-4">
         <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-12 text-center">
            <div className="bg-[#7755DA] text-white px-3 py-1 rounded-full text-xs font-semibold mb-6 mx-auto inline-block">
              Intervue Poll
            </div>
            <h1 className="text-2xl font-bold text-[#373737] mb-2">You've been Kicked out !</h1>
            <p className="text-[#6E6E6E] text-sm">
              Looks like the teacher had removed you from the poll system. Please Try again sometime.
            </p>
         </div>
      </div>
    );
  }

  // 1. Onboarding (Name Entry)
  if (!studentName) {
    return (
      <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center p-4">
         <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-12 text-center flex flex-col items-center relative">
            
            <div className="absolute top-8 right-8 text-red-500 text-sm">{error}</div>
            
            <div className="bg-[#7755DA] text-white px-3 py-1 rounded-full text-xs font-semibold mb-6 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border border-white"></span>
              Intervue Poll
            </div>

            <h1 className="text-3xl font-bold text-[#373737] mb-4">Let's Get Started</h1>
            <p className="text-[#6E6E6E] text-sm mb-10 max-w-md leading-relaxed">
              If you're a student, you'll be able to submit your answers, participate in live polls, and see how your responses compare with your classmates.
            </p>

            <div className="w-full max-w-xs text-left mb-8">
              <label className="text-sm font-bold text-[#373737] block mb-2">Enter your Name</label>
              <input 
                type="text" 
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Rahul Bajaj"
                className="w-full bg-[#F2F2F2] rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#7755DA]"
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              />
            </div>

            <button 
              onClick={handleJoin}
              disabled={!nameInput.trim()}
              className="bg-[#7755DA] text-white font-medium py-3 px-16 rounded-full hover:bg-[#5757D0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Continue
            </button>
         </div>
      </div>
    );
  }

  // 2. Waiting State
  if (!poll || poll.status === 'closed') {
    return (
      <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center p-4">
         <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl p-24 text-center flex flex-col items-center">
            <div className="bg-[#7755DA] text-white px-3 py-1 rounded-full text-xs font-semibold mb-8 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border border-white"></span>
              Intervue Poll
            </div>

            <div className="w-12 h-12 border-4 border-[#F2F2F2] border-t-[#7755DA] rounded-full animate-spin mb-6"></div>
            
            <h2 className="text-xl font-bold text-[#373737]">
              Wait for the teacher to ask questions..
            </h2>
         </div>
      </div>
    );
  }

  // 3. Active Poll / Results View
  const isSubmissionPhase = timeLeft > 0 && !hasSubmitted;

  return (
    <div className="min-h-screen bg-[#F2F2F2] p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-8 relative">
        <div className="absolute top-8 right-8 text-red-500 text-sm">{error}</div>
        
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-xl font-bold text-[#373737]">Question</h2>
          {timeLeft > 0 ? (
            <div className="text-red-500 font-bold flex items-center gap-2">
              ⏱ {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          ) : (
            <div className="text-red-500 font-bold flex items-center gap-2">
              ⏱ Time's up
            </div>
          )}
        </div>
        
        <div className="bg-[#6E6E6E] text-white p-4 rounded-t-lg font-medium">
          {poll.question}
        </div>
        
        <div className="border border-gray-200 border-t-0 rounded-b-lg p-6 space-y-4">
          {poll.options.map((opt, i) => {
            const totalVotes = poll.options.reduce((sum, o) => sum + o.voteCount, 0);
            const percentage = totalVotes > 0 ? Math.round((opt.voteCount / totalVotes) * 100) : 0;
            const isSelected = selectedOption === opt._id;

            if (isSubmissionPhase) {
              // Voting Mode
              return (
                <label 
                  key={opt._id} 
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'border-[#7755DA] bg-[#F8F6FE]' : 'border-gray-200 hover:border-[#7755DA]'
                  }`}
                  onClick={() => setSelectedOption(opt._id)}
                >
                  <div className={`w-5 h-5 rounded-full border border-[#7755DA] flex items-center justify-center ${isSelected ? '' : 'bg-white'}`}>
                    {isSelected && <div className="w-3 h-3 rounded-full bg-[#7755DA]"></div>}
                  </div>
                  <span>{opt.text}</span>
                </label>
              );
            } else {
              // Results Mode
              return (
                <div key={opt._id} className="relative h-12 border border-gray-200 rounded-lg flex items-center overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-[#7755DA] transition-all duration-500 opacity-20"
                    style={{ width: `${percentage}%` }}
                  />
                  <div className="flex justify-between w-full px-4 relative z-10 items-center">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#7755DA] text-white flex items-center justify-center text-xs">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span>{opt.text}</span>
                    </div>
                    <span className="font-bold">{percentage}%</span>
                  </div>
                </div>
              );
            }
          })}
        </div>

        {isSubmissionPhase ? (
          <div className="mt-8 flex justify-end">
            <button 
              onClick={handleSubmitVote}
              disabled={!selectedOption}
              className="bg-[#7755DA] text-white font-medium py-2 px-10 rounded-full hover:bg-[#5757D0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Submit
            </button>
          </div>
        ) : (
          <div className="mt-12 text-center text-[#373737] font-medium">
            Wait for the teacher to ask a new question..
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
