module.exports = {
  apps: [
    {
      name: 'rca-app',
      port: '9099',
      exec_mode: 'fork',
      instances: '1',
      script: 'bash',
      args: '-c "npm run start:prod"',
    },
    //     {
    //       name: 'rca-app-test',
    //       port: '5443',
    //       exec_mode: 'fork',
    //       instances: '1',
    //       script: 'npm',
    //       args: 'run start',
    //     },
  ],
};
