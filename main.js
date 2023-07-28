"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ArgoApp_1 = require("./src/ArgoApp");
const k8s_1 = require("./imports/k8s");
const cdk8s_plus_26_1 = require("cdk8s-plus-26");
const cdk8s_1 = require("cdk8s");
const argo = new ArgoApp_1.Argo({
    repoURL: 'git@github.com:AsimPoptani/KubeGen.git',
    basePath: 'cdk8s/'
});
const test = argo.addApp('test');
new k8s_1.KubeNamespace(test, 'another-ns', {
    metadata: {
        name: 'another'
    }
});
const probe = cdk8s_plus_26_1.Probe.fromHttpGet('/', { port: 80, scheme: cdk8s_plus_26_1.ConnectionScheme.HTTP });
const deploy = new cdk8s_plus_26_1.Deployment(test, 'simple-deployment', {
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
                memory: { limit: cdk8s_1.Size.mebibytes(200), request: cdk8s_1.Size.mebibytes(10) }
            }
        }
    ],
    replicas: 2
});
new cdk8s_plus_26_1.Service(test, 'simple-service', {
    type: cdk8s_plus_26_1.ServiceType.NODE_PORT,
    ports: [
        {
            port: 80,
            targetPort: 80,
            name: 'http'
        }
    ],
    selector: deploy
});
argo.synth();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQ0FBb0M7QUFDcEMsdUNBQTZDO0FBQzdDLGlEQUF5RjtBQUN6RixpQ0FBNEI7QUFFNUIsTUFBTSxJQUFJLEdBQUcsSUFBSSxjQUFJLENBQUM7SUFDcEIsT0FBTyxFQUFFLHdDQUF3QztJQUNqRCxRQUFRLEVBQUUsUUFBUTtDQUNuQixDQUFDLENBQUE7QUFFRixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBRWhDLElBQUksbUJBQWEsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO0lBQ3BDLFFBQVEsRUFBRTtRQUNSLElBQUksRUFBRSxTQUFTO0tBQ2hCO0NBQ0YsQ0FBQyxDQUFBO0FBRUYsTUFBTSxLQUFLLEdBQUcscUJBQUssQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsZ0NBQWdCLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtBQUVqRixNQUFNLE1BQU0sR0FBRyxJQUFJLDBCQUFVLENBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFO0lBQ3ZELFVBQVUsRUFBRTtRQUNWO1lBQ0UsS0FBSyxFQUFFLGNBQWM7WUFDckIsVUFBVSxFQUFFLEVBQUU7WUFDZCxRQUFRLEVBQUUsS0FBSztZQUNmLFNBQVMsRUFBRSxLQUFLO1lBQ2hCLGVBQWUsRUFBRTtnQkFDZixhQUFhLEVBQUUsS0FBSztnQkFDcEIsc0JBQXNCLEVBQUUsS0FBSzthQUM5QjtZQUNELFNBQVMsRUFBRTtnQkFDVCxHQUFHLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFO2dCQUM3RCxNQUFNLEVBQUUsRUFBRSxLQUFLLEVBQUUsWUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxPQUFPLEVBQUUsWUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRTthQUVwRTtTQUVGO0tBQ0Y7SUFDRCxRQUFRLEVBQUUsQ0FBQztDQUNaLENBQUMsQ0FBQTtBQUVGLElBQUksdUJBQU8sQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUU7SUFDbEMsSUFBSSxFQUFFLDJCQUFXLENBQUMsU0FBUztJQUMzQixLQUFLLEVBQUU7UUFDTDtZQUNFLElBQUksRUFBRSxFQUFFO1lBQ1IsVUFBVSxFQUFFLEVBQUU7WUFDZCxJQUFJLEVBQUUsTUFBTTtTQUNiO0tBQ0Y7SUFDRCxRQUFRLEVBQUUsTUFBTTtDQUNqQixDQUFDLENBQUE7QUFFRixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcmdvIH0gZnJvbSAnLi9zcmMvQXJnb0FwcCdcbmltcG9ydCB7IEt1YmVOYW1lc3BhY2UgfSBmcm9tICcuL2ltcG9ydHMvazhzJ1xuaW1wb3J0IHsgQ29ubmVjdGlvblNjaGVtZSwgRGVwbG95bWVudCwgUHJvYmUsIFNlcnZpY2UsIFNlcnZpY2VUeXBlIH0gZnJvbSAnY2RrOHMtcGx1cy0yNidcbmltcG9ydCB7IFNpemUgfSBmcm9tICdjZGs4cydcblxuY29uc3QgYXJnbyA9IG5ldyBBcmdvKHtcbiAgcmVwb1VSTDogJ2dpdEBnaXRodWIuY29tOkFzaW1Qb3B0YW5pL0t1YmVHZW4uZ2l0JyxcbiAgYmFzZVBhdGg6ICdjZGs4cy8nXG59KVxuXG5jb25zdCB0ZXN0ID0gYXJnby5hZGRBcHAoJ3Rlc3QnKVxuXG5uZXcgS3ViZU5hbWVzcGFjZSh0ZXN0LCAnYW5vdGhlci1ucycsIHtcbiAgbWV0YWRhdGE6IHtcbiAgICBuYW1lOiAnYW5vdGhlcidcbiAgfVxufSlcblxuY29uc3QgcHJvYmUgPSBQcm9iZS5mcm9tSHR0cEdldCgnLycsIHsgcG9ydDogODAsIHNjaGVtZTogQ29ubmVjdGlvblNjaGVtZS5IVFRQIH0pXG5cbmNvbnN0IGRlcGxveSA9IG5ldyBEZXBsb3ltZW50KHRlc3QsICdzaW1wbGUtZGVwbG95bWVudCcsIHtcbiAgY29udGFpbmVyczogW1xuICAgIHtcbiAgICAgIGltYWdlOiAnbmdpbng6bGF0ZXN0JyxcbiAgICAgIHBvcnROdW1iZXI6IDgwLFxuICAgICAgbGl2ZW5lc3M6IHByb2JlLFxuICAgICAgcmVhZGluZXNzOiBwcm9iZSxcbiAgICAgIHNlY3VyaXR5Q29udGV4dDoge1xuICAgICAgICBlbnN1cmVOb25Sb290OiBmYWxzZSxcbiAgICAgICAgcmVhZE9ubHlSb290RmlsZXN5c3RlbTogZmFsc2VcbiAgICAgIH0sXG4gICAgICByZXNvdXJjZXM6IHtcbiAgICAgICAgY3B1OiB7IGxpbWl0OiB7IGFtb3VudDogJzEwbScgfSwgcmVxdWVzdDogeyBhbW91bnQ6ICcxMG0nIH0gfSxcbiAgICAgICAgbWVtb3J5OiB7IGxpbWl0OiBTaXplLm1lYmlieXRlcygyMDApLCByZXF1ZXN0OiBTaXplLm1lYmlieXRlcygxMCkgfVxuXG4gICAgICB9XG5cbiAgICB9XG4gIF0sXG4gIHJlcGxpY2FzOiAyXG59KVxuXG5uZXcgU2VydmljZSh0ZXN0LCAnc2ltcGxlLXNlcnZpY2UnLCB7XG4gIHR5cGU6IFNlcnZpY2VUeXBlLk5PREVfUE9SVCxcbiAgcG9ydHM6IFtcbiAgICB7XG4gICAgICBwb3J0OiA4MCxcbiAgICAgIHRhcmdldFBvcnQ6IDgwLFxuICAgICAgbmFtZTogJ2h0dHAnXG4gICAgfVxuICBdLFxuICBzZWxlY3RvcjogZGVwbG95XG59KVxuXG5hcmdvLnN5bnRoKClcbiJdfQ==