// server.js - 简单的静态文件服务器
const { createServer } = require('http');
const { readFile } = require('fs').promises;
const { join, extname } = require('path');

const server = createServer(async (req, res) => {
  try {
    // 设置CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.statusCode = 200;
      return res.end();
    }

    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = join(__dirname, filePath);

    // 安全校验：确保文件在项目目录内
    if (!filePath.startsWith(__dirname)) {
      res.statusCode = 403;
      return res.end('Forbidden');
    }

    const content = await readFile(filePath, 'utf8');
    
    // 设置Content-Type
    const ext = extname(filePath);
    const contentTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'text/javascript',
      '.json': 'application/json'
    };
    
    res.setHeader('Content-Type', contentTypes[ext] || 'text/plain');
    res.end(content);
    
  } catch (error) {
    res.statusCode = 404;
    res.end('File not found');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});