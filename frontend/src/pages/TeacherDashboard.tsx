import { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { usePollContext } from '../context/PollContext';
import { usePollTimer } from '../hooks/usePollTimer';

const TeacherDashboard = () => {
  const socket = useSocket();
  const { poll, students, error, role, setRole } = usePollContext();
  const timeLeft = usePollTimer();
  
    // Restore role on reload
  useEffect(() => {
    if (role !== 'teacher') {
      setRole('teacher');
    }
  }, [role, setRole]);

  const [question, setQuestion] = useState('');
  const [duration, setDuration] = useState(60);
  const [options, setOptions] = useState([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false }
  ]);
  const [showHistory, setShowHistory] = useState(false);
  const [pollHistory, setPollHistory] = useState<any[]>([]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5010'}/api/polls/history`);
      if (res.ok) {
        const data = await res.json();
        setPollHistory(data);
        setShowHistory(true);
      }
    } catch (e) {
      console.error('Failed to fetch history', e);
    }
  };

  const handleAddOption = () => {
    setOptions([...options, { text: '', isCorrect: false }]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
  };

  const handleIsCorrectChange = (index: number, isCorrect: boolean) => {
    const newOptions = [...options];
    newOptions[index].isCorrect = isCorrect;
    setOptions(newOptions);
  };

  const askQuestion = () => {
    if (!question.trim() || options.some(opt => !opt.text.trim())) return;
    
    socket?.emit('ask_question', {
      question,
      options: options.map(o => ({ text: o.text, isCorrect: o.isCorrect })),
      duration
    });
  };

  const canAskNewQuestion = !poll || poll.status === 'closed' || timeLeft === 0;

  if (poll && poll.status === 'active' && !showHistory) {
    return (
      <div className="min-h-screen bg-[#F2F2F2] p-8">
        <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center">
          <div className="bg-[#7755DA] text-white px-3 py-1 rounded-full text-xs font-semibold inline-block">
            Intervue Poll
          </div>
          <button 
            onClick={fetchHistory}
            className="text-sm font-semibold text-white bg-[#7755DA] py-1.5 px-4 rounded-full hover:bg-[#5757D0] transition-colors"
          >
            ◉ View Poll History
          </button>
        </div>
        
        {/* Active Poll View */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 bg-white rounded-xl shadow p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#373737]">Question</h2>
              <div className="text-red-500 font-bold flex items-center gap-1">
                ⏱ {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>
            
            <div className="bg-[#6E6E6E] text-white p-4 rounded-t-lg font-medium">
              {poll.question}
            </div>
            
            <div className="border border-gray-200 border-t-0 rounded-b-lg p-6 space-y-4">
              {poll.options.map((opt, i) => {
                const totalVotes = poll.options.reduce((sum, o) => sum + o.voteCount, 0);
                const percentage = totalVotes > 0 ? Math.round((opt.voteCount / totalVotes) * 100) : 0;
                
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
              })}
            </div>

            <div className="mt-8 text-center text-[#6E6E6E]">
              {canAskNewQuestion ? (
                <button 
                  onClick={() => {
                    socket?.emit('close_poll', { pollId: poll._id });
                    setQuestion('');
                    setOptions([{ text: '', isCorrect: false }, { text: '', isCorrect: false }]);
                  }}
                  className="bg-[#7755DA] text-white font-medium py-2 px-6 rounded-full hover:bg-[#5757D0] transition-colors"
                >
                  + Ask a new question
                </button>
              ) : (
                <p>Wait for the students to answer...</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="bg-white rounded-xl shadow flex flex-col overflow-hidden h-full">
            <div className="flex border-b">
              <button className="flex-1 py-3 px-4 text-center font-medium border-b-2 border-[#7755DA] text-[#7755DA]">
                Chat
              </button>
              <button className="flex-1 py-3 px-4 text-center font-medium text-gray-500 hover:text-gray-700">
                Participants
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              {/* Chat implementation placeholder */}
              <div className="flex flex-col gap-2 h-full">
                <div className="text-xs text-gray-400 text-center mb-2">Live Chat</div>
                <div className="bg-[#F2F2F2] p-2 rounded-lg text-sm max-w-[80%] self-start">
                  <span className="font-bold text-xs text-gray-500 block">System</span>
                  Welcome to the live chat!
                </div>
              </div>
            </div>
            <div className="p-4 border-t">
              <input 
                type="text" 
                placeholder="Message here..." 
                className="w-full bg-[#F2F2F2] rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#7755DA]" 
              />
            </div>
          </div>

        </div>
      </div>
    );
  }

  // History View
  if (showHistory) {
    return (
      <div className="min-h-screen bg-[#F2F2F2] p-8 flex justify-center">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl p-8 relative">
          
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-[#373737]">View Poll History</h1>
            <button 
              onClick={() => setShowHistory(false)}
              className="text-[#6E6E6E] hover:text-[#373737]"
            >
              ✕ Close
            </button>
          </div>

          <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2">
            {pollHistory.map((pastPoll, idx) => (
              <div key={pastPoll._id} className="mb-6">
                <h3 className="font-bold text-[#373737] mb-3">Question {pollHistory.length - idx}</h3>
                <div className="bg-[#6E6E6E] text-white p-4 rounded-t-lg font-medium">
                  {pastPoll.question}
                </div>
                <div className="border border-gray-200 border-t-0 rounded-b-lg p-6 space-y-4">
                  {pastPoll.options.map((opt: any, i: number) => {
                    const totalVotes = pastPoll.options.reduce((sum: number, o: any) => sum + o.voteCount, 0);
                    const percentage = totalVotes > 0 ? Math.round((opt.voteCount / totalVotes) * 100) : 0;
                    
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
                  })}
                </div>
              </div>
            ))}
            
            {pollHistory.length === 0 && (
              <div className="text-center text-[#6E6E6E] py-10">
                No past polls found.
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F2] p-8 flex justify-center">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl p-8 relative">
            <div className="absolute top-8 right-8 text-red-500 text-sm">{error}</div>

        <div className="flex justify-between items-center mb-6">
          <div className="bg-[#7755DA] text-white px-3 py-1 rounded-full text-xs font-semibold inline-block">
            Intervue Poll
          </div>
          <button 
            onClick={fetchHistory}
            className="text-sm font-semibold text-white bg-[#7755DA] py-1.5 px-4 rounded-full hover:bg-[#5757D0] transition-colors"
          >
            ◉ View Poll History
          </button>
        </div>

        <h1 className="text-2xl font-bold text-[#373737] mb-2">Let's Get Started</h1>
        <p className="text-[#6E6E6E] text-sm mb-8">
          You'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
        </p>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-[#373737]">Enter your question</label>
              <select 
                value={duration} 
                onChange={(e) => setDuration(Number(e.target.value))}
                className="text-sm text-gray-500 bg-transparent border-none focus:ring-0 cursor-pointer"
              >
                <option value={30}>30 seconds</option>
                <option value={60}>60 seconds</option>
                <option value={90}>90 seconds</option>
                <option value={120}>120 seconds</option>
              </select>
            </div>
            <textarea 
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Which planet is known as the Red Planet?"
              className="w-full bg-[#F2F2F2] rounded-lg p-4 h-24 focus:outline-none focus:ring-1 focus:ring-[#7755DA]"
            />
          </div>

          <div>
            <div className="flex justify-between items-center text-sm font-bold text-[#373737] mb-4">
              <span>Edit Options</span>
              <span>Is it Correct?</span>
            </div>
            
            <div className="space-y-3">
              {options.map((opt, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#7755DA] text-white text-xs shrink-0">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <input 
                    type="text" 
                    value={opt.text}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-[#7755DA]"
                  />
                  <div className="flex items-center gap-4 w-32 shrink-0">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name={`correct-${index}`} 
                        checked={opt.isCorrect} 
                        onChange={() => handleIsCorrectChange(index, true)}
                        className="text-[#7755DA] focus:ring-[#7755DA]"
                      />
                      <span className="text-sm">Yes</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name={`correct-${index}`} 
                        checked={!opt.isCorrect} 
                        onChange={() => handleIsCorrectChange(index, false)}
                        className="text-[#7755DA] focus:ring-[#7755DA]"
                      />
                      <span className="text-sm">No</span>
                    </label>
                  </div>
                  {options.length > 2 && (
                    <button 
                      onClick={() => handleRemoveOption(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button 
              onClick={handleAddOption}
              className="mt-4 text-[#7755DA] text-sm font-medium border border-[#7755DA] rounded-full px-4 py-1.5 hover:bg-[#7755DA] hover:text-white transition-colors"
            >
              + Add More Option
            </button>
          </div>
        </div>

        <div className="flex justify-end mt-12">
          <button 
            onClick={askQuestion}
            disabled={!question.trim() || options.some(opt => !opt.text.trim())}
            className="bg-[#7755DA] text-white font-medium py-3 px-8 rounded-full hover:bg-[#5757D0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Ask Question
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
