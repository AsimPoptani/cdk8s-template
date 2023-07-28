import { Argo } from './src/ArgoApp'

const argo = new Argo({
  repoURL: '',
  basePath: '/'
})


argo.synth()
