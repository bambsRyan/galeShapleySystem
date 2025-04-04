import * as XLSX from "xlsx";

function readProposer(file: File, sheetIndex: number = 0): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "array" });

        const worksheetName = workbook.SheetNames[sheetIndex];
        const worksheet = workbook.Sheets[worksheetName];

        // Convert to 2D array of strings
        const jsonData = XLSX.utils.sheet_to_json<string[]>(worksheet, {
          header: 1,
        });

        // Process each cell in each row
        const result: string[][] = jsonData.map((row) =>
          row.map((cell) =>
            cell !== null && cell !== undefined ? String(cell) : ""
          )
        );

        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

interface propAttributes {
  GWA: number;
  PLMAT_Score: number;
  admissionScore: number;
}

interface Proposer {
  proposerName: string;
  pref: string[];
  attributes: propAttributes;
  current: number;
  currentMaut: number;
}

interface Reciever {
  recieverName: string;
  pref: string[];
  attributes: recieverAttributes;
}

interface recieverAttributes {
  GWA: [number, number];
  PLMAT_Score: [number, number];
  admissionScore: [number, number];
  slot: number;
}

export default class galeShapley {
  private proposers: Proposer[];
  private recievers: Reciever[];
  private dataOfReciever: string[][];
  private dataOfProposer: string[][];

  constructor(proposer: string[][], reciever: string[][]) {
    this.dataOfReciever = reciever.filter((row) => this.isValidRow(row));
    this.dataOfProposer = proposer.filter((row) => this.isValidRow(row));
    this.proposers = [];
    this.recievers = [];
  }

  private isValidRow(row: string[]): boolean {
    return row[0]?.trim().length > 0;
  }

  private createProposer(row: string[], numOfPref: number = 3): Proposer {
    const preferences = Array(numOfPref)
      .fill(0)
      .map((_, i) => row[i + 1]?.trim() || "");

    return {
      proposerName: row[0].trim(),
      pref: preferences,
      attributes: {
        GWA: parseFloat(row[1 + numOfPref]),
        PLMAT_Score: parseFloat(row[2 + numOfPref]),
        admissionScore: parseFloat(row[3 + numOfPref]),
      },
      current: 0,
      currentMaut: 0,
    };
  }
  private createReciever(row: string[], numOfPref: number = 3): Reciever {
    const preferences = Array(numOfPref)
      .fill(0)
      .map((_, i) => row[i + 1]?.trim() || "");

    return {
      recieverName: row[0].trim(),
      pref: preferences,
      attributes: {
        GWA: [parseFloat(row[1 + numOfPref]), parseFloat(row[2 + numOfPref])],
        PLMAT_Score: [
          parseFloat(row[3 + numOfPref]),
          parseFloat(row[4 + numOfPref]),
        ],
        admissionScore: [
          parseFloat(row[5 + numOfPref]),
          parseFloat(row[6 + numOfPref]),
        ],
        slot: parseInt(row[7 + numOfPref]),
      },
    };
  }

  public getProposers(): string[][] {
    return this.dataOfProposer;
  }
  public getRecievers(): string[][] {
    return this.dataOfReciever;
  }
  // This function assigns the proposers based on the data provided
  // It maps through the dataOfProposer and creates a Proposer object for each row
  public assignProposers(numOfPref: number): Proposer[] {
    this.proposers = this.dataOfProposer.map((row) =>
      this.createProposer(row, numOfPref)
    );
    return this.proposers;
  }
  // This function assigns the recievers based on the data provided
  // It maps through the dataOfReciever and creates a Reciever object for each row
  public assignRecievers(numOfPref: number): Reciever[] {
    this.recievers = this.dataOfReciever.map((row) =>
      this.createReciever(row, numOfPref)
    );
    return this.recievers;
  }

  //calculates the popularity of the preference of the proposer
  // It takes the preferences of each proposer and assigns a score based on their rank in the preference list
  // The higher the rank, the lower the score. The scores are then summed up for each preference across all proposers
  public calculatePopularity(proposers: Proposer[]): Record<string, number> {
    const popularity: Record<string, number> = {};

    proposers.forEach((proposer) => {
      proposer.pref.forEach((preferenceCell, index) => {
        const score = index + 1;

        const preferencesInCell = preferenceCell
          .split(",")
          .map((p) => p.trim())
          .filter((p) => p.length > 0);

        preferencesInCell.forEach((preference) => {
          popularity[preference] = (popularity[preference] || 0) + score;
        });
      });
    });

    return popularity;
  }
  // This function breaks ties in the preferences of the proposer based on the popularity of the preference
  // It sorts the preferences in each cell based on the popularity score, and returns the sorted preferences
  private breakTies(
    proposer: Proposer,
    popularity: Record<string, number>
  ): string[] {
    const priorityGroups: string[][] = [];
    let currentPriority = 0;

    proposer.pref.forEach((pref) => {
      const prefsInCell = pref
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p.length > 0);
      priorityGroups[currentPriority] = prefsInCell;
      currentPriority++;
    });

    const result = priorityGroups.flatMap((group) => {
      if (group.length > 1) {
        return [...group].sort(
          (a, b) => (popularity[b] || 0) - (popularity[a] || 0)
        );
      }
      return group;
    });

    return result;
  }
  // This function processes the proposers with tie breaks
  // It calculates the popularity of the preferences and then breaks ties for each proposer
  public processProposersWithTieBreaks(proposers: Proposer[]): Proposer[] {
    const popularity = this.calculatePopularity(proposers);
    // console.log(popularity);
    return proposers.map((proposer) => ({
      ...proposer,
      pref: this.breakTies(proposer, popularity),
    }));
  }
  public modifiedGaleShapley(
    proposers: Proposer[],
    recievers: Reciever[]
  ): Record<string, Proposer[]> | { error: string[] } {
    const freeProposers = [...proposers];
    const engagements: Record<string, Proposer[]> = {};

    while (freeProposers.length > 0) {
      const proposer = freeProposers.shift()!;
      const preferredRecieverName = proposer.pref[0];

      const reciever = recievers.find(
        (reciever) => reciever.recieverName === preferredRecieverName
      );

      if (!reciever) {
        return { error: ["Reciever not found"] };
      }
      if (!engagements[preferredRecieverName]) {
        proposer.currentMaut = this.getScore(
          reciever.pref.indexOf(proposer.proposerName) + 1,
          proposer,
          reciever
        );
        engagements[preferredRecieverName] = [proposer];
        reciever.attributes.slot -= 1;
      } else if (
        engagements[preferredRecieverName] &&
        reciever.attributes.slot > 0
      ) {
        proposer.currentMaut = this.getScore(
          reciever.pref.indexOf(proposer.proposerName) + 1,
          proposer,
          reciever
        );
        engagements[preferredRecieverName].push(proposer);
        reciever.attributes.slot -= 1;
      } else if (
        engagements[preferredRecieverName] &&
        reciever.attributes.slot === 0
      ) {
        proposer.currentMaut = this.getScore(
          reciever.pref.indexOf(proposer.proposerName) + 1,
          proposer,
          reciever
        );
        const currentEngagements = engagements[preferredRecieverName];
        const lowestRankedProposer = currentEngagements.reduce(
          (prev, curr) => (prev.currentMaut < curr.currentMaut ? prev : curr),
          currentEngagements[0]
        );

        if (proposer.currentMaut > lowestRankedProposer.currentMaut) {
          engagements[preferredRecieverName] = engagements[
            preferredRecieverName
          ].filter((p) => p !== lowestRankedProposer);
          freeProposers.push(lowestRankedProposer);
          engagements[preferredRecieverName].push(proposer);
        } else {
          proposer.pref.shift();
          proposer.current += 1;
          freeProposers.push(proposer);
        }
      } else {
        proposer.pref.shift();
        proposer.current += 1;
        freeProposers.push(proposer);
      }
    }
    return engagements;
  }
  public getScore(
    rank: number,
    proposer: Proposer,
    reciever: Reciever,
    rankWeight: number = 0.5,
    scoreWeight: number = 0.5
  ): number {
    // console.log("Name", proposer.proposerName);
    // console.log("Course", reciever.recieverName);
    // console.log("Rank: ", rank);
    // console.log(reciever.pref.length);
    return (
      (this.getInverse(rank, reciever.pref.length) / reciever.pref.length) *
        rankWeight + //0.5
      this.getMautScore(proposer, reciever) * scoreWeight
    );
  }
  public getMautScore(proposer: Proposer, reciever: Reciever): number {
    const GWAScore = proposer.attributes.GWA / reciever.attributes.GWA[0];
    const PLMATScore =
      proposer.attributes.PLMAT_Score / reciever.attributes.PLMAT_Score[0];
    const admissionScore =
      proposer.attributes.admissionScore /
      reciever.attributes.admissionScore[0];
    const finalGWA =
      GWAScore >= 1
        ? reciever.attributes.GWA[1]
        : GWAScore * reciever.attributes.GWA[1];
    const finalPLMATScore =
      PLMATScore >= 1
        ? reciever.attributes.PLMAT_Score[1]
        : PLMATScore * reciever.attributes.PLMAT_Score[1];
    const finalAdmissionScore =
      admissionScore >= 1
        ? reciever.attributes.admissionScore[1]
        : admissionScore * reciever.attributes.admissionScore[1];
    console.log(
      proposer.proposerName,
      ":",
      finalGWA + finalPLMATScore + finalAdmissionScore
    );
    return finalGWA + finalPLMATScore + finalAdmissionScore;
  }
  public getInverse(num: number, maxVal: number): number {
    return 1 + maxVal - num;
  }
}

export { galeShapley, readProposer };
export type { Proposer };
