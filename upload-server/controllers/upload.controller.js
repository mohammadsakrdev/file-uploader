exports.upload = (req, res, next) => {
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
      message: 'No files were uploaded.'
    });
  }
  const uploaded = [];
  console.log('Authenticated and there are files');

  Object.keys(req.files).forEach(key => {
    const file = req.files[key];
    // Use the mv() method to place the file somewhere on your server
    file.mv(`./upload/${file.name}`, err => {
      if (err) {
        return res
          .status(500)
          .send({ success: false, message: err, files: null });
      }
      uploaded.push(file.name);
      console.log(uploaded);
      console.log(`File ${file.name} is uploaded successfully`);
    });
  });
  console.log('-------------');
  console.log(uploaded);
  return res.status(200).send({ success: true, message: 'Files Uploaded !' });
};
