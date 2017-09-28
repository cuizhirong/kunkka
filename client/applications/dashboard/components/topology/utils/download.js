/**
 * convert canvas data to image source, then download it.
 */
module.exports = (fileName, content) => {
  const base64ImgToBlob = data => {
    const parts = data.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], {
      type: contentType
    });
  };
  const aLink = document.createElement('a');
  const blob = base64ImgToBlob(content);
  aLink.download = fileName;
  aLink.href = URL.createObjectURL(blob);
  aLink.click();
};
