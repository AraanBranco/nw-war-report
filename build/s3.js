"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uploadToS3 = exports.uploadImage = void 0;

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var fs = require('fs');

var https = require('https');

var Stream = require('stream').Transform;

var AWS = require('aws-sdk');

var config = require('../config.json');

var uploadImage = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(pathImageLocal, objectImage) {
    var url, name, pathImage, pathS3;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            url = objectImage.url, name = objectImage.name;
            pathImage = "./uploads/".concat(pathImageLocal, "/").concat(name);
            pathS3 = "".concat(pathImageLocal, "/").concat(name);
            _context.next = 5;
            return checkFolders(pathImageLocal);

          case 5:
            _context.next = 7;
            return getImage(url, pathImage);

          case 7:
            _context.next = 9;
            return uploadToS3(pathImage, pathS3);

          case 9:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function uploadImage(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

exports.uploadImage = uploadImage;

var getImage = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(url, pathImage) {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            return _context2.abrupt("return", new Promise(function (resolve, reject) {
              https.request(url, function (response) {
                var data = new Stream();
                response.on('data', function (chunk) {
                  data.push(chunk);
                });
                response.on('error', function (err) {
                  reject(err);
                });
                response.on('end', function () {
                  resolve(fs.promises.writeFile(pathImage, data.read(), {
                    flag: 'w+'
                  }));
                });
              }).end();
            }));

          case 1:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function getImage(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

var checkFolders = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(pathImageLocal) {
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return fs.promises.mkdir("./uploads/".concat(pathImageLocal), {
              recursive: true
            });

          case 2:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function checkFolders(_x5) {
    return _ref3.apply(this, arguments);
  };
}();

var uploadToS3 = function uploadToS3(filePath, pathS3) {
  var blob = fs.readFileSync(filePath);
  var S3 = new AWS.S3({
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY
  });
  var params = {
    Body: blob,
    Bucket: config.BUCKET,
    Key: pathS3
  };
  S3.putObject(params, function (err, data) {
    if (err) console.error(err, err.stack);
  });
};

exports.uploadToS3 = uploadToS3;