/** Builds the prebaked code-drawn comic snapshot. */
import { fileURLToPath } from "node:url";
import { Daytona, Image } from "@daytonaio/sdk";
import { SNAPSHOT_NAME } from "../src/sandbox/index.ts";

const apiKey=process.env.DAYTONA_API_KEY;
if(!apiKey) throw new Error("DAYTONA_API_KEY is required to build the snapshot (run via --env-file).");

const daytona=new Daytona({apiKey,target:process.env.DAYTONA_TARGET});
const dockerfilePath=fileURLToPath(new URL("../snapshot/Dockerfile",import.meta.url));
const skillDir=fileURLToPath(new URL("../skills/hand-drawn-comic",import.meta.url));
const image=Image.fromDockerfile(dockerfilePath).addLocalDir(skillDir,"/home/daytona/skill");

process.stdout.write(`Building snapshot ${SNAPSHOT_NAME} …\n`);
await daytona.snapshot.create({
  name:SNAPSHOT_NAME,
  image,
  resources:{cpu:2,memory:3,disk:5},
},{onLogs:(chunk)=>process.stdout.write(chunk),timeout:0});
process.stdout.write(`\nSnapshot ${SNAPSHOT_NAME} is ready.\n`);
