import { Argo } from './src/ArgoApp'

describe('Main', () => {
  test('Create Argo App', () => {
    const argo = new Argo({})

    expect(argo.synth_yaml()).toMatchSnapshot()
  })

  test('Add and remove App', () => {
    const argo = new Argo({})
    argo.addApp('test')
    expect(argo.synth_yaml()).toMatchSnapshot()
    argo.removeApp('test')
    expect(argo.synth_yaml()).toMatchSnapshot()
  })

  test('Add App with same name', () => {
    const argo = new Argo({})
    argo.addApp('test')
    expect(() => argo.addApp('test')).toThrowError()
  })

  test('Remove App with same name', () => {
    const argo = new Argo({})
    expect(() => { argo.removeApp('test') }).toThrowError()
  })

  test('Synth', () => {
    const argo = new Argo({})
    argo['app'].synth = jest.fn()
    argo.synth()
  })
})
