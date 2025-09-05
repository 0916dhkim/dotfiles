#!/usr/bin/env -S node --experimental-strip-types

//                                     d8b                   d8b
//                                     Y8P                   Y8P
//
// .d8888b   .d88b.  .d8888b  .d8888b  888  .d88b.  88888b.  888 88888888  .d88b.  888d888
// 88K      d8P  Y8b 88K      88K      888 d88""88b 888 "88b 888    d88P  d8P  Y8b 888P"
// "Y8888b. 88888888 "Y8888b. "Y8888b. 888 888  888 888  888 888   d88P   88888888 888
//      X88 Y8b.          X88      X88 888 Y88..88P 888  888 888  d88P    Y8b.     888
//  88888P'  "Y8888   88888P'  88888P' 888  "Y88P"  888  888 888 88888888  "Y8888  888
//
// ╔══════════════════════════════════════════════════════════════════════════════════════╗
// ║                                                                                      ║
// ║ TUI for selecting & jumping between tmux sessions.                                   ║
// ║                                                                                      ║
// ╚══════════════════════════════════════════════════════════════════════════════════════╝

import * as fs from "node:fs/promises";
import * as path from "node:path";
import { spawn, type SpawnOptions } from "node:child_process";
import * as os from "node:os";

/**
 * Tweak these values to change the behavior.
 */
const Config = {
  paths: [path.join(os.homedir(), "git")],
  ui: {
    headerHeight: 3,
    minVisibleItems: 5,
    maxListHeightOffset: 2,
    defaultTerminalHeight: 24,
  },
  scoring: {
    exactSubstringMultiplier: 3,
    characterMatchPoints: 2,
    fullMatchBonus: 5,
    wordBoundaryBonus: 4,
  },
} as const;

/**
 * Sessionizer is implemented as a state machine.
 * @see {@link StateMachine}
 */
const STATES = {
  INITIALIZING: "INITIALIZING",
  BROWSING: "BROWSING",
  LAUNCHING: "LAUNCHING",
  EXITING: "EXITING",
  ERROR: "ERROR",
} as const;

/**
 * MAIN LOGIC LIVES HERE.
 *
 * This defines how the state machine handles different types of events
 * and transition from one state to another.
 */
const STATE_MACHINE_SPEC: Record<AppState, StateHandler> = {
  [STATES.INITIALIZING]: {
    async onEnter(machine) {
      try {
        const directories = await FileSystem.scanDirectories();
        machine.context.loadDirectories(directories);
        await machine.dispatch({ type: "DIRECTORIES_LOADED" });
      } catch (error) {
        machine.context.setError(error);
        await machine.transition(STATES.ERROR);
      }
    },

    async onEvent(machine, event) {
      if (event.type === "DIRECTORIES_LOADED") {
        Terminal.setup();
        await machine.transition(STATES.BROWSING);
      }
    },
  },

  [STATES.BROWSING]: {
    async onEnter(machine) {
      UI.renderAll(machine.context);
    },

    async onEvent(machine, event) {
      if (event.type === "KEY_PRESSED") {
        const { key } = event;

        if (key === KEY.ARROW_UP) {
          machine.context.moveSelectionUp();
          await machine.transition(STATES.BROWSING);
        } else if (key === KEY.ARROW_DOWN) {
          machine.context.moveSelectionDown();
          await machine.transition(STATES.BROWSING);
        } else if (key === KEY.ENTER_CR || key === KEY.ENTER_LF) {
          const selected = machine.context.getCurrentlySelected();
          if (selected) {
            machine.context.selectDirectory(selected);
            await machine.transition(STATES.LAUNCHING);
          }
        } else if (key === KEY.ESC || key === KEY.CTRL_C) {
          await machine.transition(STATES.EXITING);
        } else if (key === KEY.BACKSPACE || key === KEY.BACKSPACE_ALT) {
          machine.context.removeLastFilterCharacter();
          await machine.transition(STATES.BROWSING);
        } else if (Input.isPrintableChar(key)) {
          machine.context.addFilterCharacter(key);
          await machine.transition(STATES.BROWSING);
        }
      }
    },
  },

  [STATES.LAUNCHING]: {
    async onEnter(machine) {
      try {
        if (!machine.context.selectedDirectory) {
          throw new Error("No directory selected");
        }
        await Tmux.launchSession(machine.context.selectedDirectory);
        await machine.transition(STATES.EXITING);
      } catch (error) {
        machine.context.setError(error);
        await machine.transition(STATES.ERROR);
      }
    },
  },

  [STATES.EXITING]: {
    onEnter() {
      Terminal.clearScreen();
      Terminal.resetTerminalState();
      process.exit(0);
    },
  },

  [STATES.ERROR]: {
    onEnter(machine) {
      Terminal.clearScreen();
      if (machine.context.error) {
        console.error(`Error: ${machine.context.error.message}`);
      }
      Terminal.resetTerminalState();
      process.exit(1);
    },
  },
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type AppState = keyof typeof STATES;

interface Directory {
  name: string;
  fullPath: string;
}

interface FuzzyMatchResult extends Directory {
  score: number;
  matchIndices: number[];
}

interface SpawnConfig {
  spawnOptions?: SpawnOptions;
  onData?: (data: Buffer) => void;
}

type AppEvent =
  | { type: "DIRECTORIES_LOADED" }
  | { type: "KEY_PRESSED"; key: string };

interface StateHandler {
  onEnter?: (machine: StateMachine) => Promise<void>;
  onExit?: (machine: StateMachine) => Promise<void>;
  onEvent?: (machine: StateMachine, event: AppEvent) => Promise<void>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const KEY = {
  ARROW_UP: "\u001b[A",
  ARROW_DOWN: "\u001b[B",
  ENTER_CR: "\u000d",
  ENTER_LF: "\u000a",
  ESC: "\u001b",
  CTRL_C: "\u0003",
  BACKSPACE: "\u007f",
  BACKSPACE_ALT: "\u0008",
};

const ASCII = {
  PRINTABLE_START: 32,
  PRINTABLE_END: 126,
};

// ANSI escape codes organized by purpose
const ANSI = {
  CURSOR: {
    CLEAR_SCREEN: "\x1b[2J",
    HOME: "\x1b[H",
    HIDE: "\x1b[?25l",
    SHOW: "\x1b[?25h",
  },
  COLORS: {
    RESET: "\x1b[0m",
    BOLD: "\x1b[1m",
    DIM: "\x1b[2m",
    GREEN: "\x1b[32m",
    YELLOW: "\x1b[33m",
    BLUE: "\x1b[34m",
    MAGENTA: "\x1b[35m",
    CYAN: "\x1b[36m",
  },
} as const;

// ============================================================================
// MODULES - separation of concerns
// ============================================================================

class AppContext {
  directories: Directory[] = [];
  filteredDirectories: FuzzyMatchResult[] = [];
  selectedIndex = 0;
  filterQuery = "";
  scrollOffset = 0;
  selectedDirectory: Directory | null = null;
  error: Error | null = null;

  loadDirectories(directories: Directory[]) {
    this.directories = directories;
    this.filteredDirectories = directories.map((dir) => ({
      ...dir,
      score: 0,
      matchIndices: [],
    }));
  }

  setError(error: Error) {
    this.error = error;
  }

  moveSelectionUp() {
    if (this.filteredDirectories.length > 0) {
      this.selectedIndex = Math.max(0, this.selectedIndex - 1);
    }
  }

  moveSelectionDown() {
    if (this.filteredDirectories.length > 0) {
      this.selectedIndex = Math.min(
        this.filteredDirectories.length - 1,
        this.selectedIndex + 1
      );
    }
  }

  addFilterCharacter(char: string) {
    this.filterQuery += char;
    this.resetSelectionAndScrollToTop();
    this.updateFilteredResultsByQuery();
  }

  removeLastFilterCharacter() {
    if (this.filterQuery.length > 0) {
      this.filterQuery = this.filterQuery.slice(0, -1);
      this.resetSelectionAndScrollToTop();
      this.updateFilteredResultsByQuery();
    }
  }

  resetSelectionAndScrollToTop() {
    this.selectedIndex = 0;
    this.scrollOffset = 0;
  }

  updateFilteredResultsByQuery() {
    this.filteredDirectories = Fuzzy.match(this.filterQuery, this.directories);
  }

  selectDirectory(directory: Directory) {
    this.selectedDirectory = directory;
  }

  getCurrentlySelected(): FuzzyMatchResult | null {
    return this.filteredDirectories[this.selectedIndex] || null;
  }
}

class StateMachine {
  #currentState: AppState = STATES.INITIALIZING;
  context = new AppContext();
  #spec: Record<string, StateHandler> = STATE_MACHINE_SPEC;

  async start() {
    await this.#enterState(this.#currentState);
  }

  async dispatch(event: AppEvent) {
    await this.#spec[this.#currentState]?.onEvent?.(this, event);
  }

  async transition(targetState: AppState) {
    await this.#exitState(this.#currentState);
    this.#currentState = targetState;
    await this.#enterState(targetState);
  }

  async #exitState(state: AppState) {
    await this.#spec[state]?.onExit?.(this);
  }

  async #enterState(state: AppState) {
    await this.#spec[state]?.onEnter?.(this);
  }
}

const Terminal = {
  clearScreen() {
    process.stdout.write(
      ANSI.CURSOR.CLEAR_SCREEN + ANSI.CURSOR.HOME + ANSI.CURSOR.HIDE
    );
  },

  setup() {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    process.on("SIGINT", Terminal.resetTerminalState);
    process.on("SIGTERM", Terminal.resetTerminalState);
    process.on("exit", Terminal.resetTerminalState);
  },

  resetTerminalState() {
    process.stdout.write(ANSI.CURSOR.SHOW);
    if (process.stdin.isRaw) {
      process.stdin.setRawMode(false);
    }
    process.stdin.pause();
  },
};

const UI = {
  renderAll(context: AppContext) {
    Terminal.clearScreen();
    UI.renderHeader();
    UI.renderFilterInput(context);
    UI.renderDirectoryList(context);
    UI.renderStatusLine();
  },

  renderHeader() {
    const title = "tmux sessionizer";
    console.log(
      ANSI.COLORS.BOLD + ANSI.COLORS.CYAN + title + ANSI.COLORS.RESET
    );
  },

  renderFilterInput(context: AppContext) {
    const cursor = ANSI.COLORS.DIM + "█" + ANSI.COLORS.RESET;
    const filterLine = `fuzzy search: ${ANSI.COLORS.YELLOW}${context.filterQuery}${ANSI.COLORS.RESET}${cursor}`;
    console.log(filterLine);
    console.log();
  },

  renderDirectoryList(context: AppContext) {
    const terminalHeight =
      process.stdout.rows || Config.ui.defaultTerminalHeight;
    const maxListHeight =
      terminalHeight - Config.ui.headerHeight - Config.ui.maxListHeightOffset;
    const maxVisibleItems = Math.max(Config.ui.minVisibleItems, maxListHeight);

    UI.updateScrollOffsetBasedOnSelection(context, maxVisibleItems);

    const visibleItems = context.filteredDirectories.slice(
      context.scrollOffset,
      context.scrollOffset + maxVisibleItems
    );

    if (visibleItems.length === 0) {
      console.log(
        ANSI.COLORS.DIM + "No matching directories" + ANSI.COLORS.RESET
      );
      return;
    }

    for (const [index, item] of visibleItems.entries()) {
      const globalIndex = context.scrollOffset + index;
      const isSelected = globalIndex === context.selectedIndex;
      UI.renderDirectoryItem(item, isSelected, context);
    }
  },

  renderDirectoryItem(
    item: FuzzyMatchResult,
    isSelected: boolean,
    context: AppContext
  ) {
    const prefix = isSelected ? "> " : "  ";
    const color = isSelected
      ? ANSI.COLORS.GREEN + ANSI.COLORS.BOLD
      : ANSI.COLORS.RESET;

    const displayName = UI.highlightMatches(item, color, context);
    const line = `${prefix}${displayName}`;
    console.log(color + line + ANSI.COLORS.RESET);
  },

  highlightMatches(
    item: FuzzyMatchResult,
    baseColor: string,
    context: AppContext
  ): string {
    const displayPath = FileSystem.simplifyPathForDisplay(item.fullPath);

    if (
      !context.filterQuery ||
      !item.matchIndices ||
      item.matchIndices.length === 0
    ) {
      return displayPath;
    }

    const chars = displayPath.split("");
    for (const i of item.matchIndices) {
      chars[i] = ANSI.COLORS.YELLOW + ANSI.COLORS.BOLD + chars[i] + baseColor;
    }

    return chars.join("");
  },

  renderStatusLine() {
    const statusText = "↑/↓: navigate • Enter: select • ESC: exit";
    console.log(ANSI.COLORS.DIM + statusText + ANSI.COLORS.RESET);
  },

  updateScrollOffsetBasedOnSelection(
    context: AppContext,
    maxVisibleItems: number
  ) {
    if (context.selectedIndex >= context.scrollOffset + maxVisibleItems) {
      context.scrollOffset = context.selectedIndex - maxVisibleItems + 1;
    } else if (context.selectedIndex < context.scrollOffset) {
      context.scrollOffset = context.selectedIndex;
    }
  },
};

const Input = {
  isPrintableChar(key: string): boolean {
    if (key.length !== 1) return false;
    const keyCode = key.charCodeAt(0);
    return keyCode >= ASCII.PRINTABLE_START && keyCode <= ASCII.PRINTABLE_END;
  },
};

const Tmux = {
  async sessionExists(sessionName: string): Promise<boolean> {
    try {
      let sessionExists = false;
      await Utils.spawnCommand("tmux", ["list-sessions"], {
        spawnOptions: { stdio: "pipe" },
        onData: (data) => {
          const sessions = data.toString();
          sessionExists = sessions
            .split("\n")
            .some((line) => line.startsWith(sessionName + ":"));
        },
      });
      return sessionExists;
    } catch {
      return false;
    }
  },

  async createSession(sessionName: string, workingDir: string) {
    await Utils.spawnCommand(
      "tmux",
      ["new-session", "-d", "-s", sessionName, "-c", workingDir],
      {
        spawnOptions: { stdio: "pipe" },
      }
    );
  },

  async openSession(sessionName: string) {
    if (process.env.TMUX) {
      // Inside tmux: switch client
      await Utils.spawnCommand("tmux", ["switch-client", "-t", sessionName], {
        spawnOptions: { stdio: "inherit" },
      });
    } else {
      // Outside tmux: attach
      await Utils.spawnCommand("tmux", ["attach", "-t", sessionName], {
        spawnOptions: { stdio: "inherit" },
      });
    }
  },

  sanitizeSessionName(dirName: string): string {
    return dirName.replace(/[^a-zA-Z0-9_-]/g, "_");
  },

  /** Main function to launch or switch to tmux session */
  async launchSession(directory: Directory) {
    Terminal.resetTerminalState();

    const sessionName = Tmux.sanitizeSessionName(directory.name);

    try {
      const exists = await Tmux.sessionExists(sessionName);

      if (exists) {
        console.log(`Attaching to existing session: ${sessionName}`);
        await Tmux.openSession(sessionName);
      } else {
        console.log(`Creating new session: ${sessionName}`);
        await Tmux.createSession(sessionName, directory.fullPath);
        await Tmux.openSession(sessionName);
      }

      process.exit(0);
    } catch (error) {
      console.error(`Failed to launch tmux session: ${error}`);
      process.exit(1);
    }
  },
};

const Utils = {
  /** Resolves if the command exits with 0. Rejects otherwise.  */
  async spawnCommand(
    command: string,
    args: string[],
    config: SpawnConfig = {}
  ): Promise<number> {
    return new Promise((resolve, reject) => {
      const { spawnOptions = {}, onData } = config;
      const childProcess = spawn(command, args, spawnOptions);

      if (onData && childProcess.stdout) {
        childProcess.stdout.on("data", (data) => onData(data));
      }

      childProcess.on("close", (code) => {
        if (code === 0) {
          resolve(code);
        } else {
          reject(new Error(`Process exited with code ${code}`));
        }
      });

      childProcess.on("error", reject);
    });
  },

  printErrorAndExit(error: Error, context = ""): never {
    const message = context ? `${context}: ${error.message}` : error.message;
    console.error(message);
    Terminal.resetTerminalState();
    process.exit(1);
  },
};

const FileSystem = {
  async scanDirectories(): Promise<Directory[]> {
    const allDirectories: Directory[] = [];

    for (const searchPath of Config.paths) {
      try {
        const entries = await fs.readdir(searchPath, { withFileTypes: true });

        const directories = entries
          .filter((entry) => entry.isDirectory())
          .map((entry) => ({
            name: entry.name,
            fullPath: path.join(searchPath, entry.name),
          }));

        allDirectories.push(...directories);
      } catch (error) {
        console.error(`Error scanning ${searchPath}: ${error}`);
        // Continue with other paths instead of exiting
      }
    }

    // Sort by full path for consistent ordering
    return allDirectories.sort((a, b) => a.fullPath.localeCompare(b.fullPath));
  },
  simplifyPathForDisplay(fullPath: string): string {
    const homeDir = os.homedir();
    if (fullPath.startsWith(homeDir)) {
      return fullPath.replace(homeDir, "~");
    }
    return fullPath;
  },
};

const Fuzzy = {
  /**
   * Fuzzy matching algorithm with scoring
   */
  match(query: string, items: Directory[]): FuzzyMatchResult[] {
    if (!query.trim()) {
      return items.map((item) => ({
        ...item,
        score: 0,
        matchIndices: [],
      }));
    }

    const queryLower = query.toLowerCase();

    return items
      .map((item) => {
        const displayPath = FileSystem.simplifyPathForDisplay(item.fullPath);
        const displayPathLower = displayPath.toLowerCase();
        let score = 0;
        const matchIndices: number[] = [];

        // Exact substring match gets highest score
        if (displayPathLower.includes(queryLower)) {
          score += queryLower.length * Config.scoring.exactSubstringMultiplier;
        }

        // Character-by-character fuzzy matching
        let queryIndex = 0;
        for (
          let i = 0;
          i < displayPathLower.length && queryIndex < queryLower.length;
          i++
        ) {
          if (displayPathLower[i] === queryLower[queryIndex]) {
            matchIndices.push(i);
            score += Config.scoring.characterMatchPoints;
            queryIndex++;
          }
        }

        // Bonus for matching all query characters
        if (queryIndex === queryLower.length) {
          score += Config.scoring.fullMatchBonus;
        }

        // Bonus for matching at word boundaries (including directory separators)
        const words = displayPath.split(/[-_\s\/]/);
        for (const word of words) {
          if (word.toLowerCase().startsWith(queryLower)) {
            score += Config.scoring.wordBoundaryBonus;
          }
        }

        return { ...item, score, matchIndices };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);
  },
};

// ============================================================================
// RUN
// ============================================================================

async function runSessionizer() {
  const machine = new StateMachine();

  process.stdin.on("data", async (keyBuffer: Buffer) => {
    const key = keyBuffer.toString();
    await machine.dispatch({ type: "KEY_PRESSED", key });
  });

  await machine.start();
}

runSessionizer().catch((error: Error) => {
  Utils.printErrorAndExit(error, "Application startup failed");
});
