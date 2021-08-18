import { ApiClient } from '../.'

/**
 * Loan RPCs for DeFi Blockchain
 */
export class Loan {
  private readonly client: ApiClient

  constructor (client: ApiClient) {
    this.client = client
  }

  /**
   * Destroys a loan scheme.
   *
   * @param {string} id Unique identifier of the loan scheme
   * @param {number} [activateAfterBlock] Block height at which new changes take effect
   * @param {DeleteLoanOptions} [options]
   * @param {UTXO[]} [options.utxos = []] Specific UTXOs to spend
   * @param {string} [options.utxos.txid] Transaction Id
   * @param {number} [options.utxos.vout] Output number
   * @return {Promise<string>} Hex string of the transaction
   */
  async destroyLoanScheme (id: string, activateAfterBlock?: number, options: DeleteLoanOptions = {}): Promise<string> {
    const { utxos = [] } = options
    return await this.client.call('destroyloanscheme', [id, activateAfterBlock, utxos], 'number')
  }
}

export interface DeleteLoanOptions {
  utxos?: UTXO[]
}

export interface UTXO {
  txid: string
  vout: number
}
