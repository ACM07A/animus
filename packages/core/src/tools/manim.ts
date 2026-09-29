import { z } from "zod";

/** Code-drawn comic sandbox tool contracts. Historical filenames keep the
 * manim name for API compatibility while the renderer migrates. */

export const RENDER_QUALITIES = ["low", "high"] as const;
export type RenderQuality = (typeof RENDER_QUALITIES)[number];

const PATH_DESCRIPTION =
  'File path relative to the project root, e.g. "film.mjs". Absolute paths are allowed for the bundled skill under /home/daytona/skill.';

export const WriteFileInputSchema = z.object({
  path:z.string().min(1).describe(PATH_DESCRIPTION),
  content:z.string().describe("Complete file contents. Overwrites the file if it exists."),
}).strict();
export type WriteFileInput = z.infer<typeof WriteFileInputSchema>;
export interface WriteFileOutput { bytes:number; path:string; }

export const EditFileInputSchema = z.object({
  path:z.string().min(1).describe(PATH_DESCRIPTION),
  oldString:z.string().min(1).describe("Exact literal text to replace."),
  newString:z.string().describe("Replacement text; may be empty."),
  replaceAll:z.boolean().default(false).describe("Replace all matches when true."),
}).strict();
export type EditFileInput = z.infer<typeof EditFileInputSchema>;
export interface EditFileOutput { path:string; replacements:number; }

export const ReadFileInputSchema = z.object({path:z.string().min(1).describe(PATH_DESCRIPTION)}).strict();
export type ReadFileInput = z.infer<typeof ReadFileInputSchema>;
export interface ReadFileOutput {content:string; path:string;}

export const ListFilesInputSchema = z.object({
  path:z.string().min(1).default(".").describe("Directory to list relative to project root."),
}).strict();
export type ListFilesInput = z.infer<typeof ListFilesInputSchema>;
export interface ListFilesOutput {entries:string[]; path:string;}

export const RunCommandInputSchema = z.object({
  command:z.string().min(1).describe("Shell command run in the project root."),
}).strict();
export type RunCommandInput = z.infer<typeof RunCommandInputSchema>;
export interface RunCommandOutput {command:string; exitCode:number; output:string;}

export const RenderSceneInputSchema = z.object({
  file:z.string().min(1).describe('JavaScript .mjs entry file implementing the render contract, e.g. "film.mjs".'),
  scene:z.string().min(1).describe("Short output label used for the delivered MP4 filename."),
  quality:z.enum(RENDER_QUALITIES).default("high").describe('"high" for 1080p delivery; "low" for tests.'),
}).strict();
export type RenderSceneInput = z.infer<typeof RenderSceneInputSchema>;

export interface RenderSceneOutput {
  exitCode:number;
  file:string;
  logs:string;
  ok:boolean;
  scene:string;
  videoKey?:string;
}
