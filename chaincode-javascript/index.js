/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

// const assetTransfer = require('./lib/assetTransfer');

// module.exports.AssetTransfer = assetTransfer;
// module.exports.contracts = [assetTransfer];



// const tnn = require('./lib/tnn');

// module.exports.TNNContract = tnn;
// module.exports.contracts = [tnn];

const hero = require('./lib/hero');

module.exports.VehiclePassportContract = hero;
module.exports.contracts = [hero];
