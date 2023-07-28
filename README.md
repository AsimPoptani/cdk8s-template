# cdk8s-template
Creates a plugin with argocd using cdk8s. Has an apps of apps style in argocd. 

Uses [cdk8s](https://cdk8s.io/) and [argo-cd](https://argoproj.github.io/argo-cd/).

## How to use:
Start of with this.
``` typescript
const argo = new Argo({
  repoURL: '',
  basePath: '/'
})


argo.synth()
```

Then add your apps to the argo object.
``` typescript
const argo = new Argo({
  repoURL: '',
  basePath: '/'
})


const testChart = argo.addApp('test')

new KubeSecret(testChart,'test-secret',{metadata:{name:'test-secret'},stringData:{'test':'test'}})


argo.synth()
```


## How to deploy (initially):
``` bash
yarn build
kubectl apply -f dist/argo.yaml
kubectl apply -f dist/main.yaml
```

After this argocd will deploy the apps in the `main.yaml` file automatically.