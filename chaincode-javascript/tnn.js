'use strict';

const { Contract } = require('fabric-contract-api');

class TNNContract extends Contract {
    async InitLedger(ctx) {
        console.log('Instantiating the smart contract');

        const newsClips = [
            {
                clipId: 'clip1',
                producer: 'producer1',
                url: 'https://example.com/clip1',
                title: 'News Clip 1',
                value: 10
            },
            {
                clipId: 'clip2',
                producer: 'producer2',
                url: 'https://example.com/clip2',
                title: 'News Clip 2',
                value: 5
            },
            {
                clipId: 'clip3',
                producer: 'producer3',
                url: 'https://example.com/clip3',
                title: 'News Clip 3',
                value: 15
            }
        ];

        for (const newsClip of newsClips) {
            await ctx.stub.putState(newsClip.clipId, Buffer.from(JSON.stringify(newsClip)));
            console.log(`Created news clip with ID ${newsClip.clipId}`);
        }
    }

    async createNewsClip(ctx, clipId, producer, url, title) {
        const newsClip = {
            clipId,
            producer,
            url,
            title,
            value: 0
        };

        await ctx.stub.putState(clipId, Buffer.from(JSON.stringify(newsClip)));
        console.log(`Created a new news clip with ID ${clipId}`);
    }

    async watchNewsClip(ctx, clipId, consumer) {
        const clipBytes = await ctx.stub.getState(clipId);

        if (!clipBytes || clipBytes.length === 0) {
            throw new Error(`News clip with ID ${clipId} does not exist`);
        }

        const newsClip = JSON.parse(clipBytes.toString());

        newsClip.value += 1;

        await ctx.stub.putState(clipId, Buffer.from(JSON.stringify(newsClip)));
        console.log(`Consumer ${consumer} watched news clip ${clipId}`);

        return newsClip;
    }

    async getNewsClip(ctx, clipId) {
        const clipBytes = await ctx.stub.getState(clipId);

        if (!clipBytes || clipBytes.length === 0) {
            throw new Error(`News clip with ID ${clipId} does not exist`);
        }

        const newsClip = JSON.parse(clipBytes.toString());
        console.log(`Retrieved news clip ${clipId}`);

        return newsClip;
    }

        // GetAllAssets returns all assets found in the world state.
        async GetAllAssets(ctx) {
            const allResults = [];
            // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
            const iterator = await ctx.stub.getStateByRange('', '');
            let result = await iterator.next();
            while (!result.done) {
                const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
                let record;
                try {
                    record = JSON.parse(strValue);
                } catch (err) {
                    console.log(err);
                    record = strValue;
                }
                allResults.push(record);
                result = await iterator.next();
            }
            return JSON.stringify(allResults);
        }
}

module.exports = TNNContract;





// /**
//  * A smart contract for managing the TNN demo application on Hyperledger Fabric
//  */

// 'use strict';

// /**
//  * Define the NewsClip asset.
//  * A NewsClip has an ID, producer, value, and an array of consumers who have watched it.
//  */
// class NewsClip {
//     constructor(id, producer,url, value) {
//         this.id = id;
//         this.producer = producer;
//         this.url=url,
//         this.value = 0;
//         this.consumers = [];
//     }
// }

// /**
//  * Define the TNN smart contract class.
//  * The TNN contract allows producers to publish new NewsClips and consumers to watch them.
//  */
// class TNNContract {

//     /**
//      * The constructor function creates a new instance of the TNN contract.
//      * @param {Context} context The smart contract context.
//      */
//     constructor(context) {
//         this.context = context;
//         this.assetType = 'NewsClip';
//     }

//     /**
//      * This function creates a new NewsClip asset and adds it to the ledger.
//      * @param {String} id The ID of the new NewsClip asset.
//      * @param {String} producer The ID of the producer of the NewsClip.
//      * @param {String} url The ID of the producer of the NewsClip.
//      * @param {Number} value The value of the NewsClip.
//      * @return {NewsClip} The new NewsClip asset that was created.
//      */
//     async createNewsClip(id, producer, url) {
//         // Check if the asset already exists
//         let assetRegistry = await this.context.getAssetRegistry(this.assetType);
//         let exists = await assetRegistry.exists(id);
//         if (exists) {
//             throw new Error(`The NewsClip asset ${id} already exists`);
//         }

//         // Create the NewsClip asset
//         let newsClip = new NewsClip(id, producer, value);

//         // Add the NewsClip asset to the ledger
//         await assetRegistry.add(newsClip);

//         // Return the new NewsClip asset
//         return newsClip;
//     }

//     /**
//      * This function allows a consumer to watch a NewsClip and earn reputation points.
//      * @param {String} id The ID of the NewsClip to watch.
//      * @param {String} consumer The ID of the consumer who is watching the NewsClip.
//      * @return {NewsClip} The updated NewsClip asset after the consumer has watched it.
//      */
//     async watchNewsClip(id, consumer) {
//         // Get the NewsClip asset
//         let assetRegistry = await this.context.getAssetRegistry(this.assetType);
//         let newsClip = await assetRegistry.get(id);

//         // Check if the NewsClip asset has already been watched by this consumer
//         if (newsClip.consumers.includes(consumer)) {
//             throw new Error(`The consumer ${consumer} has already watched the NewsClip asset ${id}`);
//         }

//         // Add the consumer to the array of consumers who have watched the NewsClip
//         newsClip.consumers.push(consumer);

//         // Update the NewsClip asset on the ledger
//         await assetRegistry.update(newsClip);

//         // Emit a WatchedEvent
//         let event = this.context.getEvent('tnn.watched');
//         event.newsClip = newsClip;
//         event.consumer = consumer;
//         event.emit();

//         // Return the updated NewsClip asset
//         return newsClip;
//     }

//     /**
//      * This function allows a producer to publish a new NewsClip and earn rewards/points.
//      * @param {String} id The ID of the new NewsClip asset.
//      * @param {String} producer The ID of the producer of the NewsClip.
//      * @param {String} url The ID of the producer of the NewsClip.
//      * @param {Number} value The value of the NewsClip.
//      * @return {News  * Clip} The new NewsClip asset that was published.
//  */
// async publishNewsClip(id, producer,url, value) {
//     // Create the NewsClip asset
//     let newsClip = await this.createNewsClip(id, producer,url, value);

//     // Emit a PublishedTransaction
//     let transaction = this.context.getTransaction();
//     let event = this.context.getEvent('tnn.published');
//     event.newsClip = newsClip;
//     event.producer = producer;
//     event.transactionId = transaction.getIdentifier();
//     event.emit();

//     // Return the new NewsClip asset
//     return newsClip;
// }
// }
// module.exports = TNNContract;

