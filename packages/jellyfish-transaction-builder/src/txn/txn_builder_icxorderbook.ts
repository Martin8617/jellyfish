import { OP_CODES, Script, TransactionSegWit, ICXSubmitDFCHTLC, ICXSubmitEXTHTLC } from '@defichain/jellyfish-transaction'
import { P2WPKHTxnBuilder } from './txn_builder'

export class TxnBuilderICXOrderBook extends P2WPKHTxnBuilder {
  /**
   * Creates submitDFCHTLC transaction.
   *
   * @param {ICXSubmitDFCHTLC} icxSubmitDFCHTLC txn to create
   * @param {Script} changeScript to send unspent to after deducting the (transfer value + fees)
   * @returns {Promise<TransactionSegWit>}
   */
  async submitDFCHTLC (icxSubmitDFCHTLC: ICXSubmitDFCHTLC, changeScript: Script): Promise<TransactionSegWit> {
    return await this.createDeFiTx(
      OP_CODES.OP_DEFI_TX_ICX_SUBMIT_DFC_HTLC(icxSubmitDFCHTLC),
      changeScript
    )
  }

  /**
   * Creates submitEXTHTLC transaction.
   *
   * @param {ICXSubmitEXTHTLC} icxSubmitEXTHTLC txn to create
   * @param {Script} changeScript to send unspent to after deducting the (transfer value + fees)
   * @returns {Promise<TransactionSegWit>}
   */
  async submitEXTHTLC (icxSubmitEXTHTLC: ICXSubmitEXTHTLC, changeScript: Script): Promise<TransactionSegWit> {
    return await this.createDeFiTx(
      OP_CODES.OP_DEFI_TX_ICX_SUBMIT_EXT_HTLC(icxSubmitEXTHTLC),
      changeScript
    )
  }
}
