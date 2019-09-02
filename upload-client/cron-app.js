require('dotenv').config();
const { promisify } = require('util');
const { readdir, createReadStream, unlink, readFileSync } = require('fs');
const readDirectory = promisify(readdir);
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');
const cron = require('node-cron');
const api_uri = `${process.env.BASE_API_URL}api/upload`;

/**
 * Firing Corn job to move files from one folder to another one
 *
 * @function
 *
 * @return {undefined}
 */

// schedule tasks to be run on the server
cron.schedule('*/5 * * * * *', async () => {
  try {
    const files = await readDirectory(process.env.DIRECTORY_TO_LISTEN);
    console.log(files.length);
    if (files.length > 0) {
      let numOfValidFiles = 0;
      const form = new FormData();
      files.forEach(element => {
        const elementPath = path.join(process.env.DIRECTORY_TO_LISTEN, element);
        const contents = readFileSync(elementPath, 'utf8');
        if (contents) {
          form.append(element, createReadStream(elementPath));
          numOfValidFiles++;
          console.log(numOfValidFiles);
        }
      });
      if (numOfValidFiles > 0) {
        const response = await axios.post(api_uri, form, {
          headers: {
            'Content-Type': `multipart/form-data; boundary=${form._boundary}`,
            'Upload-Auth': process.env.SECRET_KEY.toString()
          }
        });

        if (response) {
          console.log('@Response', response.status);
          console.log('@Response', response.data.files);
          if (response.status === 200) {
            files.forEach(f => {
              unlink(path.join(process.env.DIRECTORY_TO_LISTEN, f), err => {
                if (err) {
                  console.error(err);
                  return;
                }
                console.log(`File ${f} is deleted`);
              });
            });
          }
        }
      } else {
        console.log('Number of valid files is zero');
      }
    } else {
      console.log('No files to be transferred');
    }
  } catch (err) {
    console.error(err);
  }
});
