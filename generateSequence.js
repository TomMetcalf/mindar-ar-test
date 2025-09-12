const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Path to videos folder
const videoDir = path.join(__dirname, 'assets', 'videos');

// Original clip files
const clips = [
  'T0_vid1.mp4', // fixed start
  'T0_vid2.mp4',
  'T0_vid3.mp4',
  'T0_vid4.mp4',
  'T0_vid5.mp4',
  'T0_vid6.mp4',
  'T0_vid7.mp4', // fixed end
];

// Pick 3 random middle clips (clips 2–6)
function pickMiddleClips() {
  const middlePool = [1, 2, 3, 4, 5];
  const shuffled = middlePool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

// Generate random sequence
function generateRandomSequence() {
  const middle = pickMiddleClips();
  const sequence = [0, ...middle, 6]; // start + middle + end
  console.log('Random sequence indexes:', sequence);
  return sequence.map((i) => clips[i]);
}

// Generate FFmpeg concat file
function createConcatFile(sequence, filePath) {
  const lines = sequence.map((f) => `file '${path.join(videoDir, f)}'`);
  fs.writeFileSync(filePath, lines.join('\n'));
}

// Run FFmpeg to create concatenated video
function concatVideos(sequence, outputFile) {
  const concatFile = path.join(videoDir, 'concat_list.txt');
  createConcatFile(sequence, concatFile);

  const ffmpegCmd = `ffmpeg -f concat -safe 0 -i "${concatFile}" -c copy "${outputFile}"`;
  console.log('Running FFmpeg command:', ffmpegCmd);
  execSync(ffmpegCmd, { stdio: 'inherit' });
  fs.unlinkSync(concatFile);
}

// Usage
const sequence = generateRandomSequence();
const outputFile = path.join(videoDir, 'target0_randomloop.mp4');
concatVideos(sequence, outputFile);
console.log('Random loop video created:', outputFile);
