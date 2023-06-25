const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('../../test-application/javascript/AppUtil.js');
const mspOrg1 = 'Org1MSP';

// const ccpPath = path.resolve(__dirname, '..', 'connection.json');
// const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
// const ccp = JSON.parse(ccpJSON);
const ccp = buildCCPOrg1();

const contractName = 'ehr';
// const walletPath = path.join(process.cwd(), 'wallet');
const walletPath = path.join(__dirname, 'wallet');
// const wallet = await Wallets.newFileSystemWallet(walletPath);
const wallet = await buildWallet(Wallets, walletPath);

async function connectToNetwork() {
    const gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity: 'user1',
        discovery: { enabled: true, asLocalhost: true },
    });
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract(contractName);
    return { gateway, contract };
}

async function disconnectFromNetwork(gateway) {
    gateway.disconnect();
}

module.exports = {

    createEHR: async (req, res) => {
        console.log("creating EHR");
        const { ehrId, patientName, data } = req.body;
        console.log(ehrId, patientName, data);
        try {
            const { gateway, contract } = await connectToNetwork();
            const result = await contract.submitTransaction(
                'createEHR',
                ehrId,
                patientName,
                data
            );
            console.log(result);
            disconnectFromNetwork(gateway);
            res.status(200).json({ message: 'EHR created successfully', result });
        } catch (error) {
            console.error(`Failed to create EHR: ${error}`);
            res.status(500).json({ error: 'Failed to create EHR' });
        }
    },

    updateEHR: async (req, res) => {
        const { ehrId } = req.params;
        const { data } = req.body;
        try {
            const { gateway, contract } = await connectToNetwork();
            const result = await contract.submitTransaction('updateEHR', ehrId, data);
            disconnectFromNetwork(gateway);
            res.status(200).json({ message: 'EHR updated successfully', result });
        } catch (error) {
            console.error(`Failed to update EHR: ${error}`);
            res.status(500).json({ error: 'Failed to update EHR' });
        }
    },

    grantAccess: async (req, res) => {
        const { ehrId } = req.params;
        const { grantee } = req.body;
        try {
            const { gateway, contract } = await connectToNetwork();
            const result = await contract.submitTransaction('grantAccess', ehrId, grantee);
            disconnectFromNetwork(gateway);
            res.status(200).json({ message: 'Access granted successfully', result });
        } catch (error) {
            console.error(`Failed to grant access: ${error}`);
            res.status(500).json({ error: 'Failed to grant access' });
        }
    },

    revokeAccess: async (req, res) => {
        const { ehrId, revoked } = req.params;
        try {
            const { gateway, contract } = await connectToNetwork();
            const result = await contract.submitTransaction('revokeAccess', ehrId, revoked);
            disconnectFromNetwork(gateway);
            res.status(200).json({ message: 'Access revoked successfully', result });
        } catch (error) {
            console.error(`Failed to revoke access: ${error}`);
            res.status(500).json({ error: 'Failed to revoke access' });
        }
    },

    getEHR: async (req, res) => {
            const { ehrId } = req.params;
            try {
                const { gateway, contract } = await connectToNetwork();
                const result = await contract.evaluateTransaction('getEHR', ehrId);
                disconnectFromNetwork(gateway);
                res.status(200).json({ message: 'Retrieved EHR successfully', result });
            } catch (error) {
                console.error(`Failed to retrieve EHR: ${error}`);
                res.status(500).json({ error: 'Failed to retrieve EHR' });
            }
        },
    
        getAccess: async (req, res) => {
            const { ehrId, grantee } = req.params;
            try {
                const { gateway, contract } = await connectToNetwork();
                const result = await contract.evaluateTransaction('getAccess', ehrId, grantee);
                disconnectFromNetwork(gateway);
                res.status(200).json({ message: 'Retrieved access status successfully', result });
            } catch (error) {
                console.error(`Failed to retrieve access status: ${error}`);
                res.status(500).json({ error: 'Failed to retrieve access status' });
            }
        },


    };
    