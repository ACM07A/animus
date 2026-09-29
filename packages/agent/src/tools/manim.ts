import {
  EditFileInputSchema,
  type EditFileOutput,
  ListFilesInputSchema,
  type ListFilesOutput,
  ReadFileInputSchema,
  type ReadFileOutput,
  RenderSceneInputSchema,
  type RenderSceneOutput,
  RunCommandInputSchema,
  type RunCommandOutput,
  WriteFileInputSchema,
  type WriteFileOutput,
} from "@animus/core/tools";
import type { Sandbox } from "@daytonaio/sdk";
import { type ToolSet, tool } from "ai";
import { commandOutput, PROJECT_DIR } from "../sandbox/index.ts";
import { createRedactor } from "../utils/redact.ts";

const MAX_LOG_CHARS = 16_000;
const RENDER_TIMEOUT_SEC = 600;
const COMMAND_TIMEOUT_SEC = 300;

export type SaveVideo = (input: {
  bytes: Uint8Array;
  conversationId: string;
  scene: string;
}) => Promise<string>;

export type BackgroundMusicUrl = (trackId: string) => Promise<string>;

export interface TurnMeter {
  ttsChars: number;
}

function resolvePath(path: string): string {
  return path.startsWith("/") ? path : `${PROJECT_DIR}/${path}`;
}

function tailLog(output: string): string {
  if (output.length <= MAX_LOG_CHARS) return output;
  const dropped = output.length - MAX_LOG_CHARS;
  return `[... truncated ${dropped} earlier characters ...]\n${output.slice(-MAX_LOG_CHARS)}`;
}

function countOccurrences(haystack: string, needle: string): number {
  let count = 0;
  let from = 0;
  for (;;) {
    const at = haystack.indexOf(needle, from);
    if (at === -1) return count;
    count++;
    from = at + needle.length;
  }
}

export function createManimTools(deps: {
  sandbox: Sandbox;
  conversationId: string;
  saveVideo: SaveVideo;
  backgroundMusicUrl: BackgroundMusicUrl;
  backgroundMusic: boolean;
  musicTrackId: string;
  elevenLabsApiKey: string;
  meter: TurnMeter;
}): ToolSet {
  const { sandbox, conversationId, saveVideo, elevenLabsApiKey } = deps;
  const redact = createRedactor([elevenLabsApiKey]);

  return {
    writeFile: tool({
      description:
        "Write or overwrite a file in the code-drawn comic project. Use .mjs for film/shot code, SVG for authored path art, or JSON for plans.",
      inputSchema: WriteFileInputSchema,
      execute: async ({ path, content }): Promise<WriteFileOutput> => {
        await sandbox.fs.uploadFiles([{ source: Buffer.from(content, "utf8"), destination: resolvePath(path) }]);
        return { path, bytes: Buffer.byteLength(content, "utf8") };
      },
    }),
    editFile: tool({
      description: "Surgically replace an exact snippet in a project file.",
      inputSchema: EditFileInputSchema,
      execute: async ({ path, oldString, newString, replaceAll }): Promise<EditFileOutput> => {
        if (oldString === newString) throw new Error("oldString and newString are identical.");
        const resolved = resolvePath(path);
        const buffer = await sandbox.fs.downloadFile(resolved);
        const count = countOccurrences(buffer.toString("utf8"), oldString);
        if (count === 0) throw new Error(`oldString was not found in ${path}.`);
        if (count > 1 && !replaceAll) throw new Error(`oldString matches ${count} times in ${path}.`);
        await sandbox.fs.replaceInFiles([resolved], oldString, newString);
        return { path, replacements: count };
      },
    }),
    readFile: tool({
      description: "Read a project file or bundled hand-drawn-comic skill reference.",
      inputSchema: ReadFileInputSchema,
      execute: async ({ path }): Promise<ReadFileOutput> => {
        const buffer = await sandbox.fs.downloadFile(resolvePath(path));
        return { path, content: redact(buffer.toString("utf8")) };
      },
    }),
    listFiles: tool({
      description: "List project or skill files.",
      inputSchema: ListFilesInputSchema,
      execute: async ({ path }): Promise<ListFilesOutput> => {
        const entries = await sandbox.fs.listFiles(resolvePath(path));
        return { path, entries: entries.map((entry) => entry.name) };
      },
    }),
    runCommand: tool({
      description: "Run shell commands in the code-drawn project. Node, rsvg-convert, ImageMagick and ffmpeg are installed.",
      inputSchema: RunCommandInputSchema,
      execute: async ({ command }): Promise<RunCommandOutput> => {
        const res = await sandbox.process.executeCommand(`${command} 2>&1`, PROJECT_DIR, undefined, COMMAND_TIMEOUT_SEC);
        return { command, exitCode: res.exitCode, output: redact(tailLog(commandOutput(res))) };
      },
    }),
    renderScene: tool({
      description:
        "Deliver a finished JavaScript/SVG comic film. The entry .mjs must accept --output <mp4> --quality low|high and write the requested MP4. The 'scene' field is an output label, not a class name.",
      inputSchema: RenderSceneInputSchema,
      execute: async ({ file, scene, quality }): Promise<RenderSceneOutput> => {
        const safeScene = scene.replace(/[^a-zA-Z0-9_-]/g, "_");
        const outDir = `${PROJECT_DIR}/render`;
        const outPath = `${outDir}/${safeScene}.mp4`;
        await sandbox.process.executeCommand(`mkdir -p ${outDir}`, PROJECT_DIR, undefined, 30);
        const command = `node ${resolvePath(file)} --output ${outPath} --quality ${quality}`;
        const res = await sandbox.process.executeCommand(`${command} 2>&1`, PROJECT_DIR, undefined, RENDER_TIMEOUT_SEC);
        const logs = redact(tailLog(commandOutput(res)));
        if (res.exitCode !== 0) return { ok:false, file, scene, exitCode:res.exitCode, logs };
        try {
          const buffer = await sandbox.fs.downloadFile(outPath);
          const videoKey = await saveVideo({ bytes:new Uint8Array(buffer), conversationId, scene:safeScene });
          return { ok:true, file, scene, exitCode:0, videoKey, logs };
        } catch (error) {
          return { ok:false, file, scene, exitCode:0, logs:`${logs}\n\n[animus] Render completed but ${outPath} could not be retrieved: ${String(error)}` };
        }
      },
    }),
  } satisfies ToolSet;
}
