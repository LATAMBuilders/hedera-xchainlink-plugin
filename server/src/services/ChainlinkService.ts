import { ethers } from 'ethers';
import { PriceFeedData } from '../types';

// ABI de Chainlink Aggregator V3 Interface
const AGGREGATOR_V3_INTERFACE_ABI = [
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'description',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'latestRoundData',
    outputs: [
      { internalType: 'uint80', name: 'roundId', type: 'uint80' },
      { internalType: 'int256', name: 'answer', type: 'int256' },
      { internalType: 'uint256', name: 'startedAt', type: 'uint256' },
      { internalType: 'uint256', name: 'updatedAt', type: 'uint256' },
      { internalType: 'uint80', name: 'answeredInRound', type: 'uint80' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

// Direcciones de Price Feeds en Hedera Testnet
export const PRICE_FEEDS = {
  'BTC/USD': '0x058fE79CB5775d4b167920Ca6036B824805A9ABd',
  'DAI/USD': '0xb7546c6ebfc0b6b4fe68909734d7e2c1c5a3ffdf',
  'ETH/USD': '0xb9d461e0b962aF219866aDfA7DD19C52bB9871b9',
  'HBAR/USD': '0x59bC155EB6c6C415fE43255aF66EcF0523c92B4a',
  'LINK/USD': '0xEB93a53C648e3e89Bc0FC327D36A37619B1Cf0cd',
  'USDC/USD': '0x2946220288DbaeC91A26c772f5A1bb7B191c1A73',
  'USDT/USD': '0x1c5275A77d74c89256801322e9A52a991c68e79b',
} as const;

export type PriceFeedPair = keyof typeof PRICE_FEEDS;

export class ChainlinkPriceFeedService {
  private provider: ethers.JsonRpcProvider;

  constructor() {
    // Conectar al RPC de Hedera Testnet (HashIO)
    this.provider = new ethers.JsonRpcProvider('https://testnet.hashio.io/api');
  }

  /**
   * Obtiene el precio de un par específico
   */
  async getPriceFeed(pair: PriceFeedPair): Promise<PriceFeedData> {
    const address = PRICE_FEEDS[pair];
    
    try {
      // Usar dirección en minúsculas para evitar problemas de checksum en Hedera
      const normalizedAddress = address.toLowerCase();
      
      const contract = new ethers.Contract(normalizedAddress, AGGREGATOR_V3_INTERFACE_ABI, this.provider);
      
      const [roundId, answer, , updatedAt] = await contract.latestRoundData();
      const decimals = await contract.decimals();

      // Convertir el precio (answer viene como BigInt)
      const price = Number(answer) / Math.pow(10, Number(decimals));

      return {
        pair,
        address: normalizedAddress,
        price,
        formattedPrice: this.formatPrice(price),
        decimals: Number(decimals),
        roundId: roundId.toString(),
        updatedAt: new Date(Number(updatedAt) * 1000).toISOString(),
      };
    } catch (error) {
      console.error(`Error fetching price for ${pair}:`, error);
      throw new Error(`Failed to fetch ${pair} price from Chainlink`);
    }
  }

  /**
   * Obtiene todos los precios disponibles
   */
  async getAllPrices(): Promise<PriceFeedData[]> {
    const pairs = Object.keys(PRICE_FEEDS) as PriceFeedPair[];
    const pricePromises = pairs.map((pair) => this.getPriceFeed(pair));

    // Usar allSettled para que un error no detenga todo
    const results = await Promise.allSettled(pricePromises);

    return results
      .filter((result): result is PromiseFulfilledResult<PriceFeedData> => result.status === 'fulfilled')
      .map((result) => result.value);
  }

  /**
   * Formatea el precio para mostrar
   */
  private formatPrice(price: number): string {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  /**
   * Obtiene el precio como número
   */
  async getPriceAsNumber(pair: PriceFeedPair): Promise<number> {
    const data = await this.getPriceFeed(pair);
    return data.price;
  }

  /**
   * Verifica si un par está disponible
   */
  isPairAvailable(pair: string): pair is PriceFeedPair {
    return pair in PRICE_FEEDS;
  }

  /**
   * Obtiene la lista de pares disponibles
   */
  getAvailablePairs(): string[] {
    return Object.keys(PRICE_FEEDS);
  }
}

// Exportar instancia singleton
export const chainlinkService = new ChainlinkPriceFeedService();
