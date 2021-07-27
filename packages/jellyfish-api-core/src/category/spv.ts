import { ApiClient } from '../.'

export const DEFAULT_FEE_RATE = 0.000012
export const DEFAULT_FEE_RATE_IN_SATOSHIS = 1200

/**
 * SPV RPCs for DeFi Blockchain
 */
export class Spv {
  private readonly client: ApiClient

  constructor (client: ApiClient) {
    this.client = client
  }

  /**
   * Creates and adds a Bitcoin address to the SPV wallet.
   *
   * @return {Promise<string>} Returns a new Bitcoin address
   */
  async getNewAddress (): Promise<string> {
    return await this.client.call('spv_getnewaddress', [], 'number')
  }

  /**
   * Returns a Bitcoin address' public key.
   *
   * @param {string} address Bitcoin address
   * @return {Promise<string>} Public key
   */
  async getAddressPubKey (address: string): Promise<string> {
    return await this.client.call('spv_getaddresspubkey', [address], 'number')
  }

  /**
   * List balances by receiving address.
   *
   * @param {string} [minConfirmation=1] The minimum number of confirmations
   * @param {string} [address] Filter by address
   * @return {Promise<ReceivedByAddressInfo[]>}
   */
  async listReceivedByAddress (minConfirmation: number = 1, address?: string): Promise<ReceivedByAddressInfo[]> {
    return await this.client.call('spv_listreceivedbyaddress', [minConfirmation, address], 'number')
  }

  /**
   * Send a Bitcoin amount to a given address.
   *
   * @param {string} address Bitcoin address
   * @param {number} amount Bitcoin amount
   * @param {SendToAddressOptions} [options]
   * @param {number} [options.feerate] Fee rate in satoshis per KB. Minimum is 1000. Defaults to 1200. See DEFAULT_FEE_RATE_IN_SATOSHIS
   * @return {Promise<SendMessageResult>}
   */
  async sendToAddress (address: string, amount: number, options = { feerate: DEFAULT_FEE_RATE_IN_SATOSHIS }): Promise<SendMessageResult> {
    return await this.client.call('spv_sendtoaddress', [address, amount, options.feerate], 'number')
  }
}

export interface ReceivedByAddressInfo {
  /** Recieving address */
  address: string
  /** Address type */
  type: string
  /** Total amount of BTC recieved by the address */
  amount: number
  /** The number of confirmations */
  confirmations: number
  /** The ids of transactions received by the address */
  txids: string[]
}

export interface SendToAddressOptions {
  feerate: number
}

export interface SendMessageResult {
  txid: string
  sendmessage: string
}
