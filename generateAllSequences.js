const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const videoDir = path.join(__dirname, 'assets', 'videos');

const clips = [
  'T0_vid1.mp4', // fixed start
  'T0_vid2.mp4',
  'T0_vid3.mp4',
  'T0_vid4.mp4',
  'T0_vid5.mp4',
  'T0_vid6.mp4',
  'T0_vid7.mp4', // fixed end
];

// Helper: generate all combinations of k elements from array arr
function kCombinations(arr, k) {
  const results = [];
  function combine(start, combo) {
    if (combo.length === k) {
      results.push([...combo]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i]);
      combine(i + 1, combo);
      combo.pop();
    }
  }
  combine(0, []);
  return results;
}

// Helper: generate all permutations of an array
function permute(arr) {
  const results = [];
  if (arr.length === 0) return [[]];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const p of permute(rest)) {
      results.push([arr[i], ...p]);
    }
  }
  return results;
}

// Generate all sequences
const middleIndexes = [1, 2, 3, 4, 5];
const combos = kCombinations(middleIndexes, 3);
let allSequences = [];

for (const combo of combos) {
  const perms = permute(combo);
  for (const perm of perms) {
    const seq = [0, ...perm, 6]; // Clip 1 + middle 3 + Clip 7
    allSequences.push(seq);
  }
}

console.log('Total sequences:', allSequences.length); // should be 60

// Generate FFmpeg videos
allSequences.forEach((seq, idx) => {
  const concatFile = path.join(videoDir, `concat_list_${idx}.txt`);
  const lines = seq.map((i) => `file '${path.join(videoDir, clips[i])}'`);
  fs.writeFileSync(concatFile, lines.join('\n'));

  const outputFile = path.join(videoDir, `target0_random_${idx}.mp4`);
  const ffmpegCmd = `ffmpeg -f concat -safe 0 -i "${concatFile}" -c copy "${outputFile}"`;
  console.log(`Generating video ${idx + 1}/60: ${outputFile}`);
  execSync(ffmpegCmd, { stdio: 'inherit' });

  fs.unlinkSync(concatFile);
});

console.log('All 60 random sequences generated!');
