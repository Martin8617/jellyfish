import { SmartBuffer } from 'smart-buffer'
import { CVote, Vote } from '../../../../src/script/dftx/dftx_governance'
import { OP_CODES } from '../../../../src/script'
import { toBuffer, toOPCodes } from '../../../../src/script/_buffer'
import { OP_DEFI_TX } from '../../../../src/script/dftx'

it('should bi-directional buffer-object-buffer', () => {
  const fixtures = [
    '6a464466547856680aaa128c5f016b04f1a496ada226a99f5a18ead478a2ac6a665620b0987869b45fd5be75bde9dda6f11bb58e386a29834aa452413f3123f40acc6178026ce801'
  ]

  fixtures.forEach(hex => {
    const stack = toOPCodes(
      SmartBuffer.fromBuffer(Buffer.from(hex, 'hex'))
    )

    const buffer = toBuffer(stack)
    expect(buffer.toString('hex')).toBe(hex)
    expect((stack[1] as OP_DEFI_TX).tx.type).toBe(0x56)
  })
})

describe('vote', () => {
  const header = '6a464466547856' // OP_RETURN, PUSH_DATA(44665478, 56)
  const data = '680aaa128c5f016b04f1a496ada226a99f5a18ead478a2ac6a665620b0987869b45fd5be75bde9dda6f11bb58e386a29834aa452413f3123f40acc6178026ce801'
  const Vote: Vote = {
    voteDecision: 0x01,
    proposalId: '697898b02056666aaca278d4ea185a9fa926a2ad96a4f1046b015f8c12aa0a68',
    masternodeId: 'e86c027861cc0af423313f4152a44a83296a388eb51bf1a6dde9bd75bed55fb4'
  }

  it('should craft dftx with OP_CODES._()', () => {
    const stack = [
      OP_CODES.OP_RETURN,
      OP_CODES.OP_DEFI_TX_VOTE(Vote)
    ]

    const buffer = toBuffer(stack)
    expect(buffer.toString('hex')).toBe(header + data)
  })

  describe('Composable', () => {
    it('should compose from buffer to composable', () => {
      const buffer = SmartBuffer.fromBuffer(Buffer.from(data, 'hex'))
      const composable = new CVote(buffer)

      expect(composable.toObject()).toEqual(Vote)
    })

    it('should compose from composable to buffer', () => {
      const composable = new CVote(Vote)
      const buffer = new SmartBuffer()
      composable.toBuffer(buffer)

      expect(buffer.toBuffer().toString('hex')).toEqual(data)
    })
  })
})