import { Argo } from './src/ArgoApp'
import { KubeNamespace } from './imports/k8s'
import { ConnectionScheme, Deployment, Probe, Service, ServiceType } from 'cdk8s-plus-26'
import { Size } from 'cdk8s'

const argo = new Argo({
  repoURL: 'git@github.com:AsimPoptani/KubeGen.git',
  basePath: 'cdk8s/'
})

const test = argo.addApp('test')

new KubeNamespace(test, 'another-ns', {
  metadata: {
    name: 'another'
  }
})

const probe = Probe.fromHttpGet('/', { port: 80, scheme: ConnectionScheme.HTTP })

const deploy = new Deployment(test, 'simple-deployment', {
  containers: [
    {
      image: 'nginx:latest',
      portNumber: 80,
      liveness: probe,
      readiness: probe,
      securityContext: {
        ensureNonRoot: false,
        readOnlyRootFilesystem: false
      },
      resources: {
        cpu: { limit: { amount: '10m' }, request: { amount: '10m' } },
        memory: { limit: Size.mebibytes(200), request: Size.mebibytes(10) }

      }

    }
  ],
  replicas: 2
})

new Service(test, 'simple-service', {
  type: ServiceType.NODE_PORT,
  ports: [
    {
      port: 80,
      targetPort: 80,
      name: 'http'
    }
  ],
  selector: deploy
})

argo.synth()
