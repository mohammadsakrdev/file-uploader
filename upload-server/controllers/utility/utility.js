const path = require('path');
const moment = require('moment');

exports.upload = (req, res, next, pathToUpload) => {
  console.log('Upload Called');
  if (req.header('Upload-Auth') !== process.env.SECRET_KEY.toString()) {
    console.log('Upload-Auth not correct');
    return res
      .status(400)
      .send({ success: false, message: 'Un Authorized Access' });
  }
  console.log(req.files);
  if (!req.files || Object.keys(req.files).length == 0) {
    return res.status(400).send({
      success: false,
      message: 'No files uploaded.'
    });
  }
  const uploaded = [];
  console.log('Authenticated and there are files');

  Object.keys(req.files).forEach(key => {
    const file = req.files[key];
    const startDate = moment();
    // Use the mv() method to place the file somewhere on your server
    file.mv(path.join(pathToUpload, file.name), err => {
      if (err) {
        console.error('file.mv', err);
        return;
      }
      uploaded.push(file.name);
      const endDate = moment();
      const secondsDiff = endDate.diff(startDate, 'seconds');
      console.log(
        `File ${file.name} is uploaded successfully in ${secondsDiff}`
      );
    });
  });
  return res.status(200).send({ success: true, message: 'Files Uploaded !' });
};
