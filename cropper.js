function cropWhiteSpace(imageObject, options) {
  var start = new Date();
  imgWidth = imageObject.naturalWidth;
  imgHeight = imageObject.naturalHeight;
  var canvas = document.createElement("canvas");
  canvas.setAttribute("width", imgWidth);
  canvas.setAttribute("height", imgHeight);
  if (options.debug) {
    document.body.appendChild(canvas);
  }
  var context = canvas.getContext("2d");
  context.drawImage(imageObject, 0, 0);

  try {
    var imageData = context.getImageData(0, 0, imgWidth, imgHeight),
      data = imageData.data,
      getRBG = function(x, y) {
        var offset = imgWidth * y + x;
        return {
          red: data[offset * 4],
          green: data[offset * 4 + 1],
          blue: data[offset * 4 + 2],
          opacity: data[offset * 4 + 3]
        };
      },
      isWhite = function(rgb) {
        // 255 yerine 200 kullanmamin sebebi jpg encode ederken npise olabiliyo
        return rgb.red > 200 && rgb.green > 200 && rgb.blue > 200;
      },
      scanY = function(fromTop) {
        var offset = fromTop ? 1 : -1;

        // her satir
        for (
          var y = fromTop ? 0 : imgHeight - 1;
          fromTop ? y < imgHeight : y > -1;
          y += offset
        ) {
          // her sutun (pixel)
          for (var x = 0; x < imgWidth; x++) {
            var rgb = getRBG(x, y);
            if (!isWhite(rgb)) {
              if (fromTop) {
                return y;
              } else {
                return Math.min(y + 1, imgHeight - 1);
              }
            }
          }
        }
        return null; // hepsi beyaz
      },
      scanX = function(fromLeft) {
        var offset = fromLeft ? 1 : -1;

        // her satir
        for (
          var x = fromLeft ? 0 : imgWidth - 1;
          fromLeft ? x < imgWidth : x > -1;
          x += offset
        ) {
          // her sutun (pixel)
          for (var y = 0; y < imgHeight; y++) {
            var rgb = getRBG(x, y);
            if (!isWhite(rgb)) {
              if (fromLeft) {
                return x;
              } else {
                return Math.min(x + 1, imgWidth - 1);
              }
            }
          }
        }
        return null; // hepsi beyaz
      };

    var cropTop = scanY(true),
      cropBottom = scanY(false),
      cropLeft = scanX(true),
      cropRight = scanX(false),
      cropWidth = cropRight - cropLeft,
      cropHeight = cropBottom - cropTop;

    if (options.shouldCover) {
      if (cropWidth < imgWidth - 1) {
        cropHeight = cropWidth / imgWidth * cropHeight;
        cropTop = cropBottom = (imgHeight - cropHeight) / 2;
      } else if (cropHeight < imgHeight - 1) {
        cropWidth = cropHeight / imgHeight * cropWidth;
        cropLeft = cropRight = (imgWidth - cropWidth) / 2;
      }
    }

    canvas.setAttribute("width", cropWidth);
    canvas.setAttribute("height", cropHeight);

    canvas
      .getContext("2d")
      .drawImage(
        imageObject,
        cropLeft,
        cropTop,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );

    var diff = new Date() - start;
    if (options.debug) {
      console.debug("Process done in " + diff + " ms (no web workers)");
    }
    var dataUrl = canvas.toDataURL();
    canvas = undefined;
    context = undefined;
    return dataUrl;
  } catch (e) {
    console.error(e, imageObject);
    return undefined;
  }
}

function attachToImages(options) {
  selector = options.selector || "img";
  var images = document.querySelectorAll(selector);
  images.forEach(function(image, index) {
    image.crossOrigin = "Anonymous";
    image.onload = function() {
      var imageData = cropWhiteSpace(image, options); //Will return cropped image data
      image.src = imageData;
      image.onload = undefined;
    };
  });
}

/** attachToImages({
  shouldCover: true,
  selector: "img"
}); */
