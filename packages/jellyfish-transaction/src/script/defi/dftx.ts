import { SmartBuffer } from 'smart-buffer'
import { BufferComposer, ComposableBuffer } from '../../buffer/buffer_composer'
import {
  CPoolSwap,
  PoolSwap
} from './dftx_pool'
import { CDeFiOpUnmapped, DeFiOpUnmapped } from './dftx_unmapped'

// Disabling no-return-assign makes the code cleaner with the setter and getter */
/* eslint-disable no-return-assign */

/**
 * DeFi Transaction
 * [OP_RETURN, OP_PUSHDATA] Custom Transaction
 */
export interface DfTx<T> {
  signature: number // -------------------| 4 bytes, 0x44665478, DfTx
  type: number // ------------------------| 1 byte
  data: T // -----------------------------| varying bytes, 0-n

  /**
   * Not composed into buffer, for readability only.
   *
   * Name of operation in human readable string.
   * Structured as 'DEFI_OP_<...>'
   */
  name: string
}

/**
 * Composable DfTx, C stands for Composable.
 * Immutable by design, bi-directional fromBuffer, toBuffer deep composer.
 */
export class CDfTx extends ComposableBuffer<DfTx<any>> {
  static SIGNATURE = 0x44665478

  composers (dftx: DfTx<any>): BufferComposer[] {
    return [
      CDfTx.signature(dftx),
      ComposableBuffer.uInt8(() => dftx.type, v => dftx.type = v),
      {
        // This is not exactly an performant design, but it is succinct
        fromBuffer (buffer: SmartBuffer) {
          return CDfTx.data(dftx).fromBuffer(buffer)
        },
        toBuffer (buffer: SmartBuffer) {
          return CDfTx.data(dftx).toBuffer(buffer)
        }
      }
    ]
  }

  /**
   * Signature read/write with error handling if not recognized
   */
  static signature (dftx: DfTx<any>): BufferComposer {
    return {
      fromBuffer (buffer: SmartBuffer): void {
        const signature = buffer.readUInt32BE()
        if (signature !== CDfTx.SIGNATURE) {
          throw new Error(`CDfTx attempt to read a signature that is not recognized: ${signature}`)
        }
        dftx.signature = signature
      },
      toBuffer (buffer: SmartBuffer): void {
        if (dftx.signature !== CDfTx.SIGNATURE) {
          throw new Error(`CDfTx attempt to write a signature that is not recognized: ${dftx.signature}`)
        }
        buffer.writeUInt32BE(dftx.signature)
      }
    }
  }

  /**
   * Operation data read/write composing
   */
  static data (dftx: DfTx<any>): BufferComposer {
    function compose<T> (name: string, asC: (data: SmartBuffer | T) => ComposableBuffer<T>): BufferComposer {
      dftx.name = name
      return ComposableBuffer.single<T>(() => dftx.data, v => dftx.data = v, asC)
    }

    switch (dftx.type) {
      case CPoolSwap.OP_CODE:
        return compose<PoolSwap>(CPoolSwap.OP_NAME, d => new CPoolSwap(d))
      default:
        return compose<DeFiOpUnmapped>(CDeFiOpUnmapped.OP_NAME, d => new CDeFiOpUnmapped(d))
    }
  }
}