import { Proposer } from "@/utils/galeShapley";

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  matches: Proposer[];
  message: string;
}

export default function MatchModal({
  isOpen,
  onClose,
  matches,
  message,
}: MatchModalProps) {
  if (!isOpen) return null;
  const allStudents = Object.values(matches).flat();
  allStudents.sort((a, b) => {
    const nameA = a.proposerName.toLowerCase();
    const nameB = b.proposerName.toLowerCase();
    return nameA.localeCompare(nameB);
  });
  const calculateAverageProposerHappiness = (students: Proposer[]): number => {
    const matchedStudents = students.filter((s) => {
      return message === "original" ? s.current >= 0 : s.origcurrent >= 0;
    });
    if (matchedStudents.length === 0) return 0;

    const totalHappiness = matchedStudents.reduce((sum, student) => {
      return message === "original"
        ? sum + student.origcurrent + 1
        : sum + student.current + 1;
    }, 0);

    return totalHappiness / matchedStudents.length;
  };
  const CalculateEnergies = (): number => {
    const allStudents = Object.values(matches).flat();
    allStudents.sort((a, b) => {
      const nameA = a.proposerName.toLowerCase();
      const nameB = b.proposerName.toLowerCase();
      return nameA.localeCompare(nameB);
    });
    const totalHappiness = allStudents.reduce((sum, student) => {
      return message === "original"
        ? sum + student.origcurrent + 1 + student.OrigPositionToMatch
        : sum + student.current + 1 + student.PositionToMatch;
    }, 0);
    return totalHappiness / allStudents.length;
  };
  const calculateAverageAcceptorHappiness = (students: Proposer[]): number => {
    const matchedStudents = students.filter((s) => s.PositionToMatch >= 0);
    if (matchedStudents.length === 0) return 0;

    const totalHappiness = matchedStudents.reduce((sum, student) => {
      return message === "original"
        ? sum + student.OrigPositionToMatch
        : sum + student.PositionToMatch;
    }, 0);
    console.log(totalHappiness, matchedStudents.length);
    return totalHappiness / matchedStudents.length;
  };
  return (
    <div className="fixed inset-0 bg-black/50  flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Student-Course Matching Results</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        <div className="overflow-y-auto p-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left border">Student</th>
                <th className="p-3 text-left border">Matched Course</th>
                <th className="p-3 text-left border">
                  Student&apos;s Preference Position
                </th>
                <th className="p-3 text-left border">
                  Course&apos;s Preference Position
                </th>
                <th className="p-3 text-left border">Match Score</th>
              </tr>
            </thead>
            <tbody>
              {allStudents.map((student) => (
                <tr
                  key={student.proposerName}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-3 border">{student.proposerName}</td>
                  <td className="p-3 border">{student.pref[0]}</td>
                  <td className="p-3 border">{student.current + 1}</td>
                  <td className="p-3 border">{student.PositionToMatch}</td>
                  <td className="p-3 border">
                    {message === "original"
                      ? student.origcurrent + 1 + student.OrigPositionToMatch
                      : student.current + 1 + student.PositionToMatch}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-row w-full justify-between items-center p-4 border-t">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Average Regret Scores</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded border">
                <h4 className="font-medium text-gray-700">
                  Proposers (Students)
                </h4>
                <p className="text-2xl font-bold text-blue-600">
                  {calculateAverageProposerHappiness(allStudents).toFixed(2)}
                </p>
              </div>
              <div className="bg-white p-3 rounded border">
                <h4 className="font-medium text-gray-700">
                  Acceptors (Courses)
                </h4>
                <p className="text-2xl font-bold text-green-600">
                  {calculateAverageAcceptorHappiness(allStudents).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Average Energy scores</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded border">
                <h4 className="font-medium text-gray-700">
                  Proposers (Students)
                </h4>
                <p className="text-2xl font-bold text-blue-600">
                  {CalculateEnergies().toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 border-t flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {matches.length} matches
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
