const { spawn } = require('child_process');
const path = require('path');

const options = {cwd: path.join('webrecorder', 'frontend'), stdio: 'inherit', shell: true};

spawn('yarn install', [], options, (err, stdout, stderr) => {
   if (err) {
       console.error(err);
       return;
   }

   spawn('yarn run build-player', [], options, (err, stdout, stderr) => {
       if (err) {
           console.error(err);
           return;
       }
       console.log(stdout);
   });
});
