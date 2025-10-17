import * as THREE from "three";

// Matches blocks like:
// // chunk_replace <TOKEN>
// ...replacement...
// // end_chunk_replace
const threeChunkReplaceRegExp =
  /\/\/\s?chunk_replace\s(.+)([\s\S]+?)\/\/\s?end_chunk_replace/gm;

// Matches single-line Three.js shader chunk injection markers: // chunk(<name>);
const threeChunkRegExp = /\/\/\s?chunk\(\s?(\w+)\s?\);/g;

// Legacy helper: turn glslify-mangled GLOBAL_VAR_* back into the original token name
// Example: GLOBAL_VAR_foo_12 -> foo
const glslifyGlobalRegExp = /GLOBAL_VAR_([^_).;,\s]+)(?:_\d+)?/g;

let chunkReplaceMap: Record<string, string> = {};

function storeChunkReplaceParse(shader: string): string {
  chunkReplaceMap = {};
  return shader.replace(threeChunkReplaceRegExp, (_a, token: string, body: string) => {
    chunkReplaceMap[token.trim()] = body;
    return "";
  });
}

// En RawShaderMaterial NO usamos #include: si no hay reemplazo, devolvemos vacío.
function threeChunkParse(shader: string): string {
  return shader.replace(threeChunkRegExp, (_a, name: string) => {
    return chunkReplaceMap[name] ?? "";
  });
}

function glslifyGlobalParse(shader: string): string {
  return shader.replace(glslifyGlobalRegExp, (_a, name: string) => name);
}

export function parse(shader: string): string {
  let out = storeChunkReplaceParse(shader);
  out = threeChunkParse(out);
  out = glslifyGlobalParse(out);
  return out;
}

export default parse;
