"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Argo = void 0;
const cdk8s_1 = require("cdk8s");
const cdk8s_argocd_resources_1 = require("@opencdk8s/cdk8s-argocd-resources");
const k8s_1 = require("../imports/k8s");
const argocd_1 = require("../imports/argocd");
const path = require("path");
const fs = require("fs");
class Argo {
    constructor(props) {
        this.apps = {};
        const { repoURL = '', basePath = '/', sshPath = path.resolve(__dirname, 'SSH.pem') } = props;
        this.repoURL = repoURL;
        this.ssh_path = sshPath;
        this.basePath = basePath;
        this.app = new cdk8s_1.App(Argo.appProps);
        this.chart = new cdk8s_1.Chart(this.app, 'main');
        // Create main app
        const argocdChart = this.addApp('argocd');
        this.setup(argocdChart);
    }
    setup(chart) {
        // Read file from SSH.pem
        const privateKey = fs.readFileSync(this.ssh_path, 'utf8');
        // Create a secret from the file
        new k8s_1.KubeSecret(this.chart, 'ssh-secret', {
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
        });
        new cdk8s_argocd_resources_1.ArgoCdApplication(this.chart, 'main-chart-app', {
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
        });
        const argocdInclude = new cdk8s_1.Include(chart, 'argocd-in', {
            url: ' https://raw.githubusercontent.com/argoproj/argo-cd/v2.7.9/manifests/install.yaml'
        });
        const namespace = new k8s_1.KubeNamespace(chart, 'argocd', {
            metadata: {
                name: 'argocd'
            }
        });
        const configApp = new cdk8s_1.App();
        const configChart = new cdk8s_1.Chart(configApp, 'config', { namespace: 'argocd' });
        new argocd_1.ArgocdConfigManagementPlugin(configChart, 'cmp-plugin', {
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
        });
        const config = new k8s_1.KubeConfigMap(chart, 'cmp-plugin', {
            metadata: {
                name: 'cmp-plugin'
            },
            data: {
                'plugin.yaml': configApp.synthYaml()
            }
        });
        config.addDependency(namespace);
        argocdInclude.apiObjects.forEach(c => { c.addDependency(namespace); });
        const argocdRepoServer = argocdInclude.apiObjects.find(c => c.kind === 'Deployment' && c.metadata.name === 'argocd-repo-server');
        argocdRepoServer === null || argocdRepoServer === void 0 ? void 0 : argocdRepoServer.addJsonPatch(cdk8s_1.JsonPatch.add('/spec/template/spec/containers/', {
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
        }));
        argocdRepoServer === null || argocdRepoServer === void 0 ? void 0 : argocdRepoServer.addJsonPatch(cdk8s_1.JsonPatch.add('/spec/template/spec/volumes/', {
            configMap: {
                name: 'cmp-plugin'
            },
            name: 'cmp-plugin'
        }));
        argocdRepoServer === null || argocdRepoServer === void 0 ? void 0 : argocdRepoServer.addJsonPatch(cdk8s_1.JsonPatch.add('/spec/template/spec/volumes/', {
            emptyDir: {},
            name: 'cmp-tmp'
        }));
        argocdRepoServer === null || argocdRepoServer === void 0 ? void 0 : argocdRepoServer.addJsonPatch(cdk8s_1.JsonPatch.add('/spec/template/spec/volumes/', {
            emptyDir: {},
            name: 'npm-cache'
        }));
        argocdRepoServer === null || argocdRepoServer === void 0 ? void 0 : argocdRepoServer.addJsonPatch(cdk8s_1.JsonPatch.add('/spec/template/spec/volumes/', {
            emptyDir: {},
            name: 'yarn-cache'
        }));
        argocdRepoServer === null || argocdRepoServer === void 0 ? void 0 : argocdRepoServer.addJsonPatch(cdk8s_1.JsonPatch.add('/spec/template/spec/volumes/', {
            emptyDir: {},
            name: 'yarn'
        }));
        argocdRepoServer === null || argocdRepoServer === void 0 ? void 0 : argocdRepoServer.addJsonPatch(cdk8s_1.JsonPatch.add('/spec/template/spec/initContainers/', {
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
                }
            ]
        }));
    }
    synth() {
        this.app.synth();
        // Loop through apps and synth
        for (const app in this.apps) {
            this.apps[app].synth();
        }
    }
    synth_yaml() {
        let yaml = '';
        yaml += this.app.synthYaml();
        // Add ---
        yaml += '---\n';
        // Loop through apps and synth
        for (const app in this.apps) {
            yaml += this.apps[app].synthYaml();
            yaml += '---\n';
        }
        return yaml;
    }
    addApp(name) {
        // Check if app already exists
        if (this.apps[name] !== undefined) {
            throw new Error(`App with name ${name} already exists`);
        }
        // Create new app
        const app = new cdk8s_1.App(Argo.appProps);
        // Setup chart
        const chart = new cdk8s_1.Chart(app, `${name}`, {
            namespace: name
        });
        // Create namespace
        new k8s_1.KubeNamespace(chart, `${name}-ns`, {
            metadata: {
                name
            }
        });
        // Setup ArgoCD Application
        new cdk8s_argocd_resources_1.ArgoCdApplication(this.chart, `${name}-app`, {
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
        });
        // Add app to set
        this.apps[name] = app;
        return chart;
    }
    removeApp(name) {
        // Check if app exists
        if (this.apps[name] === undefined) {
            throw new Error(`App with name ${name} does not exist`);
        }
        // Remove app from set
        delete this.apps[name];
    }
}
exports.Argo = Argo;
Argo.appProps = { yamlOutputType: cdk8s_1.YamlOutputType.FILE_PER_CHART };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXJnb0FwcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkFyZ29BcHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUNBQXFGO0FBQ3JGLDhFQUFxRTtBQUNyRSx3Q0FBeUU7QUFDekUsOENBQWdFO0FBQ2hFLDZCQUE0QjtBQUM1Qix5QkFBd0I7QUFJeEIsTUFBYSxJQUFJO0lBV2YsWUFBYSxLQUFnRTtRQUpyRSxTQUFJLEdBQVksRUFBRSxDQUFBO1FBS3hCLE1BQU0sRUFBRSxPQUFPLEdBQUcsRUFBRSxFQUFFLFFBQVEsR0FBRyxHQUFHLEVBQUUsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFBO1FBQzVGLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO1FBQ3RCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFBO1FBQ3ZCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBO1FBQ3hCLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxXQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQ2pDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxhQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQTtRQUN4QyxrQkFBa0I7UUFDbEIsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUN6QyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFBO0lBQ3pCLENBQUM7SUFFTyxLQUFLLENBQUUsS0FBWTtRQUN6Qix5QkFBeUI7UUFDekIsTUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFBO1FBRXpELGdDQUFnQztRQUNoQyxJQUFJLGdCQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxZQUFZ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LE9BQU8sS0FBSyxDQUFBO0lBQ2QsQ0FBQztJQUVNLFNBQVMsQ0FBRSxJQUFZO1FBQzVCLHNCQUFzQjtRQUN0QixJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssU0FBUyxFQUFFO1lBQ2pDLE1BQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLElBQUksaUJBQWlCLENBQUMsQ0FBQTtTQUN4RDtRQUVELHNCQUFzQjtRQUN0QixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDeEIsQ0FBQzs7QUF2VEgsb0JBd1RDO0FBL1NlLGFBQVEsR0FBYSxFQUFFLGNBQWMsRUFBRSxzQkFBYyxDQUFDLGNBQWMsRUFBRSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwLCB0eXBlIEFwcFByb3BzLCBDaGFydCwgSW5jbHVkZSwgSnNvblBhdGNoLCBZYW1sT3V0cHV0VHlwZSB9IGZyb20gJ2NkazhzJ1xuaW1wb3J0IHsgQXJnb0NkQXBwbGljYXRpb24gfSBmcm9tICdAb3BlbmNkazhzL2NkazhzLWFyZ29jZC1yZXNvdXJjZXMnXG5pbXBvcnQgeyBLdWJlQ29uZmlnTWFwLCBLdWJlTmFtZXNwYWNlLCBLdWJlU2VjcmV0IH0gZnJvbSAnLi4vaW1wb3J0cy9rOHMnXG5pbXBvcnQgeyBBcmdvY2RDb25maWdNYW5hZ2VtZW50UGx1Z2luIH0gZnJvbSAnLi4vaW1wb3J0cy9hcmdvY2QnXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcydcblxudHlwZSBBcHBUeXBlID0gUmVjb3JkPHN0cmluZywgQXBwPlxuXG5leHBvcnQgY2xhc3MgQXJnbyB7XG4gIHByaXZhdGUgcmVhZG9ubHkgcmVwb1VSTDogc3RyaW5nXG4gIHByaXZhdGUgcmVhZG9ubHkgYmFzZVBhdGg6IHN0cmluZ1xuICBwcml2YXRlIHJlYWRvbmx5IGFwcDogQXBwXG4gIHByaXZhdGUgcmVhZG9ubHkgY2hhcnQ6IENoYXJ0XG4gIHByaXZhdGUgcmVhZG9ubHkgc3NoX3BhdGg6IHN0cmluZ1xuXG4gIHByaXZhdGUgYXBwczogQXBwVHlwZSA9IHt9XG5cbiAgcHVibGljIHN0YXRpYyBhcHBQcm9wczogQXBwUHJvcHMgPSB7IHlhbWxPdXRwdXRUeXBlOiBZYW1sT3V0cHV0VHlwZS5GSUxFX1BFUl9DSEFSVCB9XG5cbiAgY29uc3RydWN0b3IgKHByb3BzOiB7IHJlcG9VUkw/OiBzdHJpbmcsIGJhc2VQYXRoPzogc3RyaW5nLCBzc2hQYXRoPzogc3RyaW5nIH0pIHtcbiAgICBjb25zdCB7IHJlcG9VUkwgPSAnJywgYmFzZVBhdGggPSAnLycsIHNzaFBhdGggPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnU1NILnBlbScpIH0gPSBwcm9wc1xuICAgIHRoaXMucmVwb1VSTCA9IHJlcG9VUkxcbiAgICB0aGlzLnNzaF9wYXRoID0gc3NoUGF0aFxuICAgIHRoaXMuYmFzZVBhdGggPSBiYXNlUGF0aFxuICAgIHRoaXMuYXBwID0gbmV3IEFwcChBcmdvLmFwcFByb3BzKVxuICAgIHRoaXMuY2hhcnQgPSBuZXcgQ2hhcnQodGhpcy5hcHAsICdtYWluJylcbiAgICAvLyBDcmVhdGUgbWFpbiBhcHBcbiAgICBjb25zdCBhcmdvY2RDaGFydCA9IHRoaXMuYWRkQXBwKCdhcmdvY2QnKVxuICAgIHRoaXMuc2V0dXAoYXJnb2NkQ2hhcnQpXG4gIH1cblxuICBwcml2YXRlIHNldHVwIChjaGFydDogQ2hhcnQpIHtcbiAgICAvLyBSZWFkIGZpbGUgZnJvbSBTU0gucGVtXG4gICAgY29uc3QgcHJpdmF0ZUtleSA9IGZzLnJlYWRGaWxlU3luYyh0aGlzLnNzaF9wYXRoLCAndXRmOCcpXG5cbiAgICAvLyBDcmVhdGUgYSBzZWNyZXQgZnJvbSB0aGUgZmlsZVxuICAgIG5ldyBLdWJlU2VjcmV0KHRoaXMuY2hhcnQsICdzc2gtc2VjcmV0Jywge1xuICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgbmFtZTogJ3JlcG8ta2V5JyxcbiAgICAgICAgbGFiZWxzOiB7XG4gICAgICAgICAgJ2FyZ29jZC5hcmdvcHJvai5pby9zZWNyZXQtdHlwZSc6ICdyZXBvc2l0b3J5J1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgc3RyaW5nRGF0YToge1xuICAgICAgICB0eXBlOiAnZ2l0JyxcbiAgICAgICAgdXJsOiAnZ2l0QGdpdGh1Yi5jb206QXNpbVBvcHRhbmkvS3ViZUdlbi5naXQnLFxuICAgICAgICBzc2hQcml2YXRlS2V5OiBwcml2YXRlS2V5XG5cbiAgICAgIH1cbiAgICB9KVxuXG4gICAgbmV3IEFyZ29DZEFwcGxpY2F0aW9uKHRoaXMuY2hhcnQsICdtYWluLWNoYXJ0LWFwcCcsIHtcbiAgICAgIHNwZWM6IHtcbiAgICAgICAgcHJvamVjdDogJ2RlZmF1bHQnLFxuICAgICAgICBzb3VyY2U6IHtcbiAgICAgICAgICByZXBvVVJMOiB0aGlzLnJlcG9VUkwsXG4gICAgICAgICAgcGx1Z2luOiB7fSxcbiAgICAgICAgICBwYXRoOiBgJHt0aGlzLmJhc2VQYXRofWBcbiAgICAgICAgfSxcbiAgICAgICAgc3luY1BvbGljeToge1xuICAgICAgICAgIGF1dG9tYXRlZDoge1xuICAgICAgICAgICAgcHJ1bmU6IHRydWUsXG4gICAgICAgICAgICBzZWxmSGVhbDogdHJ1ZVxuICAgICAgICAgIH0sXG4gICAgICAgICAgcmV0cnk6IHtcbiAgICAgICAgICAgIGxpbWl0OiAzLFxuICAgICAgICAgICAgYmFja29mZjoge1xuICAgICAgICAgICAgICBmYWN0b3I6IDIsXG4gICAgICAgICAgICAgIGR1cmF0aW9uOiAnNXMnLFxuICAgICAgICAgICAgICBtYXhEdXJhdGlvbjogJzNtJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZGVzdGluYXRpb246IHtcbiAgICAgICAgICBzZXJ2ZXI6ICdodHRwczovL2t1YmVybmV0ZXMuZGVmYXVsdC5zdmMnLFxuICAgICAgICAgIG5hbWVzcGFjZTogJ2RlZmF1bHQnXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBtZXRhZGF0YToge1xuICAgICAgICBuYW1lOiAnbWFpbicsXG4gICAgICAgIG5hbWVzcGFjZTogJ2FyZ29jZCdcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgY29uc3QgYXJnb2NkSW5jbHVkZSA9IG5ldyBJbmNsdWRlKGNoYXJ0LCAnYXJnb2NkLWluJywge1xuICAgICAgdXJsOiAnIGh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9hcmdvcHJvai9hcmdvLWNkL3YyLjcuOS9tYW5pZmVzdHMvaW5zdGFsbC55YW1sJ1xuICAgIH0pXG4gICAgY29uc3QgbmFtZXNwYWNlID0gbmV3IEt1YmVOYW1lc3BhY2UoY2hhcnQsICdhcmdvY2QnLCB7XG4gICAgICBtZXRhZGF0YToge1xuICAgICAgICBuYW1lOiAnYXJnb2NkJ1xuICAgICAgfVxuICAgIH0pXG5cbiAgICBjb25zdCBjb25maWdBcHAgPSBuZXcgQXBwKClcbiAgICBjb25zdCBjb25maWdDaGFydCA9IG5ldyBDaGFydChjb25maWdBcHAsICdjb25maWcnLCB7IG5hbWVzcGFjZTogJ2FyZ29jZCcgfSlcblxuICAgIG5ldyBBcmdvY2RDb25maWdNYW5hZ2VtZW50UGx1Z2luKGNvbmZpZ0NoYXJ0LCAnY21wLXBsdWdpbicsIHtcbiAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgIG5hbWU6ICdjbXAtcGx1Z2luJ1xuICAgICAgfSxcbiAgICAgIHNwZWM6IHtcbiAgICAgICAgdmVyc2lvbjogJ3YxLjAnLFxuICAgICAgICBpbml0OiB7XG4gICAgICAgICAgYXJnczogWyctYycsICdjaG93biAtUiA5OTk6MCAuLyAmJiB5YXJuICYmIHlhcm4gY29tcGlsZSAmJiB5YXJuIHN5bnRoJ10sXG4gICAgICAgICAgY29tbWFuZDogWydiYXNoJ11cbiAgICAgICAgfSxcbiAgICAgICAgZGlzY292ZXI6IHsgZmlsZU5hbWU6ICdtYWluLnRzJyB9LFxuICAgICAgICBnZW5lcmF0ZToge1xuICAgICAgICAgIGNvbW1hbmQ6IFsnYmFzaCddLFxuICAgICAgICAgIGFyZ3M6IFsnLWMnLCAnZm9yIGVhY2ggaW4gZGlzdC8kQVJHT0NEX0FQUF9OQU1FKi55YW1sOyBkbyBjYXQgJGVhY2g7IGVjaG8gXCItLS1cIjsgZG9uZSddXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuXG4gICAgY29uc3QgY29uZmlnID0gbmV3IEt1YmVDb25maWdNYXAoY2hhcnQsICdjbXAtcGx1Z2luJywge1xuICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgbmFtZTogJ2NtcC1wbHVnaW4nXG4gICAgICB9LFxuICAgICAgZGF0YToge1xuICAgICAgICAncGx1Z2luLnlhbWwnOiBjb25maWdBcHAuc3ludGhZYW1sKClcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgY29uZmlnLmFkZERlcGVuZGVuY3kobmFtZXNwYWNlKVxuXG4gICAgYXJnb2NkSW5jbHVkZS5hcGlPYmplY3RzLmZvckVhY2goYyA9PiB7IGMuYWRkRGVwZW5kZW5jeShuYW1lc3BhY2UpIH0pXG5cbiAgICBjb25zdCBhcmdvY2RSZXBvU2VydmVyID0gYXJnb2NkSW5jbHVkZS5hcGlPYmplY3RzLmZpbmQoYyA9PiBjLmtpbmQgPT09ICdEZXBsb3ltZW50JyAmJiBjLm1ldGFkYXRhLm5hbWUgPT09ICdhcmdvY2QtcmVwby1zZXJ2ZXInKVxuXG4gICAgYXJnb2NkUmVwb1NlcnZlcj8uYWRkSnNvblBhdGNoKEpzb25QYXRjaC5hZGQoJy9zcGVjL3RlbXBsYXRlL3NwZWMvY29udGFpbmVycy8nLCB7XG4gICAgICBuYW1lOiAnY21wLXBsdWdpbicsXG4gICAgICBzZWN1cml0eUNvbnRleHQ6IHtcbiAgICAgICAgcnVuQXNOb25Sb290OiB0cnVlLFxuICAgICAgICBydW5Bc1VzZXI6IDk5OVxuICAgICAgfSxcbiAgICAgIGltYWdlOiAnbm9kZToyMC1idXN0ZXInLFxuICAgICAgY29tbWFuZDogWycvdmFyL3J1bi9hcmdvY2QvYXJnb2NkLWNtcC1zZXJ2ZXInXSxcbiAgICAgIHZvbHVtZU1vdW50czogW1xuICAgICAgICB7XG4gICAgICAgICAgbW91bnRQYXRoOiAnL3Zhci9ydW4vYXJnb2NkJyxcbiAgICAgICAgICBuYW1lOiAndmFyLWZpbGVzJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbW91bnRQYXRoOiAnL2hvbWUvYXJnb2NkL2NtcC1zZXJ2ZXIvcGx1Z2lucycsXG4gICAgICAgICAgbmFtZTogJ3BsdWdpbnMnXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBtb3VudFBhdGg6ICcvaG9tZS9hcmdvY2QvY21wLXNlcnZlci9jb25maWcvcGx1Z2luLnlhbWwnLFxuICAgICAgICAgIHN1YlBhdGg6ICdwbHVnaW4ueWFtbCcsXG4gICAgICAgICAgbmFtZTogJ2NtcC1wbHVnaW4nXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBtb3VudFBhdGg6ICcvdG1wJyxcbiAgICAgICAgICBuYW1lOiAnY21wLXRtcCdcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIG1vdW50UGF0aDogJy8ubnBtJyxcbiAgICAgICAgICBuYW1lOiAnbnBtLWNhY2hlJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbW91bnRQYXRoOiAnLy5jYWNoZS95YXJuJyxcbiAgICAgICAgICBuYW1lOiAneWFybi1jYWNoZSdcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIG1vdW50UGF0aDogJy8ueWFybicsXG4gICAgICAgICAgbmFtZTogJ3lhcm4nXG4gICAgICAgIH1cbiAgICAgIF1cblxuICAgIH1cbiAgICApKVxuXG4gICAgYXJnb2NkUmVwb1NlcnZlcj8uYWRkSnNvblBhdGNoKEpzb25QYXRjaC5hZGQoJy9zcGVjL3RlbXBsYXRlL3NwZWMvdm9sdW1lcy8nLFxuICAgICAge1xuICAgICAgICBjb25maWdNYXA6IHtcbiAgICAgICAgICBuYW1lOiAnY21wLXBsdWdpbidcbiAgICAgICAgfSxcbiAgICAgICAgbmFtZTogJ2NtcC1wbHVnaW4nXG4gICAgICB9XG4gICAgKSlcblxuICAgIGFyZ29jZFJlcG9TZXJ2ZXI/LmFkZEpzb25QYXRjaChKc29uUGF0Y2guYWRkKCcvc3BlYy90ZW1wbGF0ZS9zcGVjL3ZvbHVtZXMvJyxcbiAgICAgIHtcbiAgICAgICAgZW1wdHlEaXI6IHt9LFxuICAgICAgICBuYW1lOiAnY21wLXRtcCdcbiAgICAgIH0pKVxuXG4gICAgYXJnb2NkUmVwb1NlcnZlcj8uYWRkSnNvblBhdGNoKEpzb25QYXRjaC5hZGQoJy9zcGVjL3RlbXBsYXRlL3NwZWMvdm9sdW1lcy8nLFxuICAgICAge1xuICAgICAgICBlbXB0eURpcjoge30sXG4gICAgICAgIG5hbWU6ICducG0tY2FjaGUnXG5cbiAgICAgIH0pKVxuICAgIGFyZ29jZFJlcG9TZXJ2ZXI/LmFkZEpzb25QYXRjaChKc29uUGF0Y2guYWRkKCcvc3BlYy90ZW1wbGF0ZS9zcGVjL3ZvbHVtZXMvJyxcbiAgICAgIHtcbiAgICAgICAgZW1wdHlEaXI6IHt9LFxuICAgICAgICBuYW1lOiAneWFybi1jYWNoZSdcblxuICAgICAgfSkpXG4gICAgYXJnb2NkUmVwb1NlcnZlcj8uYWRkSnNvblBhdGNoKEpzb25QYXRjaC5hZGQoJy9zcGVjL3RlbXBsYXRlL3NwZWMvdm9sdW1lcy8nLFxuICAgICAge1xuICAgICAgICBlbXB0eURpcjoge30sXG4gICAgICAgIG5hbWU6ICd5YXJuJ1xuXG4gICAgICB9KSlcblxuICAgIGFyZ29jZFJlcG9TZXJ2ZXI/LmFkZEpzb25QYXRjaChKc29uUGF0Y2guYWRkKCcvc3BlYy90ZW1wbGF0ZS9zcGVjL2luaXRDb250YWluZXJzLycsXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICd0YWtlLW93bmVyc2hpcCcsXG4gICAgICAgIGltYWdlOiAnbm9kZToyMC1idXN0ZXInLFxuICAgICAgICBjb21tYW5kOiBbJ2Jhc2gnXSxcbiAgICAgICAgYXJnczogWyctYycsICdjaG93biAtUiA5OTk6MCAvLm5wbSAvLmNhY2hlL3lhcm4gJ10sXG4gICAgICAgIHZvbHVtZU1vdW50czogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIG1vdW50UGF0aDogJy8ubnBtJyxcbiAgICAgICAgICAgIG5hbWU6ICducG0tY2FjaGUnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBtb3VudFBhdGg6ICcvLmNhY2hlL3lhcm4nLFxuICAgICAgICAgICAgbmFtZTogJ3lhcm4tY2FjaGUnXG5cbiAgICAgICAgICB9XVxuXG4gICAgICB9KSlcbiAgfVxuXG4gIHB1YmxpYyBzeW50aCAoKTogdm9pZCB7XG4gICAgdGhpcy5hcHAuc3ludGgoKVxuICAgIC8vIExvb3AgdGhyb3VnaCBhcHBzIGFuZCBzeW50aFxuICAgIGZvciAoY29uc3QgYXBwIGluIHRoaXMuYXBwcykge1xuICAgICAgdGhpcy5hcHBzW2FwcF0uc3ludGgoKVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzeW50aF95YW1sICgpOiBzdHJpbmcge1xuICAgIGxldCB5YW1sID0gJydcbiAgICB5YW1sICs9IHRoaXMuYXBwLnN5bnRoWWFtbCgpXG5cbiAgICAvLyBBZGQgLS0tXG4gICAgeWFtbCArPSAnLS0tXFxuJ1xuICAgIC8vIExvb3AgdGhyb3VnaCBhcHBzIGFuZCBzeW50aFxuICAgIGZvciAoY29uc3QgYXBwIGluIHRoaXMuYXBwcykge1xuICAgICAgeWFtbCArPSB0aGlzLmFwcHNbYXBwXS5zeW50aFlhbWwoKVxuICAgICAgeWFtbCArPSAnLS0tXFxuJ1xuICAgIH1cblxuICAgIHJldHVybiB5YW1sXG4gIH1cblxuICBwdWJsaWMgYWRkQXBwIChuYW1lOiBzdHJpbmcpOiBDaGFydCB7XG4gICAgLy8gQ2hlY2sgaWYgYXBwIGFscmVhZHkgZXhpc3RzXG4gICAgaWYgKHRoaXMuYXBwc1tuYW1lXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEFwcCB3aXRoIG5hbWUgJHtuYW1lfSBhbHJlYWR5IGV4aXN0c2ApXG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIG5ldyBhcHBcbiAgICBjb25zdCBhcHA6IEFwcCA9IG5ldyBBcHAoQXJnby5hcHBQcm9wcylcblxuICAgIC8vIFNldHVwIGNoYXJ0XG4gICAgY29uc3QgY2hhcnQgPSBuZXcgQ2hhcnQoYXBwLCBgJHtuYW1lfWAsIHtcbiAgICAgIG5hbWVzcGFjZTogbmFtZVxuXG4gICAgfSlcblxuICAgIC8vIENyZWF0ZSBuYW1lc3BhY2VcbiAgICBuZXcgS3ViZU5hbWVzcGFjZShjaGFydCwgYCR7bmFtZX0tbnNgLCB7XG4gICAgICBtZXRhZGF0YToge1xuICAgICAgICBuYW1lXG4gICAgICB9XG4gICAgfSlcblxuICAgIC8vIFNldHVwIEFyZ29DRCBBcHBsaWNhdGlvblxuICAgIG5ldyBBcmdvQ2RBcHBsaWNhdGlvbih0aGlzLmNoYXJ0LCBgJHtuYW1lfS1hcHBgLCB7XG4gICAgICBzcGVjOiB7XG4gICAgICAgIHByb2plY3Q6ICdkZWZhdWx0JyxcbiAgICAgICAgc291cmNlOiB7XG4gICAgICAgICAgcmVwb1VSTDogdGhpcy5yZXBvVVJMLFxuICAgICAgICAgIHBsdWdpbjoge30sXG4gICAgICAgICAgcGF0aDogYCR7dGhpcy5iYXNlUGF0aH1gXG4gICAgICAgIH0sXG4gICAgICAgIHN5bmNQb2xpY3k6IHtcbiAgICAgICAgICBhdXRvbWF0ZWQ6IHtcbiAgICAgICAgICAgIHBydW5lOiB0cnVlLFxuICAgICAgICAgICAgc2VsZkhlYWw6IHRydWVcbiAgICAgICAgICB9LFxuICAgICAgICAgIHJldHJ5OiB7XG4gICAgICAgICAgICBsaW1pdDogMyxcbiAgICAgICAgICAgIGJhY2tvZmY6IHtcbiAgICAgICAgICAgICAgZmFjdG9yOiAyLFxuICAgICAgICAgICAgICBkdXJhdGlvbjogJzVzJyxcbiAgICAgICAgICAgICAgbWF4RHVyYXRpb246ICczbSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGRlc3RpbmF0aW9uOiB7XG4gICAgICAgICAgc2VydmVyOiAnaHR0cHM6Ly9rdWJlcm5ldGVzLmRlZmF1bHQuc3ZjJyxcbiAgICAgICAgICBuYW1lc3BhY2U6ICdkZWZhdWx0J1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgbmFtZTogYCR7bmFtZX1gLFxuICAgICAgICBuYW1lc3BhY2U6ICdhcmdvY2QnXG4gICAgICB9XG4gICAgfSlcblxuICAgIC8vIEFkZCBhcHAgdG8gc2V0XG4gICAgdGhpcy5hcHBzW25hbWVdID0gYXBwXG5cbiAgICByZXR1cm4gY2hhcnRcbiAgfVxuXG4gIHB1YmxpYyByZW1vdmVBcHAgKG5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIC8vIENoZWNrIGlmIGFwcCBleGlzdHNcbiAgICBpZiAodGhpcy5hcHBzW25hbWVdID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQXBwIHdpdGggbmFtZSAke25hbWV9IGRvZXMgbm90IGV4aXN0YClcbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgYXBwIGZyb20gc2V0XG4gICAgZGVsZXRlIHRoaXMuYXBwc1tuYW1lXVxuICB9XG59XG4iXX0=