import { type AppProps, Chart } from 'cdk8s';
export declare class Argo {
    private readonly repoURL;
    private readonly basePath;
    private readonly app;
    private readonly chart;
    private readonly ssh_path;
    private apps;
    static appProps: AppProps;
    constructor(props: {
        repoURL?: string;
        basePath?: string;
        sshPath?: string;
    });
    private setup;
    synth(): void;
    synth_yaml(): string;
    addApp(name: string): Chart;
    removeApp(name: string): void;
}
