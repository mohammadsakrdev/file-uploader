require('dotenv').config();
const cron = require('node-cron');
const moveFiles = require('./move-files');

/**
 * Firing Corn job to upload files
 *
 * @function
 *
 * @return {undefined}
 */

// schedule tasks to be run on the server
cron.schedule('*/5 * * * * *', async () => {
  moveFiles(process.env.DIRECTORY_TO_LISTEN);
});
