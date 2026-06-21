module.exports = {
  apps: [
    {
      name: 'neural-gesture-dashboard',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 'max', // Scale dynamically to run one instance per CPU core (cluster mode)
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0'
      },
      error_file: './logs/pm2_error.log',
      out_file: './logs/pm2_out.log',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
