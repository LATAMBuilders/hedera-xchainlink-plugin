import {
  Client,
  PrivateKey,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicMessageQuery,
  TopicId,
  Status,
  TransactionReceipt,
  TransactionResponse,
} from '@hashgraph/sdk';
import { config } from 'dotenv';
import { IHederaService, ChatMessage } from '../types';

config();

export class HederaService implements IHederaService {
  public client: Client | null = null;
  public topicId: string | null = null;

  async initialize(): Promise<boolean> {
    try {
      if (!process.env.ACCOUNT_ID || !process.env.PRIVATE_KEY) {
        throw new Error('ACCOUNT_ID and PRIVATE_KEY must be set in .env file');
      }

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

  async createTopic(): Promise<string> {
    try {
      if (!this.client) {
        throw new Error('Hedera client not initialized');
      }

      const transaction: TopicCreateTransaction = new TopicCreateTransaction()
        .setTopicMemo('Hedera Chat Room');

      const txResponse: TransactionResponse = await transaction.execute(this.client);
      const receipt: TransactionReceipt = await txResponse.getReceipt(this.client);

      if (!receipt.topicId) {
        throw new Error('Failed to create topic: No topic ID in receipt');
      }

      this.topicId = receipt.topicId.toString();
      console.log(`✅ New topic created: ${this.topicId}`);
      console.log(`⚠️  Add this to your .env file: TOPIC_ID=${this.topicId}`);

      // Esperar 3 segundos para que el topic se propague en la red
      console.log('⏳ Waiting for topic to propagate...');
      await new Promise<void>((resolve) => setTimeout(resolve, 3000));

      return this.topicId;
    } catch (error) {
      console.error('❌ Error creating topic:', error);
      throw error;
    }
  }

  async sendMessage(username: string, message: string): Promise<boolean> {
    try {
      if (!this.client || !this.topicId) {
        throw new Error('Hedera service not initialized');
      }

      const messageData: ChatMessage = {
        username,
        message,
        timestamp: new Date().toISOString(),
      };

      const transaction: TopicMessageSubmitTransaction = new TopicMessageSubmitTransaction()
        .setTopicId(this.topicId)
        .setMessage(JSON.stringify(messageData));

      const txResponse: TransactionResponse = await transaction.execute(this.client);
      await txResponse.getReceipt(this.client);

      console.log(`📤 Message sent to topic ${this.topicId}`);
      return true;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  }

  async subscribeToMessages(onMessageCallback: (message: ChatMessage) => void): Promise<void> {
    const maxRetries: number = 5;
    let retries: number = 0;

    while (retries < maxRetries) {
      try {
        if (!this.client || !this.topicId) {
          throw new Error('Hedera service not initialized');
        }

        // Usar el timestamp actual menos 30 segundos para capturar mensajes recientes
        const now: Date = new Date();
        now.setSeconds(now.getSeconds() - 30);

        new TopicMessageQuery()
          .setTopicId(this.topicId)
          .setStartTime(now)
          .subscribe(
            this.client,
            null,
            (message) => {
              try {
                const messageString: string = Buffer.from(message.contents).toString();
                const messageData: ChatMessage = JSON.parse(messageString);
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
        const waitTime: number = Math.min(1000 * Math.pow(2, retries), 5000);
        console.log(
          `⚠️  Error subscribing to topic ${this.topicId} (attempt ${retries}/${maxRetries}). ` +
            `Waiting ${waitTime}ms before retry...`
        );

        if (retries >= maxRetries) {
          console.error('❌ Failed to subscribe after max retries:', error);
          throw error;
        }

        await new Promise<void>((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  getTopicId(): string | null {
    return this.topicId;
  }
}
