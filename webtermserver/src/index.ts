import express = require('express');
import serialport = require('serialport');
import bodyParser = require('body-parser');
import cors = require('cors');
// @ts-ignore
import parserByteLength = require('@serialport/parser-byte-length');

const webterm = express();
webterm.use(bodyParser.json());
webterm.use(cors());

let serial: serialport;
let parser: any;
let serialData: string;
webterm.listen(4567, () => {
  console.log('Listening to port 4567');
});

webterm.get('/serialout', (req, resp) => {
  resp.send(serialData);
});

webterm.post('/serialport', (req, resp) => {
  serial = new serialport(req.body.comport, {
    baudRate: parseInt(req.body.baudRate, 10) as number,
    autoOpen: false,
  });
  serial.open((err) => {
    if (err) console.log(err);
    if (err) {
      resp.send('error when creating serialport');
    } else {
      parser = serial.pipe(new parserByteLength({ length: 500 }));
      parser.on('data', (data: any) => {
        console.log(data.toString());
        serialData = `${serialData}${data.toString()}`;
      });
      resp.send('created serialport');
    }
  });
});

webterm.get('/serialport', (req, resp) => {
  if (serial.isOpen) {
    resp.send('ok');
  } else {
    resp.send('bad');
  }
});

webterm.delete('/serialport', (req, resp) => {
  console.log('delete serport called');
  if (serial.isOpen) {
    serial.close();
  }
  if (parser) {
    parser.removeAllListeners();
  }
  resp.sendStatus(200);
});

webterm.delete('/serialout', (req, resp) => {
  console.log('delete serialout called');
  serialData = '';
  resp.sendStatus(200);
});
