const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
app.use(cors());

// Log every request to help us see the 404 cause
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] Request: ${req.method} ${req.url}`);
    next();
});

app.use('/v1', createProxyMiddleware({
    target: 'http://localhost:11434',
    changeOrigin: true,
    pathRewrite: {
        '^/v1/chat/completions': '/api/chat'
    },
    onProxyRes: (proxyRes, req, res) => {
        if (proxyRes.statusCode === 404) {
            console.error('ERROR: Ollama returned 404. Check if the model name is correct.');
        }
    }
}));

app.listen(3001, () => {
    console.log('Proxy running on http://localhost:3001');
    console.log('Testing path: http://localhost:3001/v1/chat/completions');
});