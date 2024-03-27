const { PubSub } = require('@google-cloud/pubsub');
const logger=require("./logger");

// Initialize Pub/Sub
const pubsub = new PubSub({projectId:'devv-414701'});
const topicName = 'email_verify'; // Pub/Sub topic name

// Function to publish message to Pub/Sub
async function publishMessageToPubSub(userPayload) {
    try {
        const dataBuffer = Buffer.from(JSON.stringify(userPayload));
        await pubsub.topic(topicName).publish(dataBuffer);
        logger.info("Message published to Pub/Sub: ", userPayload);
    } catch (error) {
        logger.error("Error publishing message to Pub/Sub: ", error);
    }
}

module.exports = { publishMessageToPubSub };