import { ApiObject, type ApiObjectMetadata, type GroupVersionKind } from 'cdk8s';
import { type Construct } from 'constructs';
export interface ConfigManagementSpecCommand {
    command: string[];
    args?: string[];
}
export interface ConfigManagementSpec {
    version: string;
    init?: ConfigManagementSpecCommand;
    generate?: ConfigManagementSpecCommand;
    discover?: {
        fileName: string;
    };
}
export interface ConfigManagementPluginProps {
    readonly metadata?: ApiObjectMetadata;
    readonly spec: ConfigManagementSpec;
}
export declare class ArgocdConfigManagementPlugin extends ApiObject {
    static readonly GVK: GroupVersionKind;
    static manifest(props: ConfigManagementPluginProps): any;
    toJson(): any;
    constructor(scope: Construct, id: string, props: ConfigManagementPluginProps);
}
export declare function toJson_ConfigManagementPluginProps(obj: ConfigManagementPluginProps | undefined): Record<string, any> | undefined;
export declare function toJson_ConfigManagementPluginSpec(obj: ConfigManagementSpec | undefined): Record<string, any> | undefined;
