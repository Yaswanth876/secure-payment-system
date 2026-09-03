import app from './app.js';
import { config } from './config/config.js';

app.listen(config.port, () => {
  console.log(`Payment Guardian API listening on port ${config.port}`);
});