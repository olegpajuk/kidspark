module.exports = {
  apps: [
    {
      name: "kidspark",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/var/www/kidspark",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3002,
      },
    },
  ],
};
