const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// In-memory storage for linking codes and user data
const linkingCodes = new Map();
const linkedUsers = new Map();

// Helper function to generate linking codes
function generateLinkingCode(chats, settings) {
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes
  
  const linkingCode = {
    code,
    userId: `user_${Date.now()}`,
    createdAt: now,
    expiresAt,
    used: false
  };
  
  linkingCodes.set(code, linkingCode);
  
  // Store user data
  const userData = {
    chats,
    settings,
    userId: linkingCode.userId
  };
  
  // Auto-cleanup after expiry
  setTimeout(() => {
    linkingCodes.delete(code);
  }, 5 * 60 * 1000);
  
  return { code, userData };
}

// Helper function to validate linking codes
function validateLinkingCode(code) {
  const linkingCode = linkingCodes.get(code);
  
  if (!linkingCode) {
    return null; // Code doesn't exist
  }
  
  if (new Date() > linkingCode.expiresAt) {
    // Code expired, clean up
    linkingCodes.delete(code);
    return null;
  }
  
  if (linkingCode.used) {
    return null; // Code already used
  }
  
  // Mark as used
  linkingCode.used = true;
  
  // Find the user data (in a real app, this would be from database)
  // For now, we'll return mock data or data from the web app
  return {
    chats: [],
    settings: {
      userName: 'User',
      botName: 'D00M Studios',
      useCrossChat: true
    },
    userId: linkingCode.userId
  };
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Create HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // Set CORS headers
  Object.keys(corsHeaders).forEach(key => {
    res.setHeader(key, corsHeaders[key]);
  });

  // Handle preflight requests
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API Routes
  if (path === '/api/validate-code' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const { code, bot_secret } = JSON.parse(body);
        
        console.log(`[API] Validating code: ${code}`);
        
        if (!code) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ valid: false, error: 'Code is required' }));
          return;
        }

        // Validate the linking code
        const validationResult = validateLinkingCode(code);
        
        if (!validationResult) {
          console.log(`[API] Invalid code: ${code}`);
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ valid: false, error: 'Invalid or expired code' }));
          return;
        }

        console.log(`[API] Code validated successfully: ${code}`);
        
        // Return user data
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          valid: true,
          chats: validationResult.chats,
          settings: validationResult.settings,
          username: validationResult.settings.userName
        }));

      } catch (error) {
        console.error('[API] Validation error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ valid: false, error: 'Server error' }));
      }
    });
    return;
  }

  // Generate code endpoint (for web app to call)
  if (path === '/api/generate-code' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const { chats, settings } = JSON.parse(body);
        const result = generateLinkingCode(chats || [], settings || {});
        
        console.log(`[API] Generated code: ${result.code}`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          code: result.code,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        }));
      } catch (error) {
        console.error('[API] Code generation error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Server error' }));
      }
    });
    return;
  }

  // Health check endpoint
  if (path === '/api/health' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      activeCodes: linkingCodes.size
    }));
    return;
  }

  // Stats endpoint
  if (path === '/api/stats' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      activeCodes: linkingCodes.size,
      linkedUsers: linkedUsers.size,
      uptime: process.uptime()
    }));
    return;
  }

  // 404 for unknown routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Discord Bot API Server running on port ${PORT}`);
  console.log(`📡 API Endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/validate-code`);
  console.log(`   POST http://localhost:${PORT}/api/generate-code`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   GET  http://localhost:${PORT}/api/stats`);
  console.log(`\n🤖 Discord bots can now call these endpoints!`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down API server...');
  server.close(() => {
    console.log('✅ API server stopped');
    process.exit(0);
  });
});

module.exports = server;