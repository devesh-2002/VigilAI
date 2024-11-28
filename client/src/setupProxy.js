const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/', 
    createProxyMiddleware({
      target: 'http://localhost:8000', 
      changeOrigin: true,
    })
  );

  app.use(
    '/',
    createProxyMiddleware({
      target: 'https://c88c-35-222-117-43.ngrok-free.app/', 
      changeOrigin: true,
    })
  );
};