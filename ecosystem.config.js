module.exports = {
  apps: [
    {
      name: 'gestor-pro',
      script: 'server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      // Configurações de monitoramento
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      
      // Configurações de restart
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Configurações de health check
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,
      
      // Configurações de cluster
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Configurações de logs
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Configurações de performance
      node_args: '--max-old-space-size=1024',
      
      // Configurações de segurança
      uid: 'nodejs',
      gid: 'nodejs'
    }
  ],

  deploy: {
    production: {
      user: 'nodejs',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:seu-usuario/gestor-pro.git',
      path: '/var/www/gestor-pro',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
}; 