module.exports = {
    apps: [
        {
            name: 'frontend',
            script: 'npm',
            args: 'run dev',
            cwd: './', // Update this path
            env: {
                NODE_ENV: 'development',
                NEXT_PUBLIC_BACKEND_URL: 'http://localhost:8000',
                NEXT_PUBLIC_AUTH_SERVICE_URL: 'http://168.138.112.73:4500/api'
            },
            env_production: {
                NODE_ENV: 'production',
                NEXT_PUBLIC_BACKEND_URL: 'http://localhost:8000',
                NEXT_PUBLIC_AUTH_SERVICE_URL: 'http://168.138.112.73:4500/api'
            }
        }
    ]
};
