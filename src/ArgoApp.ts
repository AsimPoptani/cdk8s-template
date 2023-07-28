import { App, type AppProps, Chart, Include, JsonPatch, YamlOutputType } from 'cdk8s'
import { ArgoCdApplication } from '@opencdk8s/cdk8s-argocd-resources'
import { KubeConfigMap, KubeNamespace, KubeSecret } from '../imports/k8s'
import { ArgocdConfigManagementPlugin } from '../imports/argocd'
import * as path from 'path'
import * as fs from 'fs'

type AppType = Record<string, App>

export class Argo {
  private readonly repoURL: string
  private readonly basePath: string
  private readonly app: App
  private readonly chart: Chart
  private readonly ssh_path: string

  private apps: AppType = {}

  public static appProps: AppProps = { yamlOutputType: YamlOutputType.FILE_PER_CHART }

  constructor (props: { repoURL?: string, basePath?: string, sshPath?: string }) {
    const { repoURL = '', basePath = '/', sshPath = path.resolve(__dirname, 'SSH.pem') } = props
    this.repoURL = repoURL
    this.ssh_path = sshPath
    this.basePath = basePath
    this.app = new App(Argo.appProps)
    this.chart = new Chart(this.app, 'main')
    // Create main app
    const argocdChart = this.addApp('argocd')
    this.setup(argocdChart)
  }

  private setup (chart: Chart) {
    // Read file from SSH.pem
    const privateKey = fs.readFileSync(this.ssh_path, 'utf8')

    // Create a secret from the file
    new KubeSecret(this.chart, 'ssh-secret', {
      metadata: {
        name: 'repo-key',
        labels: {
          'argocd.argoproj.io/secret-type': 'repository'
        }
      },
      stringData: {
        type: 'git',
        url: 'git@github.com:AsimPoptani/KubeGen.git',
        sshPrivateKey: privateKey

      }
    })

    new ArgoCdApplication(this.chart, 'main-chart-app', {
      spec: {
        project: 'default',
        source: {
          repoURL: this.repoURL,
          plugin: {},
          path: `${this.basePath}`
        },
        syncPolicy: {
          automated: {
            prune: true,
            selfHeal: true
          },
          retry: {
            limit: 3,
            backoff: {
              factor: 2,
              duration: '5s',
              maxDuration: '3m'
            }
          }
        },
        destination: {
          server: 'https://kubernetes.default.svc',
          namespace: 'default'
        }
      },
      metadata: {
        name: 'main',
        namespace: 'argocd'
      }
    })

    const argocdInclude = new Include(chart, 'argocd-in', {
      url: ' https://raw.githubusercontent.com/argoproj/argo-cd/v2.7.9/manifests/install.yaml'
    })
    const namespace = new KubeNamespace(chart, 'argocd', {
      metadata: {
        name: 'argocd'
      }
    })

    const configApp = new App()
    const configChart = new Chart(configApp, 'config', { namespace: 'argocd' })

    new ArgocdConfigManagementPlugin(configChart, 'cmp-plugin', {
      metadata: {
        name: 'cmp-plugin'
      },
      spec: {
        version: 'v1.0',
        init: {
          args: ['-c', 'chown -R 999:0 ./ && yarn && yarn compile && yarn synth'],
          command: ['bash']
        },
        discover: { fileName: 'main.ts' },
        generate: {
          command: ['bash'],
          args: ['-c', 'for each in dist/$ARGOCD_APP_NAME*.yaml; do cat $each; echo "---"; done']
        }
      }
    })

    const config = new KubeConfigMap(chart, 'cmp-plugin', {
      metadata: {
        name: 'cmp-plugin'
      },
      data: {
        'plugin.yaml': configApp.synthYaml()
      }
    })

    config.addDependency(namespace)

    argocdInclude.apiObjects.forEach(c => { c.addDependency(namespace) })

    const argocdRepoServer = argocdInclude.apiObjects.find(c => c.kind === 'Deployment' && c.metadata.name === 'argocd-repo-server')

    argocdRepoServer?.addJsonPatch(JsonPatch.add('/spec/template/spec/containers/', {
      name: 'cmp-plugin',
      securityContext: {
        runAsNonRoot: true,
        runAsUser: 999
      },
      image: 'node:20-buster',
      command: ['/var/run/argocd/argocd-cmp-server'],
      volumeMounts: [
        {
          mountPath: '/var/run/argocd',
          name: 'var-files'
        },
        {
          mountPath: '/home/argocd/cmp-server/plugins',
          name: 'plugins'
        },
        {
          mountPath: '/home/argocd/cmp-server/config/plugin.yaml',
          subPath: 'plugin.yaml',
          name: 'cmp-plugin'
        },
        {
          mountPath: '/tmp',
          name: 'cmp-tmp'
        },
        {
          mountPath: '/.npm',
          name: 'npm-cache'
        },
        {
          mountPath: '/.cache/yarn',
          name: 'yarn-cache'
        },
        {
          mountPath: '/.yarn',
          name: 'yarn'
        }
      ]

    }
    ))

    argocdRepoServer?.addJsonPatch(JsonPatch.add('/spec/template/spec/volumes/',
      {
        configMap: {
          name: 'cmp-plugin'
        },
        name: 'cmp-plugin'
      }
    ))

    argocdRepoServer?.addJsonPatch(JsonPatch.add('/spec/template/spec/volumes/',
      {
        emptyDir: {},
        name: 'cmp-tmp'
      }))

    argocdRepoServer?.addJsonPatch(JsonPatch.add('/spec/template/spec/volumes/',
      {
        emptyDir: {},
        name: 'npm-cache'

      }))
    argocdRepoServer?.addJsonPatch(JsonPatch.add('/spec/template/spec/volumes/',
      {
        emptyDir: {},
        name: 'yarn-cache'

      }))
    argocdRepoServer?.addJsonPatch(JsonPatch.add('/spec/template/spec/volumes/',
      {
        emptyDir: {},
        name: 'yarn'

      }))

    argocdRepoServer?.addJsonPatch(JsonPatch.add('/spec/template/spec/initContainers/',
      {
        name: 'take-ownership',
        image: 'node:20-buster',
        command: ['bash'],
        args: ['-c', 'chown -R 999:0 /.npm /.cache/yarn '],
        volumeMounts: [
          {
            mountPath: '/.npm',
            name: 'npm-cache'
          },
          {
            mountPath: '/.cache/yarn',
            name: 'yarn-cache'

          }]

      }))
  }

  public synth (): void {
    this.app.synth()
    // Loop through apps and synth
    for (const app in this.apps) {
      this.apps[app].synth()
    }
  }

  public synth_yaml (): string {
    let yaml = ''
    yaml += this.app.synthYaml()

    // Add ---
    yaml += '---\n'
    // Loop through apps and synth
    for (const app in this.apps) {
      yaml += this.apps[app].synthYaml()
      yaml += '---\n'
    }

    return yaml
  }

  public addApp (name: string): Chart {
    // Check if app already exists
    if (this.apps[name] !== undefined) {
      throw new Error(`App with name ${name} already exists`)
    }

    // Create new app
    const app: App = new App(Argo.appProps)

    // Setup chart
    const chart = new Chart(app, `${name}`, {
      namespace: name

    })

    // Create namespace
    new KubeNamespace(chart, `${name}-ns`, {
      metadata: {
        name
      }
    })

    // Setup ArgoCD Application
    new ArgoCdApplication(this.chart, `${name}-app`, {
      spec: {
        project: 'default',
        source: {
          repoURL: this.repoURL,
          plugin: {},
          path: `${this.basePath}`
        },
        syncPolicy: {
          automated: {
            prune: true,
            selfHeal: true
          },
          retry: {
            limit: 3,
            backoff: {
              factor: 2,
              duration: '5s',
              maxDuration: '3m'
            }
          }
        },
        destination: {
          server: 'https://kubernetes.default.svc',
          namespace: 'default'
        }
      },
      metadata: {
        name: `${name}`,
        namespace: 'argocd'
      }
    })

    // Add app to set
    this.apps[name] = app

    return chart
  }

  public removeApp (name: string): void {
    // Check if app exists
    if (this.apps[name] === undefined) {
      throw new Error(`App with name ${name} does not exist`)
    }

    // Remove app from set
    delete this.apps[name]
  }
}
