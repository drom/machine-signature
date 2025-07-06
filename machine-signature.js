#!/usr/bin/env node
'use strict';

const os = require('os');
const fs = require('fs');
const process = require('process');

const dmiProps = `
  product_name chassis_vendor

  bios_date bios_version board_serial chassis_asset_tag modalias
  product_uuidsys_vendor bios_release board_asset_tag board_vendor
  chassis_serial chassis_version product_serial product_version uevent
  bios_vendor board_name board_version chassis_type ec_firmware_release
  product_family product_sku
`.trim().split(/\s+/);

const main = async () => {

  const res = {
    arch: process.arch,
    type: os.type(),
    release: os.release(),
    // platform: process.platform,
    platform: os.platform(),
    macs: []
  };

  // https://stackoverflow.com/questions/328936/getting-a-unique-id-from-a-unix-like-system

  // Mac OSX
  // https://stackoverflow.com/questions/933460/unique-hardware-id-in-mac-os-x

  // MAC address
  const networkInterfaces = os.networkInterfaces();
  for (const [key, addresses] of Object.entries(networkInterfaces)) {
    for (const address of addresses) {
      if (address.family === 'IPv4' && !address.internal) {
        res.macs.push({[key]: address.mac});
      }
    }
  }

  if (os.platform() === 'linux') {
    res.dmi = {};
    // DMI (Desktop Management Interface)
    for (const propName of dmiProps) {
      try {
        const prop = await fs.promises.readFile('/sys/devices/virtual/dmi/id/' + propName, 'utf8');
        res.dmi[propName] = prop;
      } catch(err) {
        // not available
      }
    }
  }

  console.log(res);
};

main();