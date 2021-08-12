import { BufferComposer, ComposableBuffer } from '../../buffer/buffer_composer'
import BigNumber from 'bignumber.js'
import { SmartBuffer } from 'smart-buffer'

// Disabling no-return-assign makes the code cleaner with the setter and getter */
/* eslint-disable no-return-assign */

/**
 * ICXSubmitDFCHTLC DeFi transaction
 */
export interface ICXSubmitDFCHTLC {
  offerTx: string // ----| 32 byte, txid for which offer is this HTLC
  amount: BigNumber // --| 8 byte, amount that is put in HTLC
  hash: string // -------| 32 byte, hash for the hash lock part
  timeout: number // ----| 4 byte, timeout (absolute in blocks) for timelock part
}

/**
 * Composable ICXSubmitDFCHTLC, C stands for Composable.
 * Immutable by design, bi-directional fromBuffer, toBuffer deep composer.
 */
export class CICXSubmitDFCHTLC extends ComposableBuffer<ICXSubmitDFCHTLC> {
  static OP_CODE = 0x33
  static OP_NAME = 'OP_DEFI_TX_ICX_SUBMIT_DFC_HTLC'

  composers (msg: ICXSubmitDFCHTLC): BufferComposer[] {
    return [
      ComposableBuffer.hexBEBufferLE(32, () => msg.offerTx, v => msg.offerTx = v),
      ComposableBuffer.satoshiAsBigNumber(() => msg.amount, v => msg.amount = v),
      ComposableBuffer.hexBEBufferLE(32, () => msg.hash, v => msg.hash = v),
      ComposableBuffer.uInt32(() => msg.timeout, v => msg.timeout = v)
    ]
  }
}

/**
 * ICXSubmitEXTHTLC DeFi transaction
 */
export interface ICXSubmitEXTHTLC {
  offerTx: string // -----------| 32 byte, txid for which offer is this HTLC
  amount: BigNumber // ---------| 8 byte, amount that is put in HTLC
  hash: string // --------------| 32 byte, hash for the hash lock part
  htlcScriptAddress: string // -| 1 byte for len + len bytes, script address of external htlc
  ownerPubkey: string // -------| 1 byte for len + len bytes, pubkey of the owner to which the funds are refunded if HTLC timeouts
  timeout: number // -----------| 4 byte, timeout (absolute in block) for expiration of external htlc in external chain blocks
}

/**
 * Composable ICXSubmitEXTHTLC, C stands for Composable.
 * Immutable by design, bi-directional fromBuffer, toBuffer deep composer.
 */
export class CICXSubmitEXTHTLC extends ComposableBuffer<ICXSubmitEXTHTLC> {
  static OP_CODE = 0x34
  static OP_NAME = 'OP_DEFI_TX_ICX_SUBMIT_EXT_HTLC'

  composers (msg: ICXSubmitEXTHTLC): BufferComposer[] {
    return [
      ComposableBuffer.hexBEBufferLE(32, () => msg.offerTx, v => msg.offerTx = v),
      ComposableBuffer.satoshiAsBigNumber(() => msg.amount, v => msg.amount = v),
      ComposableBuffer.hexBEBufferLE(32, () => msg.hash, v => msg.hash = v),
      ComposableBuffer.varUIntUtf8BE(() => msg.htlcScriptAddress, v => msg.htlcScriptAddress = v),
      { // NOTE(surangap): may be use optionalVarUIntHex when available or move this piece of code to buffer_composer.ts
        fromBuffer: (buffer: SmartBuffer): void => {
          const length = buffer.readUInt8()
          const buff = Buffer.from(buffer.readBuffer(length))
          msg.ownerPubkey = buff.toString('hex')
        },
        toBuffer: (buffer: SmartBuffer): void => {
          const hex = msg.ownerPubkey
          const buff: Buffer = Buffer.from(hex, 'hex')
          buffer.writeUInt8(buff.length)
          buffer.writeBuffer(buff)
        }
      },
      ComposableBuffer.uInt32(() => msg.timeout, v => msg.timeout = v)
    ]
  }
}

/**
 * ICXClaimDFCHTLC DeFi transaction
 */
export interface ICXClaimDFCHTLC {
  dfcHTLCTx: string // ----| 32 byte, txid of dfc htlc tx for which the claim is
  seed: string // ---------| 1 byte for len + len bytes, secret seed for claiming htlc
}

/**
 * Composable ICXClaimDFCHTLC, C stands for Composable.
 * Immutable by design, bi-directional fromBuffer, toBuffer deep composer.
 */
export class CICXClaimDFCHTLC extends ComposableBuffer<ICXClaimDFCHTLC> {
  static OP_CODE = 0x35
  static OP_NAME = 'OP_DEFI_TX_ICX_CLAIM_DFC_HTLC'

  composers (msg: ICXClaimDFCHTLC): BufferComposer[] {
    return [
      ComposableBuffer.hexBEBufferLE(32, () => msg.dfcHTLCTx, v => msg.dfcHTLCTx = v),
      { // NOTE(surangap): may be use optionalVarUIntHex when available or move this piece of code to buffer_composer.ts
        fromBuffer: (buffer: SmartBuffer): void => {
          const length = buffer.readUInt8()
          const buff = Buffer.from(buffer.readBuffer(length))
          msg.seed = buff.toString('hex')
        },
        toBuffer: (buffer: SmartBuffer): void => {
          const hex = msg.seed
          const buff: Buffer = Buffer.from(hex, 'hex')
          buffer.writeUInt8(buff.length)
          buffer.writeBuffer(buff)
        }
      }
    ]
  }
}
