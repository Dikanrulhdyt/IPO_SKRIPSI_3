require('dotenv').config();
require('./src/jobs/cleanupOldData');
const app = require('./src/app');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});