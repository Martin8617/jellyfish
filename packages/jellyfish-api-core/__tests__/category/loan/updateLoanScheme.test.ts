import { ContainerAdapterClient } from '../../container_adapter_client'
import { LoanMasterNodeRegTestContainer } from './loan_container'
import { UTXO } from '@defichain/jellyfish-api-core/category/loan'
import BigNumber from 'bignumber.js'

describe('Loan', () => {
  const container = new LoanMasterNodeRegTestContainer()
  const client = new ContainerAdapterClient(container)

  beforeAll(async () => {
    await container.start()
    await container.waitForReady()
    await container.waitForWalletCoinbaseMaturity()

    // NOTE(jingyi2811): default scheme
    await container.call('createloanscheme', [300, 3, 'default'])
    await container.generate(1)
  })

  beforeEach(async () => {
    await container.call('createloanscheme', [100, 1, 'scheme'])
    await container.generate(1)
  })

  afterEach(async () => {
    const result = await container.call('listloanschemes')
    const data = result.filter((r: { default: boolean }) => !r.default)

    for (let i = 0; i < data.length; i += 1) {
      await container.call('destroyloanscheme', [data[i].id])
      await container.generate(1)
    }
  })

  afterAll(async () => {
    await container.stop()
  })

  it('should update loan scheme', async () => {
    const loanId = await client.loan.updateLoanScheme(200, new BigNumber(2), { identifier: 'scheme' })

    // const tx: any = await client.call('getrawtransaction', [loanId, true], 'bignumber')
    // console.log(tx.vout[0].scriptPubKey)

    expect(typeof loanId).toStrictEqual('string')
    expect(loanId.length).toStrictEqual(64)

    await container.generate(1)

    const result = await container.call('listloanschemes')
    const data = result.filter((r: { id: string }) => r.id === 'scheme')

    expect(data.length).toStrictEqual(1)
    expect(data[0]).toStrictEqual(
      {
        default: false,
        id: 'scheme',
        interestrate: 2,
        mincolratio: 200
      }
    )
  })

  it('should not update loan scheme if ratio is less than 100', async () => {
    const promise = client.loan.updateLoanScheme(99, new BigNumber(1), { identifier: 'scheme' })
    await expect(promise).rejects.toThrow('RpcApiError: \'Test LoanSchemeTx execution failed:\nminimum collateral ratio cannot be less than 100\', code: -32600, method: updateloanscheme')
  })

  it('should not update loan scheme if rate is less than 0', async () => {
    const promise = client.loan.updateLoanScheme(100, new BigNumber(-1), { identifier: 'scheme' })
    await expect(promise).rejects.toThrow('RpcApiError: \'Amount out of range\', code: -3, method: updateloanscheme')
  })

  it('should not create update scheme if new schemes have same rate and ratio with other scheme', async () => {
    const promise = client.loan.updateLoanScheme(300, new BigNumber(3), { identifier: 'scheme' })
    await expect(promise).rejects.toThrow('RpcApiError: \'Test LoanSchemeTx execution failed:\nLoan scheme default with same interestrate and mincolratio already exists\', code: -32600, method: updateloanscheme')
  })

  it('should update loan scheme after block 200 only', async () => {
    // NOTE(jingyi2811): Wait for block 100
    await container.waitForBlockHeight(100)

    const loanId = await client.loan.updateLoanScheme(200, new BigNumber(2), { identifier: 'scheme', activateAfterBlock: 200 })

    expect(typeof loanId).toStrictEqual('string')
    expect(loanId.length).toStrictEqual(64)

    await container.generate(1)

    // NOTE(jingyi2811): shouldn't update at block 101
    let result = await container.call('listloanschemes')
    let data = result.filter((r: { id: string }) => r.id === 'scheme')

    expect(data.length).toStrictEqual(1)
    expect(data[0]).toStrictEqual(
      {
        default: false,
        id: 'scheme',
        interestrate: 1,
        mincolratio: 100
      }
    )

    // NOTE(jingyi2811): Wait for block 200
    await container.waitForBlockHeight(200)

    // NOTE(jingyi2811): should update at block 200
    result = await container.call('listloanschemes')
    data = result.filter((r: { id: string }) => r.id === 'scheme')

    expect(data.length).toStrictEqual(1)
    expect(data[0]).toStrictEqual(
      {
        default: false,
        id: 'scheme',
        interestrate: 2,
        mincolratio: 200
      }
    )
  })

  it('should update loan scheme with utxos', async () => {
    const address = await container.call('getnewaddress')
    const utxos = await container.call('listunspent', [1, 9999999, [address], true])
    const inputs: UTXO[] = utxos.map((utxo: UTXO) => {
      return {
        txid: utxo.txid,
        vout: utxo.vout
      }
    })

    const loanId = await client.loan.updateLoanScheme(200, new BigNumber(2), { identifier: 'scheme', utxos: inputs })

    expect(typeof loanId).toStrictEqual('string')
    expect(loanId.length).toStrictEqual(64)

    await container.generate(1)

    const result = await container.call('listloanschemes')
    const data = result.filter((r: { id: string }) => r.id === 'scheme')

    expect(data.length).toStrictEqual(1)
    expect(data[0]).toStrictEqual(
      { id: 'scheme', mincolratio: 200, interestrate: 2, default: false }
    )
  })

  it('should not update loan scheme with arbritary utxos', async () => {
    const { txid, vout } = await container.fundAddress(await container.call('getnewaddress'), 10)
    const promise = client.loan.updateLoanScheme(200, new BigNumber(2), { identifier: 'scheme', utxos: [{ txid, vout }] })
    await expect(promise).rejects.toThrow('RpcApiError: \'Test LoanSchemeTx execution failed:\ntx not from foundation member!\', code: -32600, method: updateloanscheme')
  })
})
