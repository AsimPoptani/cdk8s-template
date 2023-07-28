import { ApiObject, type ApiObjectMetadata, type GroupVersionKind } from 'cdk8s'
import { type Construct } from 'constructs'

export interface ConfigManagementSpecCommand {
  command: string[]
  args?: string[]
}

export interface ConfigManagementSpec {
  version: string
  init?: ConfigManagementSpecCommand
  generate?: ConfigManagementSpecCommand
  discover?: { fileName: string }
}

export interface ConfigManagementPluginProps {
  readonly metadata?: ApiObjectMetadata
  readonly spec: ConfigManagementSpec
}

export class ArgocdConfigManagementPlugin extends ApiObject {
  public static readonly GVK: GroupVersionKind = {
    apiVersion: 'argoproj.io/v1alpha1',
    kind: 'ConfigManagementPlugin'
  }

  public static manifest (props: ConfigManagementPluginProps): any {
    return {
      ...ArgocdConfigManagementPlugin.GVK,
      ...toJson_ConfigManagementPluginProps(props)
    }
  }

  public toJson (): any {
    const resolved = super.toJson()
    return {
      ...ArgocdConfigManagementPlugin.GVK,
      ...toJson_ConfigManagementPluginProps(resolved)
    }
  }

  public constructor (scope: Construct, id: string, props: ConfigManagementPluginProps) {
    super(scope, id, { ...ArgocdConfigManagementPlugin.GVK, ...props })
  }
}

export function toJson_ConfigManagementPluginProps (obj: ConfigManagementPluginProps | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined };
  const result = {
    metadata: obj.metadata,
    spec: toJson_ConfigManagementPluginSpec(obj.spec)
  }
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {})
}

export function toJson_ConfigManagementPluginSpec (obj: ConfigManagementSpec | undefined): Record<string, any> | undefined {
  if (obj === undefined) { return undefined };

  const result = {
    version: obj.version,
    init: obj?.init,
    generate: obj?.generate,
    discover: obj?.discover
  }
  return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {})
}

// export function tojson_command(configCommand?: ConfigManagementSpecCommand) {
//     if (configCommand === undefined) { return undefined; }
//
//     if (Array.isArray(configCommand.args)) {return {command:configCommand.command, args: configCommand.args}}
//     return {command: configCommand.command.toString(),args: configCommand.args}
//
// }
