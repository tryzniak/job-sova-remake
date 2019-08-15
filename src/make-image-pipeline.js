const sharp = require("sharp");

module.exports = (
  filenameThunk,
  filenamePathThunk,
  format,
  width,
  height
) => async file => {
  const filename = await filenameThunk(format);
  await sharp(file.buffer)
    .toFormat(format)
    .resize(width, height)
    .toFile(filenamePathThunk(filename));
  return filename;
};
