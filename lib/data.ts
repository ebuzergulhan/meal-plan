import fs from "fs/promises";
import path from "path";
import type { AppState } from "./types";

const DATA_FILE = path.join(process.cwd(), "data.json");

const defaultState: AppState = {
  recipes: null,
  weekPlan: null,
  shopChecks: {},
  shopCustom: {},
  shopEdits: {},
};

let writeQueue = Promise.resolve();

export async function readState(): Promise<AppState> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return { ...defaultState, ...JSON.parse(raw) };
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT")
      return { ...defaultState };
    throw e;
  }
}

export function writeState(state: AppState): Promise<void> {
  writeQueue = writeQueue.then(async () => {
    const clean = { ...defaultState, ...state };
    await fs.writeFile(
      DATA_FILE,
      `${JSON.stringify(clean, null, 2)}\n`,
      "utf8"
    );
  });
  return writeQueue;
}
