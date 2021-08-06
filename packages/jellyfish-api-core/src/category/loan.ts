import { ApiClient, BigNumber } from '../.'

/**
 * loan RPCs for DeFi Blockchain
 */
export class Loan {
  private readonly client: ApiClient

  constructor (client: ApiClient) {
    this.client = client
  }

  async createLoanScheme (mincolratio: number, interestrate: BigNumber, options: CreateLoanOptions): Promise<string> {
    const { utxos = [] } = options
    return await this.client.call('createloanscheme', [mincolratio, interestrate, options.id, utxos], 'bignumber')
  }
}

export interface CreateLoanOptions {
  id: string
  utxos?: UTXO[]
}

export interface UTXO {
  txid: string
  vout: number
}
