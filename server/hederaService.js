const {
  Client,
  PrivateKey,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicMessageQuery,
} = require('@hashgraph/sdk');
require('dotenv').config();

class HederaService {
  constructor() {
    this.client = null;
    this.topicId = null;
  }

  async initialize() {
    try {
      // Configurar cliente de Hedera (Testnet)
      this.client = Client.forTestnet();
      this.client.setOperator(
        process.env.ACCOUNT_ID,
        PrivateKey.fromStringECDSA(process.env.PRIVATE_KEY)
      );

      console.log('✅ Hedera client initialized');
      
      // Si hay un TOPIC_ID en .env, usarlo, sino crear uno nuevo
      if (process.env.TOPIC_ID) {
        this.topicId = process.env.TOPIC_ID;
        console.log(`📌 Using existing topic: ${this.topicId}`);
      } else {
        await this.createTopic();
      }

      return true;
    } catch (error) {
      console.error('❌ Error initializing Hedera:', error);
      throw error;
    }
  }

  async createTopic() {
    try {
      const transaction = new TopicCreateTransaction()
        .setTopicMemo('Hedera Chat Room');

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);
      
      this.topicId = receipt.topicId.toString();
      console.log(`✅ New topic created: ${this.topicId}`);
      console.log(`⚠️  Add this to your .env file: TOPIC_ID=${this.topicId}`);
      
      return this.topicId;
    } catch (error) {
      console.error('❌ Error creating topic:', error);
      throw error;
    }
  }

  async sendMessage(username, message) {
    try {
      const messageData = JSON.stringify({
        username,
        message,
        timestamp: new Date().toISOString(),
      });

      const transaction = new TopicMessageSubmitTransaction()
        .setTopicId(this.topicId)
        .setMessage(messageData);

      const txResponse = await transaction.execute(this.client);
      await txResponse.getReceipt(this.client);

      console.log(`📤 Message sent to topic ${this.topicId}`);
      return true;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  }

  subscribeToMessages(onMessageCallback) {
    try {
      new TopicMessageQuery()
        .setTopicId(this.topicId)
        .setStartTime(0)
        .subscribe(this.client, null, (message) => {
          try {
            const messageString = Buffer.from(message.contents).toString();
            const messageData = JSON.parse(messageString);
            onMessageCallback(messageData);
          } catch (error) {
            console.error('❌ Error parsing message:', error);
          }
        });

      console.log(`👂 Subscribed to topic ${this.topicId}`);
    } catch (error) {
      console.error('❌ Error subscribing to messages:', error);
      throw error;
    }
  }

  getTopicId() {
    return this.topicId;
  }
}

module.exports = HederaService;
