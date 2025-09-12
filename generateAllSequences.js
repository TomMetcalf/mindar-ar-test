const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const videoDir = path.join(__dirname, 'assets', 'videos');

// Source clips
const clips = [
  'T0_vid1.mp4', // fixed start
  'T0_vid2.mp4',
  'T0_vid3.mp4',
  'T0_vid4.mp4',
  'T0_vid5.mp4',
  'T0_vid6.mp4',
  'T0_vid7.mp4', // fixed end
];

// Desired normalized resolution & framerate
const RESOLUTION = '1080:1080';
const FPS = 12;

// Step 1: Normalize all source clips
console.log('Normalizing source clips...');
clips.forEach((clip) => {
  const input = path.join(videoDir, clip);
  const output = path.join(videoDir, `norm_${clip}`);
  console.log(`Normalizing ${clip} → ${output}`);
  execSync(
    `ffmpeg -y -i "${input}" -vf "scale=${RESOLUTION},fps=${FPS}" -c:v libx264 -preset fast -crf 20 -c:a aac -b:a 128k "${output}"`,
    { stdio: 'inherit' }
  );
});

// Helper: combinations of k elements
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

// Helper: permutations
function permute(arr) {
  if (arr.length === 0) return [[]];
  const results = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const p of permute(rest)) {
      results.push([arr[i], ...p]);
    }
  }
  return results;
}

// Step 2: Generate all sequences (Clip1 + 3 random middle + Clip7)
const middleIndexes = [1, 2, 3, 4, 5];
const combos = kCombinations(middleIndexes, 3);
let allSequences = [];

for (const combo of combos) {
  const perms = permute(combo);
  for (const perm of perms) {
    const seq = [0, ...perm, 6]; // Clip1 + middle + Clip7
    allSequences.push(seq);
  }
}

console.log('Total sequences to generate:', allSequences.length);

// Step 3: Generate each concatenated video
allSequences.forEach((seq, idx) => {
  const concatFile = path.join(videoDir, `concat_list_${idx}.txt`);
  const lines = seq.map((i) => `file 'norm_${clips[i]}'`);
  fs.writeFileSync(concatFile, lines.join('\n'));

  const outputFile = path.join(videoDir, `target0_random_${idx}.mp4`);
  const ffmpegCmd = `ffmpeg -y -f concat -safe 0 -i "${concatFile}" -c:v libx264 -preset fast -crf 20 -c:a aac -b:a 128k "${outputFile}"`;
  console.log(
    `Generating video ${idx + 1}/${allSequences.length}: ${outputFile}`
  );
  execSync(ffmpegCmd, { stdio: 'inherit' });

  fs.unlinkSync(concatFile);
});

console.log('All random sequence videos generated successfully!');
