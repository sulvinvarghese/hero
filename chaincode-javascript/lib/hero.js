'use strict';

const { Contract } = require('fabric-contract-api');

class VehiclePassportContract extends Contract {
  async createPassport(ctx, passportID, owner, manufacturer, model, year) {
    const passportExists = await this.passportExists(ctx, passportID);
    if (passportExists) {
      throw new Error(`Passport with ID ${passportID} already exists`);
    }

    const passport = {
      passportID,
      owner,
      manufacturer,
      model,
      year,
      telematicsData: [],
      serviceRecords: [],
      insurance: null,
    };

    await ctx.stub.putState(passportID, Buffer.from(JSON.stringify(passport)));

    return passport;
  }

  async getPassport(ctx, passportID) {
    const passportJSON = await ctx.stub.getState(passportID);
    if (!passportJSON || passportJSON.length === 0) {
      throw new Error(`Passport with ID ${passportID} does not exist`);
    }

    return JSON.parse(passportJSON.toString());
  }

  async addTelematicsData(ctx, passportID, data) {
    const passport = await this.getPassport(ctx, passportID);

    passport.telematicsData.push(data);

    await ctx.stub.putState(passportID, Buffer.from(JSON.stringify(passport)));

    return passport;
  }

  async addServiceRecord(ctx, passportID, record) {
    const passport = await this.getPassport(ctx, passportID);

    passport.serviceRecords.push(record);

    await ctx.stub.putState(passportID, Buffer.from(JSON.stringify(passport)));

    return passport;
  }

  async getTelematicsData(ctx, passportID) {
    const passport = await this.getPassport(ctx, passportID);

    return passport.telematicsData;
  }

  async getServiceRecords(ctx, passportID) {
    const passport = await this.getPassport(ctx, passportID);

    return passport.serviceRecords;
  }

  async addInsurance(ctx, passportID, insurance) {
    const passport = await this.getPassport(ctx, passportID);

    passport.insurance = insurance;

    await ctx.stub.putState(passportID, Buffer.from(JSON.stringify(passport)));

    return passport;
  }

  async getInsurance(ctx, passportID) {
    const passport = await this.getPassport(ctx, passportID);

    return passport.insurance;
  }

  async passportExists(ctx, passportID) {
    const passportJSON = await ctx.stub.getState(passportID);

    return passportJSON && passportJSON.length > 0;
  }
}

module.exports = VehiclePassportContract;




// 'use strict';

// const { Contract } = require('fabric-contract-api');

// class VehiclePassportContract extends Contract {
//   async instantiate(ctx) {
//     console.log('Vehicle Passport contract instantiated');
//   }

//   async createPassport(ctx, passportID, owner, manufacturer, model, year) {
//     // Check if the passport with the given ID already exists
//     const passportExists = await this.passportExists(ctx, passportID);
//     if (passportExists) {
//       throw new Error(`Passport with ID ${passportID} already exists`);
//     }

//     // Create a new passport object
//     const passport = {
//       passportID,
//       owner,
//       manufacturer,
//       model,
//       year,
//       telematicsData: [],
//       serviceRecords: [],
//     };

//     // Store the passport object in the world state
//     await ctx.stub.putState(passportID, Buffer.from(JSON.stringify(passport)));

//     // Emit an event for the creation of a new passport
//     await ctx.stub.setEvent('PassportCreated', Buffer.from(JSON.stringify(passport)));

//     return passport;
//   }

//   async getPassport(ctx, passportID) {
//     // Retrieve the passport object from the world state
//     const passportJSON = await ctx.stub.getState(passportID);
//     if (!passportJSON || passportJSON.length === 0) {
//       throw new Error(`Passport with ID ${passportID} does not exist`);
//     }

//     return JSON.parse(passportJSON.toString());
//   }

//   // async addTelematicsData(ctx, passportID, data) {
//   //   const passport = await this.getPassport(ctx, passportID);
  
//   //   // Add the new telematics data to the passport
//   //   passport.telematicsData.push(JSON.stringify(data));
  
//   //   await ctx.stub.putState(passportID, Buffer.from(JSON.stringify(passport)));
  
//   //   return passport;
//   // }
  
//   // async addServiceRecord(ctx, passportID, record) {
//   //   const passport = await this.getPassport(ctx, passportID);
  
//   //   // Add the new service record to the passport
//   //   passport.serviceRecords.push(JSON.stringify(record));
  
//   //   await ctx.stub.putState(passportID, Buffer.from(JSON.stringify(passport)));
  
//   //   return passport;
//   // }

//   async addTelematicsData(ctx, passportID, data) {
//     // Retrieve the passport object from the world state
//     const passport = await this.getPassport(ctx, passportID);

//     // Add the new telematics data to the passport
//     passport.telematicsData.push(data);

//     // Update the passport in the world state
//     await ctx.stub.putState(passportID, Buffer.from(JSON.stringify(passport)));

//     // Emit an event for the addition of telematics data
//     await ctx.stub.setEvent('TelematicsDataAdded', Buffer.from(JSON.stringify(passport)));

//     return passport;
    
//   }

  

//   async addServiceRecord(ctx, passportID, record) {
//     // Retrieve the passport object from the world state
//     const passport = await this.getPassport(ctx, passportID);

//     // Add the new service record to the passport
//     passport.serviceRecords.push(record);

//     // Update the passport in the world state
//     await ctx.stub.putState(passportID, Buffer.from(JSON.stringify(passport)));

//     // Emit an event for the addition of a service record
//     await ctx.stub.setEvent('ServiceRecordAdded', Buffer.from(JSON.stringify(passport)));

//     return passport;
//   }

//   async getTelematicsData(ctx, passportID) {
//     // Retrieve the passport object from the world state
//     const passport = await this.getPassport(ctx, passportID);

//     return passport.telematicsData;
//   }

//   async getServiceRecords(ctx, passportID) {
//     // Retrieve the passport object from the world state
//     const passport = await this.getPassport(ctx, passportID);

//     return passport.serviceRecords;
//   }

//   async passportExists(ctx, passportID) {
//     // Check if the passport with the given ID exists in the world state
//     const passportJSON = await ctx.stub.getState(passportID);

//     return passportJSON && passportJSON.length > 0;
//   }
// }

// module.exports = VehiclePassportContract;


// // 'use strict';

// // const { Contract } = require('fabric-contract-api');

// // class DigitalVehiclePassportContract extends Contract {
// //   async createPassport(ctx, passportId, vehicleNumber, owner) {
// //     console.info('Creating a new vehicle passport...');

// //     const passport = {
// //       id: passportId,
// //       vehicleNumber,
// //       owner,
// //       trips: [],
// //     };

// //     await ctx.stub.putState(passportId, Buffer.from(JSON.stringify(passport)));
// //     console.info('New vehicle passport created successfully!');
// //   }

// //   async addTrip(ctx, passportId, tripId, tripData) {
// //     console.info(`Adding a trip to passport ${passportId}...`);

// //     const passportBuffer = await ctx.stub.getState(passportId);
// //     if (!passportBuffer || passportBuffer.length === 0) {
// //       throw new Error(`Vehicle passport ${passportId} does not exist!`);
// //     }

// //     const passport = JSON.parse(passportBuffer.toString());
// //     const trip = {
// //       id: tripId,
// //       data: tripData,
// //     };

// //     passport.trips.push(trip);

// //     await ctx.stub.putState(passportId, Buffer.from(JSON.stringify(passport)));
// //     console.info(`Trip added to passport ${passportId} successfully!`);
// //   }

// //   async getPassport(ctx, passportId) {
// //     console.info(`Getting passport ${passportId}...`);

// //     const passportBuffer = await ctx.stub.getState(passportId);
// //     if (!passportBuffer || passportBuffer.length === 0) {
// //       throw new Error(`Vehicle passport ${passportId} does not exist!`);
// //     }

// //     const passport = JSON.parse(passportBuffer.toString());
// //     return passport;
// //   }
// // }

// // module.exports = DigitalVehiclePassportContract;



