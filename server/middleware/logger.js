// Logger Middleware
const logger = (req, res, next) => {
  // Keep test output readable - Jest sets NODE_ENV=test
  if (process.env.NODE_ENV === 'test') return next();

  const method = req.method;
  const url = req.url;
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] ${method} ${url}`);
  
  next();
};

export default logger;
