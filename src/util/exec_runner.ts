import { exec, ExecOptions } from 'child_process';

export const executeCommand = async (cmd: string, options: ExecOptions | null = null) => {
  return new Promise((resolve, reject) => {
    exec(cmd, options, (err, stdout) => {
      if (err) {
        reject(err);
      } else {
        resolve(stdout);
      }
    });
  });
};