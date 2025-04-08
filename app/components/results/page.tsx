import { Proposer } from "@/utils/galeShapley";
interface CourseTableProps {
  data: Proposer[];
  message: string;
}
function CourseTable({ data, message }: CourseTableProps) {
  const allStudents = Object.values(data).flat();
  allStudents.sort((a, b) => {
    const nameA = a.proposerName.toLowerCase();
    const nameB = b.proposerName.toLowerCase();
    return nameA.localeCompare(nameB);
  });
  if (allStudents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No student data available
      </div>
    );
  } else {
    console.log(allStudents);
  }

  return (
    <div className="overflow-x-auto rounded-lg border shadow-sm max-w-2xl mx-auto min-w-full max-h-[600px]">
      <table className="min-w-full divide-y divide-gray-200 ">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Student
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">
              Course
            </th>
            {message === "modified" && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-80">
                Student&apos;s Prefefence
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {allStudents.map((student) => (
            <tr key={student.proposerName} className="hover:bg-gray-100">
              <td className="px-6 py-4 whitespace-nowrap font-medium">
                {student.proposerName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-blue-600 font-medium">
                {message === "original" ? student.origpref[0] : student.pref[0]}
              </td>
              {message === "modified" && (
                <td className="px-6 py-4 whitespace-nowrap">
                  {student.currentMaut}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CourseTable;
