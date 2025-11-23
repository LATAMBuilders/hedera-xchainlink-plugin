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
      
      // Esperar 3 segundos para que el topic se propague en la red
      console.log('⏳ Waiting for topic to propagate...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
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

  async subscribeToMessages(onMessageCallback) {
    const maxRetries = 5;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        // Usar el timestamp actual menos 30 segundos para capturar mensajes recientes
        const now = new Date();
        now.setSeconds(now.getSeconds() - 30);

        new TopicMessageQuery()
          .setTopicId(this.topicId)
          .setStartTime(now)
          .subscribe(
            this.client,
            (error) => {
              console.error(`❌ Error in subscription: ${error.message}`);
            },
            (message) => {
              try {
                const messageString = Buffer.from(message.contents).toString();
                const messageData = JSON.parse(messageString);
                onMessageCallback(messageData);
              } catch (error) {
                console.error('❌ Error parsing message:', error);
              }
            }
          );

        console.log(`👂 Successfully subscribed to topic ${this.topicId}`);
        return;
      } catch (error) {
        retries++;
        const waitTime = Math.min(1000 * Math.pow(2, retries), 5000);
        console.log(
          `⚠️  Error subscribing to topic ${this.topicId} (attempt ${retries}/${maxRetries}). ` +
          `Waiting ${waitTime}ms before retry...`
        );
        
        if (retries >= maxRetries) {
          console.error('❌ Failed to subscribe after max retries:', error);
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  getTopicId() {
    return this.topicId;
  }
}

module.exports = HederaService;
