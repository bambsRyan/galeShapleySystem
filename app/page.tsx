"use client";
import { galeShapley, readProposer, Proposer } from "@/utils/galeShapley";
import Nav from "@/app/components/nav/page";
import AddFile from "@/app/components/addFile/page";
import CourseTable from "@/app/components/results/page";
import { useState } from "react";
export default function Home() {
  const [result, setResult] = useState<
    Record<string, Proposer[]> | { error: string[] } | null
  >(null);
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
    console.log(report);
    // console.log(originalProposers);
    // console.log(structuredProposer);
    // console.log(structuredReciever);
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
          <CourseTable data={Object.values(result).flat()} />
        )}
      </div>
    </div>
  );
}
