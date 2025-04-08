"use client";
import {
  galeShapley,
  readProposer,
  Proposer,
  excelFile,
} from "@/utils/galeShapley";
import Nav from "@/app/components/nav/page";
import AddFile from "@/app/components/addFile/page";
import CourseTable from "@/app/components/results/page";
import LogModal from "@/app/modal/logsModal";
import { useState } from "react";
import MatchModal from "@/app/modal/resultsModal";

export default function Home() {
  const [result, setResult] = useState<
    Record<string, Proposer[]> | { error: string[] } | null
  >(null);
  const [activeTab, setActiveTab] = useState<"original" | "modified">(
    "modified"
  );
  const [originalResults, setOriginalResults] = useState<
    Record<string, Proposer[]> | { error: string[] } | null
  >(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unmatched, setUnmatched] = useState<Proposer[] | null>(null);
  const [isOpenResults, setIsOpenResults] = useState(false);
  const mod = async (file: File) => {
    const proposerData = await readProposer(file, 0);
    const recieverData = await readProposer(file, 1);
    const gs = new galeShapley(proposerData, recieverData);
    const proposers = gs.getProposers();
    const recievers = gs.getRecievers();
    const structuredProposer = gs.assignProposers(recievers.length);
    const structuredReciever = gs.assignRecievers(proposers.length);
    const originalProposers =
      gs.processProposersWithTieBreaks(structuredProposer);
    // .sort(() => Math.random() - 0.5);
    console.log(originalProposers);
    const report = gs.modifiedGaleShapley(
      originalProposers,
      structuredReciever
    );
    const log = gs.getLogs();
    const waitlisted = gs.getWaitlist();
    const originalReport = gs.OriginalGaleShapley(
      originalProposers,
      structuredReciever
    );

    setResult(report);
    setOriginalResults(originalReport);
    setLogs(log);
    setUnmatched(waitlisted);
  };

  const handleDownload = () => {
    const allStudents = result ? Object.values(result).flat() : [];
    allStudents.sort((a, b) => {
      const nameA = a.proposerName.toLowerCase();
      const nameB = b.proposerName.toLowerCase();
      return nameA.localeCompare(nameB);
    });
    const file = excelFile(allStudents);
    const url = URL.createObjectURL(file);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      <Nav />
      <div className="w-full h-2 bg-[#002060]"></div>
      <div className="w-full h-2 bg-[#A51B0F]"></div>

      {!result && (
        <div className="w-full flex items-center justify-center pt-20 flex-col">
          <p className="text-[#002060] text-3xl font-serif wrap flex justify-center">
            Gale Shapley Algorithm
          </p>
          <span className="text-[#A51B0F]">Course-Student Matching</span>
        </div>
      )}

      <div className="w-full h-full items-center justify-center flex flex-col gap-4 px-10">
        {!result && <AddFile onInitialize={(file: File) => mod(file)} />}

        {result && !("error" in result) && (
          <div className="w-full h-full gap-4 flex flex-col items-center">
            <div className="flex border-b border-gray-200 w-full">
              <button
                className={`py-2 px-4 font-medium text-sm focus:outline-none ${
                  activeTab === "original"
                    ? "border-b-2 border-[#002060] text-[#002060]"
                    : "text-gray-500 hover:text-[#002060]"
                }`}
                onClick={() => setActiveTab("original")}
              >
                Original Gale-Shapley
              </button>
              <button
                className={`py-2 px-4 font-medium text-sm focus:outline-none ${
                  activeTab === "modified"
                    ? "border-b-2 border-[#A51B0F] text-[#A51B0F]"
                    : "text-gray-500 hover:text-[#A51B0F]"
                }`}
                onClick={() => setActiveTab("modified")}
              >
                Modified Gale-Shapley
              </button>
            </div>
            {activeTab === "original" ? (
              <CourseTable
                data={
                  originalResults && !("error" in originalResults)
                    ? Object.values(originalResults).flat()
                    : []
                }
                message="original"
              />
            ) : (
              <CourseTable
                data={Object.values(result).flat()}
                message="modified"
              />
            )}
            <div className="flex gap-4 items-start w-full justify-end">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                See Waitlists
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors ml-2"
              >
                Download {activeTab === "original" ? "Original" : "Modified"}{" "}
                Results
              </button>
              <button
                onClick={() => setIsOpenResults(true)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors ml-2"
              >
                See All Results
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Your existing modals */}
      <LogModal
        logs={activeTab === "original" ? [] : unmatched || []}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <MatchModal
        matches={
          result && !("error" in result) ? Object.values(result).flat() : []
        }
        isOpen={isOpenResults}
        onClose={() => setIsOpenResults(false)}
        message={activeTab}
        // numberOfAcceptors={
        //   result && !("error" in result) ? Object.keys(result).length : 0
        // }
      />
    </div>
  );
}
