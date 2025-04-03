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
      },
    };
  }

  public getProposers(): string[][] {
    return this.dataOfProposer;
  }
  public getRecievers(): string[][] {
    return this.dataOfReciever;
  }

  public assignProposers(numOfPref: number): Proposer[] {
    this.proposers = this.dataOfProposer.map((row) =>
      this.createProposer(row, numOfPref)
    );
    return this.proposers;
  }
  public assignRecievers(numOfPref: number): Reciever[] {
    this.recievers = this.dataOfReciever.map((row) =>
      this.createReciever(row, numOfPref)
    );
    return this.recievers;
  }

  //calculates the popularity of the preference of the proposer
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
  public processProposersWithTieBreaks(proposers: Proposer[]): Proposer[] {
    const popularity = this.calculatePopularity(proposers);
    console.log(popularity);
    return proposers.map((proposer) => ({
      ...proposer,
      pref: this.breakTies(proposer, popularity),
    }));
  }
}

export { galeShapley, readProposer };
