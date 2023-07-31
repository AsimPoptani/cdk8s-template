import { Argo } from './src/ArgoApp'
import * as fs from 'fs'
import * as tmp from 'tmp'

describe('Main', () => {

  tmp.setGracefulCleanup()
  const tmpobj = tmp.fileSync()

  // Make a temporary file
  fs.writeFileSync(tmpobj.name, `-----BEGIN OPENSSH PRIVATE KEY-----
xxxx
-----END OPENSSH PRIVATE KEY-----`)

  const argoProps = {
    sshPath: tmpobj.name,
  }


  test('Create Argo App', () => {
    const argo = new Argo(argoProps)

    expect(argo.synth_yaml()).toMatchSnapshot()
  })

  test('Add and remove App', () => {
    const argo = new Argo(argoProps)
    argo.addApp('test')
    expect(argo.synth_yaml()).toMatchSnapshot()
    argo.removeApp('test')
    expect(argo.synth_yaml()).toMatchSnapshot()
  })

  test('Add App with same name', () => {
    const argo = new Argo(argoProps)
    argo.addApp('test')
    expect(() => argo.addApp('test')).toThrowError()
  })

  test('Remove App with same name', () => {
    const argo = new Argo(argoProps)
    expect(() => { argo.removeApp('test') }).toThrowError()
  })

  test('Synth', () => {
    const argo = new Argo(argoProps)
    argo['app'].synth = jest.fn() // eslint-disable-line
    argo.synth()
  })
})
