const dateFormat = require('dateformat');
const Config = require('./Config');
const Device = require('./Device');
const System = require('./System');

class ScanRequest {

  static createDefault(device) {
    return {
      top: 0,
      left: 0,
      width: device.features['-x'].limits[1],
      height: device.features['-y'].limits[1],
      resolution: device.features['--resolution'].default,
      mode: device.features['--mode'].default,
      format: 'tiff',
      brightness: 0,
      contrast: 0,
      convertFormat: 'tif',
      dynamicLineart: true
    };
  }

  static build(input) {
    const device = new Device();
    if ('device' in input && input.device) {
      device.load(input.device);
    }

    const request = System.extend(ScanRequest.createDefault(device), input);

    if ('outputFilepath' in request === false) {
      const dateString = dateFormat(new Date(), 'yyyy-mm-dd HH.MM.ss');
      request.outputFilepath = Config.OutputDirectory + 'scan_' + dateString + '.' + request.convertFormat;
    }
    if ('--brightness' in device.features === false) {
      delete request.brightness;
    }
    if ('--contrast' in device.features === false) {
      delete request.contrast;
    }
    if ('--disable-dynamic-lineart' in device.features === false) {
      delete request.dynamicLineart;
    }

    return request;
  }

  constructor(arg) {
    System.extend(this, ScanRequest.build(arg));
    console.log(this);
  }

  validate() {
    const errors = [];

    if (this.mode === undefined) {
      errors.push('Invalid mode: ' + this.mode);
    }

    if (!Number.isInteger(this.width)) {
      errors.push('Invalid width: ' + this.width);
    }

    if (!Number.isInteger(this.height)) {
      errors.push('Invalid height: ' + this.height);
    }

    if (!Number.isInteger(this.top)) {
      errors.push('Invalid top: ' + this.top);
    }

    if (!Number.isInteger(this.left)) {
      errors.push('Invalid left: ' + this.left);
    }

    if (!Number.isInteger(this.brightness)) {
      errors.push('Invalid brightness: ' + this.brightness);
    }

    if (!Number.isInteger(this.contrast)) {
      errors.push('Invalid contrast: ' + this.contrast);
    }

    if ('depth' in this && !Number.isInteger(this.depth)) {
      errors.push('Invalid depth: ' + this.depth);
    }

    if (this.top + this.height > Config.MaximumScanHeightInMm) {
      errors.push('Top + height exceed maximum dimensions');
    }

    if (['tif', 'jpg', 'png', 'pdf'].indexOf(this.convertFormat) === -1) {
      errors.push('Invalid format type');
    }

    return errors;
  }
}

module.exports = ScanRequest;