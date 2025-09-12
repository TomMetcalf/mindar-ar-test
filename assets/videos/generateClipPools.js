// generateClipPools.js
const { execSync } = require('child_process');
const fs = require('fs');

// Folder containing your original clips
const folder = './'; // adjust if your clips are in a subfolder
const pattern = /^T0_vid\d+\.mp4$/; // matches T0_vid1.mp4 ... T0_vid7.mp4

// Read and sort video files
let files = fs
  .readdirSync(folder)
  .filter((f) => pattern.test(f))
  .sort((a, b) => {
    // Sort numerically by clip number
    const n1 = parseInt(a.match(/\d+/)[0]);
    const n2 = parseInt(b.match(/\d+/)[0]);
    return n1 - n2;
  });

let clipPools = [];
let cumulativeTime = 0;

files.forEach((file) => {
  // Get exact duration using ffprobe
  const durationStr = execSync(
    `ffprobe -i "${folder}${file}" -show_entries format=duration -v quiet -of csv="p=0"`
  )
    .toString()
    .trim();
  const duration = parseFloat(durationStr);

  clipPools.push([cumulativeTime, cumulativeTime + duration]);
  cumulativeTime += duration;
});

// Output ready-to-paste array
console.log('const clipPools = {');
console.log('  0: [');
clipPools.forEach((pair) => {
  console.log(`    [${pair[0]}, ${pair[1]}],`);
});
console.log('  ]');
console.log('};');
