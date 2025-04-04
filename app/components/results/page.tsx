import { Proposer } from "@/utils/galeShapley";

function CourseTable(data: Record<string, Proposer[]>) {
  const allStudents = Object.values(data).flat();

  if (allStudents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No student data available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border shadow-sm max-w-2xl mx-auto min-w-full">
      <table className="min-w-full divide-y divide-gray-200 ">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Student
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">
              Course
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-80">
              Student&apos;s Prefefence
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {allStudents.map((student) => (
            <tr key={student.proposerName} className="hover:bg-gray-100">
              <td className="px-6 py-4 whitespace-nowrap font-medium">
                {student.proposerName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-blue-600 font-medium">
                {student.pref[0]}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {/* {student.current + 1} */}
                {student.currentMaut}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CourseTable;
