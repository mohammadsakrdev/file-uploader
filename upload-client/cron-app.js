require('dotenv').config();
const cron = require('node-cron');
const axios = require('axios');
const { getFiles } = require('./utility/utility.js');

/**
 * Firing Corn job to upload files
 *
 * @function
 *
 * @return {undefined}
 */

// schedule tasks to be run on the server
module.exports = () => {
  cron.schedule('*/5 * * * * *', async () => {
    try {
      console.log('Job Started');
      const paths = await getFiles();
      const response = await axios.post(
        process.env.ALL_API_URL,
        { old: paths.old, live: paths.live, test: paths.test },
        {
          headers: {
            'Upload-Auth': process.env.SECRET_KEY.toString()
          }
        }
      );

      if (response) {
        console.log('@Response', response.status);
        console.log('@Response', response.data.files);
        if (response.status === 200) {
          console.log('@Response files names sent');
        }
      }
    } catch (error) {
      console.error('@CronJob', { error });
    }
  });
};
