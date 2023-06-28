


// // #####################################Working Below###########################################333


const { FileSystemWallet, Gateway,Wallets,X509WalletMixin} = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const express = require('express');
const fs = require('fs');
const walletPath = path.join(__dirname, 'wallet');

const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('../../test-application/javascript/AppUtil.js');
const channelName = 'mychannel';
const chaincodeName = 'hero';

// const org1UserId = 'javascriptAppUser';
// const mspOrg1 = 'Org1MSP';
const org1 = 'Org1MSP';
const Org1UserId = 'appUser1';




async function enrollAndRegisterIdentity(caURL, caName, adminUsername, adminPassword, orgName, username) {
  try {
    // Create a CA client instance
    const caInfo = await new FabricCAServices(caURL).getCaInfo();
    const caTLSCACerts = caInfo.tlsCACerts.pem;

    // Create a wallet to store identities
    const walletPath = path.join(__dirname, 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // Check if the user identity already exists in the wallet
    const userIdentity = await wallet.get(username);
    if (userIdentity) {
      console.log(`Identity ${username} already exists in the wallet.`);
      return;
    }

    // Enroll the CA admin
    const enrollment = await caClient.enroll({
      enrollmentID: adminUsername,
      enrollmentSecret: adminPassword,
      tlsOptions: {
        trustedRoots: caTLSCACerts,
        verify: false,
      },
    });

    // Create a new user identity for the organization
    const identity = X509WalletMixin.createIdentity(orgName, enrollment.certificate, enrollment.key.toBytes());
    await wallet.put(username, identity);

    console.log(`Identity ${username} enrolled and registered successfully.`);
  } catch (error) {
    console.error(`Failed to enroll and register identity: ${error}`);
  }
}

async function initGatewayForOrg1(useCommitEvents) {

	// build an in memory object with the network configuration (also known as a connection profile)
	const ccpOrg1 = buildCCPOrg1();

	// build an instance of the fabric ca services client based on
	// the information in the network configuration
	const caOrg1Client = buildCAClient(FabricCAServices, ccpOrg1, 'ca.org1.example.com');

	// setup the wallet to cache the credentials of the application user, on the app server locally
	const walletPathOrg1 = path.join(__dirname, 'wallet', 'org1');
	const walletOrg1 = await buildWallet(Wallets, walletPathOrg1);

	// in a real application this would be done on an administrative flow, and only once
	// stores admin identity in local wallet, if needed
	await enrollAdmin(caOrg1Client, walletOrg1, org1);
	// register & enroll application user with CA, which is used as client identify to make chaincode calls
	// and stores app user identity in local wallet
	// In a real application this would be done only when a new user was required to be added
	// and would be part of an administrative flow
	await registerAndEnrollUser(caOrg1Client, walletOrg1, org1, Org1UserId, 'org1.department1');

	try {
		// Create a new gateway for connecting to Org's peer node.
		const gatewayOrg1 = new Gateway();

		if (useCommitEvents) {
			await gatewayOrg1.connect(ccpOrg1, {
				wallet: walletOrg1,
				identity: Org1UserId,
				discovery: { enabled: true, asLocalhost: true }
			});
		} else {
			await gatewayOrg1.connect(ccpOrg1, {
				wallet: walletOrg1,
				identity: Org1UserId,
				discovery: { enabled: true, asLocalhost: true },
				// eventHandlerOptions: EventStrategies.NONE
			});
		}


		return gatewayOrg1;
	} catch (error) {
		console.error(`Error in connecting to gateway for Org1: ${error}`);
		process.exit(1);
	}
}

async function main() {

    try {
 
        console.log('Identity creation process completed.');


        // Start server
        const port = 8081;
        const app = express();
        app.use(express.json());


/** ******* Fabric client init: Using Org1 identity to Org1 Peer ******* */
const gateway1Org1 = await initGatewayForOrg1(true); // transaction handling uses commit events
const gateway2Org1 = await initGatewayForOrg1();

const network1Org1 = await gateway1Org1.getNetwork(channelName);
console.log('Connected to the network successfully.');
const contract1Org1 = network1Org1.getContract(chaincodeName);
console.log('Connected to the contract successfully.');


    
        app.get('/', (req, res) => {
          res.send('Hello, World!');
      }); 

      


// app.post('/passport', async (req, res) => {
//   console.log("creating Hero");
//   try {
//     // const { gateway, contract } = await connectToNetwork();
//     const { passportId, vehicleNumber, owner  } = req.body;
//     console.log(passportId, vehicleNumber, owner );
//     const result = await contract1Org1.submitTransaction('createPassport', passportId, vehicleNumber, owner);
//     // console.log(result);
//     console.log("result")
//     console.log(result.toString());
//     console.log("result1")
//     console.log(result);

//     res.json({ result: result.toString() });
//   } catch (error) {
//     console.error('Error creating Passport:', error.message);
//     res.status(500).json({ error: 'Failed to create Passport' });
//   }
// });

// // Add a trip to a vehicle passport
// app.post('/passport/:passportId/trips', async (req, res) => {
//   // const contract = await connectToNetwork();
//   console.log("creating Hero");
//   try {
//   const { passportId } = req.params;
//   const { tripId, tripData } = req.body;
//   console.log(passportId, tripId, tripData );
//   const result = await contract1Org1.submitTransaction('addTrip', passportId, tripId, tripData);

//   res.json({ result: result.toString() });
// res.status(200).json(response);
// } catch (error) {
//   console.error('Error creating Passport:', error.message);
//   res.status(500).json({ error: 'Failed to create Passport' });
// }
// });



// app.get('/passport/:passportId', async (req, res) => { //http://localhost:8081/ehr/225
//   try {
//       // const contract = await connectToNetwork();
//       const { passportId } = req.params;
//       console.log(passportId+":passportId");
//       const result = await contract1Org1.evaluateTransaction('getPassport', passportId);
//       res.json(JSON.parse(result.toString()));
//       //res.status(200).json({ passport: result.toString() });
//   } catch (error) {
//     console.error('Error retrieving Passport:', error.message);
//     res.status(500).json({ error: 'Failed to retrieve Passport' });
// }
// });


// Create a vehicle passport
app.post('/passport', async (req, res) => {
  try {

    const { passportID, owner, manufacturer, model, year } = req.body;
    console.log("passportID, owner, manufacturer, model, year :"+passportID, owner, manufacturer, model, year );
    await contract1Org1.submitTransaction('createPassport', passportID, owner, manufacturer, model, year);

    res.status(200).json({ message: 'Passport created successfully' });
  } catch (error) {
    console.error(`Failed to create passport: ${error.message}`);
    res.status(500).json({ error: 'Failed to create passport' });
  }
});



app.post('/telematics/:passportID', async (req, res) => {
  try {
    const { passportID } = req.params;
    const { data } = req.body;
    console.log("passportID, data:" + passportID, data);

    const response = await contract1Org1.submitTransaction('addTelematicsData', passportID, data);

      res.status(200).json({ success: true, message: 'Telematics data added successfully' });

  } catch (error) {
    console.error(`Failed to add telematics data: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to add telematics data' });
  }
});


// Add service record to a passport
app.post('/service/:passportID', async (req, res) => {
  try {

    const { passportID } = req.params;
    const { record } = req.body;
    console.log("passportID, record:"+passportID, record)
    await contract1Org1.submitTransaction('addServiceRecord', passportID, record);

    res.status(200).json({ message: 'Service record added successfully' });
  } catch (error) {
    console.error(`Failed to add service record: ${error.message}`);
    res.status(500).json({ error: 'Failed to add service record' });
  }
});

// Add insurance record to a passport
app.post('/insurance/:passportID', async (req, res) => {
  try {

    const { passportID } = req.params;
    const { record } = req.body;
    console.log("passportID, record:"+passportID, record)
    await contract1Org1.submitTransaction('addInsurance', passportID, record);

    res.status(200).json({ message: 'Insurance record added successfully' });
  } catch (error) {
    console.error(`Failed to add insurance record: ${error.message}`);
    res.status(500).json({ error: 'Failed to add insurance record' });
  }
});

// Retrieve telematics data of a passport
app.get('/telematics/:passportID', async (req, res) => {
  try {

    const { passportID } = req.params;
    console.log("passportID:"+passportID)
    const telematicsData = await contract1Org1.evaluateTransaction('getTelematicsData', passportID);
    console.log("get telematics data");
    console.log(JSON.parse(telematicsData.toString()));
    console.log(telematicsData.response.json());
    res.status(200).json({ telematicsData: JSON.parse(telematicsData) });
    // res.status(200).json({ telematicsData: JSON.parse(telematicsData.toString()) });
  } catch (error) {
    console.error(`Failed to retrieve telematics data: ${error.message}`);
    res.status(500).json({ error: 'Failed to retrieve telematics data' });
  }
});

// Retrieve service records of a passport
app.get('/service/:passportID', async (req, res) => {
  try {

    const { passportID } = req.params;
    console.log("passportID:"+passportID)
    const serviceRecords = await contract1Org1.evaluateTransaction('getServiceRecords', passportID);

    res.status(200).json({ serviceRecords: JSON.parse(serviceRecords.toString()) });
  } catch (error) {
    console.error(`Failed to retrieve service records: ${error.message}`);
    res.status(500).json({ error: 'Failed to retrieve service records' });
  }
});

// Retrieve insurance records of a passport
app.get('/insurance/:passportID', async (req, res) => {
  try {

    const { passportID } = req.params;
    console.log("passportID:"+passportID)
    const insuranceRecords = await contract1Org1.evaluateTransaction('getInsurance', passportID);

    res.status(200).json({ insuranceRecords: JSON.parse(insuranceRecords.toString()) });
  } catch (error) {
    console.error(`Failed to retrieve insurance records: ${error.message}`);
    res.status(500).json({ error: 'Failed to retrieve service records' });
  }
});

// Retrieve passport details
app.get('/passport/:passportID', async (req, res) => {
  try {

    const { passportID } = req.params;
    console.log("passportID:"+passportID)
    const passportDetails = await contract1Org1.evaluateTransaction('getPassport', passportID);

    // res.status(200).json({ passportDetails: JSON.parse(passportDetails.toString()) });
    console.log(typeof passportDetails)

       // Log passportDetails to inspect its structure
    // console.log("Passport Details:", passportDetails);
    console.log( "*************************************************************\n\n",JSON.parse(passportDetails.toString()));
    const passportDet=(JSON.parse(passportDetails.toString()));
    console.log(typeof passportDet)
    console.log(typeof passportDet.telematicsData)
    console.log(JSON.stringify(passportDet.telematicsData),passportDet.telematicsData[0])
    
    res.status(200).json({ passportDetails: passportDet });
  } catch (error) {
    console.error(`Failed to retrieve passport details: ${error.message}`);
    res.status(500).json({ error: 'Failed to retrieve passport details' });
  }
});


        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });


    } catch (error) {
        console.error('Failed to run the identity creation process:', error);
        process.exit(1);
    }
}

main();


//***************************************Working Above********************************************************** */




//***************************************************************************************** */

// {
//   "passportID": "VP123456",
//   "owner": "John Doe",
//   "manufacturer": "Tesla",
//   "model": "Model 3",
//   "year": "2022",
//   "telematicsData": [
//   {
//   "timestamp": "2023-05-15T10:00:00Z",
//   "speed": 75,
//   "distance": 120,
//   "location": "XYZ Street"
//   },
//   {
//   "timestamp": "2023-05-15T12:30:00Z",
//   "speed": 60,
//   "distance": 90,
//   "location": "ABC Road"
//   }
//   ],
//   "serviceRecords": [
//   {
//   "date": "2023-04-20",
//   "description": "Routine maintenance",
//   "mechanic": "AutoCare Services",
//   "cost": 150
//   },
//   {
//   "date": "2023-02-10",
//   "description": "Tire replacement",
//   "mechanic": "Superior Auto Shop",
//   "cost": 300
//   }
//   ],
//   "insurance": {
//   "provider": "ABC Insurance",
//   "policyNumber": "POL123456",
//   "effectiveDate": "2023-01-01",
//   "expiryDate": "2024-01-01",
//   "coverageAmount": 1000000
//   }
//   }


