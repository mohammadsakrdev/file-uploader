const { promisify } = require('util');
const { readdir, createReadStream, unlink, readFileSync } = require('fs');
const readDirectory = promisify(readdir);
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');
const api_uri = `${process.env.BASE_API_URL}api/upload`;
/**
 * Function to upload files from one folder to another one
 *
 * @function
 *
 * @return {undefined}
 */
module.exports = async directoryPath => {
  try {
    const files = await readDirectory(directoryPath);
    console.log(files.length);
    if (files.length > 0) {
      let numOfValidFiles = 0;
      const form = new FormData();
      files.forEach(element => {
        const elementPath = path.join(directoryPath, element);
        const contents = readFileSync(elementPath, 'utf8');
        if (contents) {
          form.append(element, createReadStream(elementPath));
          numOfValidFiles++;
          console.log(numOfValidFiles);
        } else {
          return;
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
              unlink(path.join(directoryPath, f), err => {
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
};
