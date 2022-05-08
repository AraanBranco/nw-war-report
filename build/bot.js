"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _require = require('discord.js'),
    Client = _require.Client;

var _require2 = require('./s3'),
    uploadImage = _require2.uploadImage;

var config = require('../config.json');

var _require3 = require('date-fns'),
    format = _require3.format;

var client = new Client();
var PREFIX = config.PREFIX;
client.on('ready', function () {
  console.log("Logged in as ".concat(client.user.tag, "!"));
});
client.on('message', function (message) {
  // If message is bot
  if (message.author.bot) return; // if message not have prefix (command bot)

  if (message.channel.name === config.CHANNEL) {
    if (!message.content.startsWith(PREFIX)) return;
    var commandBody = message.content.slice(PREFIX.length);
    var args = commandBody.split(' ');
    var command = args.shift().toLowerCase(); // Return if command is not exist

    if (!config.COMMANDS.includes(command)) return;

    if (command === 'send') {
      var territory = args[0];
      var warDate = format(new Date(), 'yyyy-MM-dd');
      var s3Path = "".concat(territory, "-").concat(warDate);
      message.channel.send("Getting all the prints of the **".concat(territory, "** war from **").concat(warDate, "**"));
      message.channel.messages.fetch().then( /*#__PURE__*/function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(messages) {
          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  _context3.next = 2;
                  return Promise.all(messages.map( /*#__PURE__*/function () {
                    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(message) {
                      var attachs;
                      return regeneratorRuntime.wrap(function _callee2$(_context2) {
                        while (1) {
                          switch (_context2.prev = _context2.next) {
                            case 0:
                              if (!(!message.author.bot && message.attachments.size > 0)) {
                                _context2.next = 5;
                                break;
                              }

                              message.react('🔍');
                              attachs = message.attachments.toJSON();
                              _context2.next = 5;
                              return attachs.map( /*#__PURE__*/function () {
                                var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(att) {
                                  return regeneratorRuntime.wrap(function _callee$(_context) {
                                    while (1) {
                                      switch (_context.prev = _context.next) {
                                        case 0:
                                          _context.next = 2;
                                          return uploadImage(s3Path, att);

                                        case 2:
                                          return _context.abrupt("return", _context.sent);

                                        case 3:
                                        case "end":
                                          return _context.stop();
                                      }
                                    }
                                  }, _callee);
                                }));

                                return function (_x3) {
                                  return _ref3.apply(this, arguments);
                                };
                              }());

                            case 5:
                            case "end":
                              return _context2.stop();
                          }
                        }
                      }, _callee2);
                    }));

                    return function (_x2) {
                      return _ref2.apply(this, arguments);
                    };
                  }()));

                case 2:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3);
        }));

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      }());
    }

    if (command === 'clear') {
      message.channel.messages.fetch().then( /*#__PURE__*/function () {
        var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(messages) {
          return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
              switch (_context5.prev = _context5.next) {
                case 0:
                  _context5.next = 2;
                  return Promise.all(messages.map( /*#__PURE__*/function () {
                    var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(message) {
                      return regeneratorRuntime.wrap(function _callee4$(_context4) {
                        while (1) {
                          switch (_context4.prev = _context4.next) {
                            case 0:
                              message["delete"]();

                            case 1:
                            case "end":
                              return _context4.stop();
                          }
                        }
                      }, _callee4);
                    }));

                    return function (_x5) {
                      return _ref5.apply(this, arguments);
                    };
                  }()));

                case 2:
                  message.channel.send('Send all prints of war and send command `!send <name-territory-war>` to start analyzing...');

                case 3:
                case "end":
                  return _context5.stop();
              }
            }
          }, _callee5);
        }));

        return function (_x4) {
          return _ref4.apply(this, arguments);
        };
      }());
    }
  }
});
client.login(config.DISCORD_TOKEN);