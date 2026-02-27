import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePollContext } from '../context/PollContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { setRole } = usePollContext();
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'student' | null>(null);

  const handleContinue = () => {
    if (selectedRole) {
      setRole(selectedRole);
      navigate(`/${selectedRole}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl p-10 flex flex-col items-center">
        
        {/* Logo area */}
        <div className="bg-[#7755DA] text-white px-5 py-1.5 rounded-full text-xs font-semibold mb-8 flex items-center gap-2">
          <span className="w-4 h-4 rounded-full border-2 border-white"></span>
          Intervue Poll
        </div>

        <h1 className="text-3xl font-bold text-[#373737] mb-3">
          Welcome to the <span className="text-[#373737]">Live Polling System</span>
        </h1>
        <p className="text-[#6E6E6E] mb-12 max-w-md text-center">
          Please select the role that best describes you to begin using the live polling system
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-10">
          
          <button 
            onClick={() => setSelectedRole('student')}
            className={`flex flex-col items-start text-left p-6 border-2 rounded-lg transition-all ${
              selectedRole === 'student' ? 'border-[#7755DA] shadow-md' : 'border-gray-200 hover:border-[#7755DA] hover:shadow-sm'
            }`}
          >
            <h2 className="text-xl font-bold text-[#373737] mb-2">I'm a Student</h2>
            <p className="text-[#6E6E6E] text-sm">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry.
            </p>
          </button>

          <button 
            onClick={() => setSelectedRole('teacher')}
            className={`flex flex-col items-start text-left p-6 border-2 rounded-lg transition-all ${
              selectedRole === 'teacher' ? 'border-[#7755DA] shadow-md' : 'border-gray-200 hover:border-[#7755DA] hover:shadow-sm'
            }`}
          >
            <h2 className="text-xl font-bold text-[#373737] mb-2">I'm a Teacher</h2>
            <p className="text-[#6E6E6E] text-sm">
              Submit answers and view live poll results in real-time.
            </p>
          </button>

        </div>

        <button 
          onClick={handleContinue}
          disabled={!selectedRole}
          className="bg-[#7755DA] text-white font-medium py-3 px-16 rounded-full hover:bg-[#5757D0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue
        </button>

      </div>
    </div>
  );
};

export default LandingPage;
