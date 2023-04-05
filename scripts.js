const inputImages = document.getElementById('input-images');
const downloadZipButton = document.getElementById('download-zip');
const imageContainer = document.getElementById('image-container');
const zip = new JSZip();

inputImages.addEventListener('change', async (event) => {
  const files = event.target.files;
  if (files.length > 0) {
    downloadZipButton.style.display = 'inline-block';
    imageContainer.style.display = 'flex';
  }
  for (const file of files) {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.src = url;
    image.onload = () => {
      processImage(image, file.name);
      URL.revokeObjectURL(url);
    };
  }
});

downloadZipButton.addEventListener('click', () => {
  zip.generateAsync({ type: 'blob' }).then(blob => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'converted_images.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
});

async function processImage(image, fileName) {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < imageData.data.length; i += 4) {
    const red = imageData.data[i + 0];
    const green = imageData.data[i + 1];
    const blue = imageData.data[i + 2];
    const threshold = 45;

    if (red >= (255 - threshold) && red <= 255 && green >= (255 - threshold) && green <= 255 && blue >= (255 - threshold) && blue <= 255) {
      // Change to black
      imageData.data[i + 0] = 0;
      imageData.data[i + 1] = 0;
      imageData.data[i + 2] = 0;
    } else {
      // Change to transparent
      imageData.data[i + 3] = 0;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const outputDataURL = canvas.toDataURL('image/png');

  displayImages(image, outputDataURL);
  addToZip(outputDataURL, fileName);
}

function displayImages(inputImage, outputDataURL) {
    const inputImg = document.createElement('img');
    inputImg.src = inputImage.src;
    inputImg.style.margin = '10px';
    imageContainer.appendChild(inputImg);
  
    const outputImg = document.createElement('img');
    outputImg.src = outputDataURL;
    outputImg.style.margin = '10px';
    outputImg.style.cursor = 'pointer';
    imageContainer.appendChild(outputImg);
  
    outputImg.addEventListener('click', () => {
      const link = document.createElement('a');
      link.href = outputDataURL;
      link.download = 'converted_image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

function addToZip(dataURL, fileName) {
    const data = dataURL.replace(/^data:image\/(png|jpg|jpeg);base64,/, '');
    zip.file(fileName.replace(/\.[^.]+$/, '') + '_converted.png', data, { base64: true });
}
