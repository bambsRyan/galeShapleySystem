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

export default function Home() {
  const [result, setResult] = useState<
    Record<string, Proposer[]> | { error: string[] } | null
  >(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    const report = gs.modifiedGaleShapley(
      originalProposers,
      structuredReciever
    );
    setResult(report);
    const log = gs.getLogs();
    setLogs(log);
    console.log("logs", logs);
    // console.log(report);
    // console.log(originalProposers);
    // console.log(structuredProposer);
    // console.log(structuredReciever);
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
            Modified Gale Shapley Algorithm
          </p>
          <span className="text-[#A51B0F]">Course-Student Matching </span>
        </div>
      )}
      <div className="w-full h-full items-center justify-center flex flex-col gap-4 px-10">
        {!result && <AddFile onInitialize={(file: File) => mod(file)} />}
        {result && !("error" in result) && (
          <div className="w-full h-full gap-4 flex flex-col items-center ">
            <p className="text-center text-2xl font-serif wrap flex justify-center pt-4 ">
              Course-Student Matching Results
            </p>
            <CourseTable data={Object.values(result).flat()} />
            <div className="flex gap-4 items-start w-full justify-end ">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                See Logs
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors ml-2"
              >
                Download Results
              </button>
            </div>
          </div>
        )}
      </div>
      <LogModal
        logs={logs}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
