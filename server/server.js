// Process entry point: load env, connect to MongoDB, register listeners, listen.
// The Express app itself lives in app.js so tests can import it without
// opening a port or connecting to a database.
import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';
import { isCacheEnabled } from './config/cache.js';
import { registerListeners } from './events/listeners.js';

// Fail fast if the secret is missing - never fall back to a hardcoded one
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set. Copy .env.example to .env and set it.');
  process.exit(1);
}

// Connect to MongoDB
await connectDB();

// Register event listeners once, before any request can emit an event
registerListeners();

const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Cache ${isCacheEnabled() ? 'ENABLED' : 'DISABLED'} (TTL ${process.env.CACHE_TTL || 60}s)`);
  console.log(`Notifications: ${process.env.NOTIFY_MODE === 'sync' ? 'SYNC (inline, for comparison)' : 'ASYNC via EventEmitter'}, simulated delay ${process.env.NOTIFY_DELAY_MS ?? 2000} ms`);
});
