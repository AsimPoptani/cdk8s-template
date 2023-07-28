"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toJson_ConfigManagementPluginSpec = exports.toJson_ConfigManagementPluginProps = exports.ArgocdConfigManagementPlugin = void 0;
const cdk8s_1 = require("cdk8s");
class ArgocdConfigManagementPlugin extends cdk8s_1.ApiObject {
    static manifest(props) {
        return Object.assign(Object.assign({}, ArgocdConfigManagementPlugin.GVK), toJson_ConfigManagementPluginProps(props));
    }
    toJson() {
        const resolved = super.toJson();
        return Object.assign(Object.assign({}, ArgocdConfigManagementPlugin.GVK), toJson_ConfigManagementPluginProps(resolved));
    }
    constructor(scope, id, props) {
        super(scope, id, Object.assign(Object.assign({}, ArgocdConfigManagementPlugin.GVK), props));
    }
}
exports.ArgocdConfigManagementPlugin = ArgocdConfigManagementPlugin;
ArgocdConfigManagementPlugin.GVK = {
    apiVersion: 'argoproj.io/v1alpha1',
    kind: 'ConfigManagementPlugin'
};
function toJson_ConfigManagementPluginProps(obj) {
    if (obj === undefined) {
        return undefined;
    }
    ;
    const result = {
        metadata: obj.metadata,
        spec: toJson_ConfigManagementPluginSpec(obj.spec)
    };
    return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : (Object.assign(Object.assign({}, r), { [i[0]]: i[1] })), {});
}
exports.toJson_ConfigManagementPluginProps = toJson_ConfigManagementPluginProps;
function toJson_ConfigManagementPluginSpec(obj) {
    if (obj === undefined) {
        return undefined;
    }
    ;
    const result = {
        version: obj.version,
        init: obj === null || obj === void 0 ? void 0 : obj.init,
        generate: obj === null || obj === void 0 ? void 0 : obj.generate,
        discover: obj === null || obj === void 0 ? void 0 : obj.discover
    };
    return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : (Object.assign(Object.assign({}, r), { [i[0]]: i[1] })), {});
}
exports.toJson_ConfigManagementPluginSpec = toJson_ConfigManagementPluginSpec;
// export function tojson_command(configCommand?: ConfigManagementSpecCommand) {
//     if (configCommand === undefined) { return undefined; }
//
//     if (Array.isArray(configCommand.args)) {return {command:configCommand.command, args: configCommand.args}}
//     return {command: configCommand.command.toString(),args: configCommand.args}
//
// }
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJnb2NkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXJnb2NkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlDQUFnRjtBQW9CaEYsTUFBYSw0QkFBNkIsU0FBUSxpQkFBUztJQU1sRCxNQUFNLENBQUMsUUFBUSxDQUFFLEtBQWtDO1FBQ3hELHVDQUNLLDRCQUE0QixDQUFDLEdBQUcsR0FDaEMsa0NBQWtDLENBQUMsS0FBSyxDQUFDLEVBQzdDO0lBQ0gsQ0FBQztJQUVNLE1BQU07UUFDWCxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUE7UUFDL0IsdUNBQ0ssNEJBQTRCLENBQUMsR0FBRyxHQUNoQyxrQ0FBa0MsQ0FBQyxRQUFRLENBQUMsRUFDaEQ7SUFDSCxDQUFDO0lBRUQsWUFBb0IsS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBa0M7UUFDbEYsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLGtDQUFPLDRCQUE0QixDQUFDLEdBQUcsR0FBSyxLQUFLLEVBQUcsQ0FBQTtJQUNyRSxDQUFDOztBQXZCSCxvRUF3QkM7QUF2QndCLGdDQUFHLEdBQXFCO0lBQzdDLFVBQVUsRUFBRSxzQkFBc0I7SUFDbEMsSUFBSSxFQUFFLHdCQUF3QjtDQUMvQixDQUFBO0FBc0JILFNBQWdCLGtDQUFrQyxDQUFFLEdBQTRDO0lBQzlGLElBQUksR0FBRyxLQUFLLFNBQVMsRUFBRTtRQUFFLE9BQU8sU0FBUyxDQUFBO0tBQUU7SUFBQSxDQUFDO0lBQzVDLE1BQU0sTUFBTSxHQUFHO1FBQ2IsUUFBUSxFQUFFLEdBQUcsQ0FBQyxRQUFRO1FBQ3RCLElBQUksRUFBRSxpQ0FBaUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDO0tBQ2xELENBQUE7SUFDRCxPQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsaUNBQU0sQ0FBQyxLQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLEVBQUUsRUFBRSxDQUFDLENBQUE7QUFDekcsQ0FBQztBQVBELGdGQU9DO0FBRUQsU0FBZ0IsaUNBQWlDLENBQUUsR0FBcUM7SUFDdEYsSUFBSSxHQUFHLEtBQUssU0FBUyxFQUFFO1FBQUUsT0FBTyxTQUFTLENBQUE7S0FBRTtJQUFBLENBQUM7SUFFNUMsTUFBTSxNQUFNLEdBQUc7UUFDYixPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU87UUFDcEIsSUFBSSxFQUFFLEdBQUcsYUFBSCxHQUFHLHVCQUFILEdBQUcsQ0FBRSxJQUFJO1FBQ2YsUUFBUSxFQUFFLEdBQUcsYUFBSCxHQUFHLHVCQUFILEdBQUcsQ0FBRSxRQUFRO1FBQ3ZCLFFBQVEsRUFBRSxHQUFHLGFBQUgsR0FBRyx1QkFBSCxHQUFHLENBQUUsUUFBUTtLQUN4QixDQUFBO0lBQ0QsT0FBTyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGlDQUFNLENBQUMsS0FBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0FBQ3pHLENBQUM7QUFWRCw4RUFVQztBQUVELGdGQUFnRjtBQUNoRiw2REFBNkQ7QUFDN0QsRUFBRTtBQUNGLGdIQUFnSDtBQUNoSCxrRkFBa0Y7QUFDbEYsRUFBRTtBQUNGLElBQUkiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcGlPYmplY3QsIHR5cGUgQXBpT2JqZWN0TWV0YWRhdGEsIHR5cGUgR3JvdXBWZXJzaW9uS2luZCB9IGZyb20gJ2NkazhzJ1xuaW1wb3J0IHsgdHlwZSBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJ1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbmZpZ01hbmFnZW1lbnRTcGVjQ29tbWFuZCB7XG4gIGNvbW1hbmQ6IHN0cmluZ1tdXG4gIGFyZ3M/OiBzdHJpbmdbXVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbmZpZ01hbmFnZW1lbnRTcGVjIHtcbiAgdmVyc2lvbjogc3RyaW5nXG4gIGluaXQ/OiBDb25maWdNYW5hZ2VtZW50U3BlY0NvbW1hbmRcbiAgZ2VuZXJhdGU/OiBDb25maWdNYW5hZ2VtZW50U3BlY0NvbW1hbmRcbiAgZGlzY292ZXI/OiB7IGZpbGVOYW1lOiBzdHJpbmcgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbmZpZ01hbmFnZW1lbnRQbHVnaW5Qcm9wcyB7XG4gIHJlYWRvbmx5IG1ldGFkYXRhPzogQXBpT2JqZWN0TWV0YWRhdGFcbiAgcmVhZG9ubHkgc3BlYzogQ29uZmlnTWFuYWdlbWVudFNwZWNcbn1cblxuZXhwb3J0IGNsYXNzIEFyZ29jZENvbmZpZ01hbmFnZW1lbnRQbHVnaW4gZXh0ZW5kcyBBcGlPYmplY3Qge1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEdWSzogR3JvdXBWZXJzaW9uS2luZCA9IHtcbiAgICBhcGlWZXJzaW9uOiAnYXJnb3Byb2ouaW8vdjFhbHBoYTEnLFxuICAgIGtpbmQ6ICdDb25maWdNYW5hZ2VtZW50UGx1Z2luJ1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBtYW5pZmVzdCAocHJvcHM6IENvbmZpZ01hbmFnZW1lbnRQbHVnaW5Qcm9wcyk6IGFueSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLkFyZ29jZENvbmZpZ01hbmFnZW1lbnRQbHVnaW4uR1ZLLFxuICAgICAgLi4udG9Kc29uX0NvbmZpZ01hbmFnZW1lbnRQbHVnaW5Qcm9wcyhwcm9wcylcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgdG9Kc29uICgpOiBhbnkge1xuICAgIGNvbnN0IHJlc29sdmVkID0gc3VwZXIudG9Kc29uKClcbiAgICByZXR1cm4ge1xuICAgICAgLi4uQXJnb2NkQ29uZmlnTWFuYWdlbWVudFBsdWdpbi5HVkssXG4gICAgICAuLi50b0pzb25fQ29uZmlnTWFuYWdlbWVudFBsdWdpblByb3BzKHJlc29sdmVkKVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciAoc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IENvbmZpZ01hbmFnZW1lbnRQbHVnaW5Qcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgeyAuLi5BcmdvY2RDb25maWdNYW5hZ2VtZW50UGx1Z2luLkdWSywgLi4ucHJvcHMgfSlcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9Kc29uX0NvbmZpZ01hbmFnZW1lbnRQbHVnaW5Qcm9wcyAob2JqOiBDb25maWdNYW5hZ2VtZW50UGx1Z2luUHJvcHMgfCB1bmRlZmluZWQpOiBSZWNvcmQ8c3RyaW5nLCBhbnk+IHwgdW5kZWZpbmVkIHtcbiAgaWYgKG9iaiA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQgfTtcbiAgY29uc3QgcmVzdWx0ID0ge1xuICAgIG1ldGFkYXRhOiBvYmoubWV0YWRhdGEsXG4gICAgc3BlYzogdG9Kc29uX0NvbmZpZ01hbmFnZW1lbnRQbHVnaW5TcGVjKG9iai5zcGVjKVxuICB9XG4gIHJldHVybiBPYmplY3QuZW50cmllcyhyZXN1bHQpLnJlZHVjZSgociwgaSkgPT4gKGlbMV0gPT09IHVuZGVmaW5lZCkgPyByIDogKHsgLi4uciwgW2lbMF1dOiBpWzFdIH0pLCB7fSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvSnNvbl9Db25maWdNYW5hZ2VtZW50UGx1Z2luU3BlYyAob2JqOiBDb25maWdNYW5hZ2VtZW50U3BlYyB8IHVuZGVmaW5lZCk6IFJlY29yZDxzdHJpbmcsIGFueT4gfCB1bmRlZmluZWQge1xuICBpZiAob2JqID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZCB9O1xuXG4gIGNvbnN0IHJlc3VsdCA9IHtcbiAgICB2ZXJzaW9uOiBvYmoudmVyc2lvbixcbiAgICBpbml0OiBvYmo/LmluaXQsXG4gICAgZ2VuZXJhdGU6IG9iaj8uZ2VuZXJhdGUsXG4gICAgZGlzY292ZXI6IG9iaj8uZGlzY292ZXJcbiAgfVxuICByZXR1cm4gT2JqZWN0LmVudHJpZXMocmVzdWx0KS5yZWR1Y2UoKHIsIGkpID0+IChpWzFdID09PSB1bmRlZmluZWQpID8gciA6ICh7IC4uLnIsIFtpWzBdXTogaVsxXSB9KSwge30pXG59XG5cbi8vIGV4cG9ydCBmdW5jdGlvbiB0b2pzb25fY29tbWFuZChjb25maWdDb21tYW5kPzogQ29uZmlnTWFuYWdlbWVudFNwZWNDb21tYW5kKSB7XG4vLyAgICAgaWYgKGNvbmZpZ0NvbW1hbmQgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9XG4vL1xuLy8gICAgIGlmIChBcnJheS5pc0FycmF5KGNvbmZpZ0NvbW1hbmQuYXJncykpIHtyZXR1cm4ge2NvbW1hbmQ6Y29uZmlnQ29tbWFuZC5jb21tYW5kLCBhcmdzOiBjb25maWdDb21tYW5kLmFyZ3N9fVxuLy8gICAgIHJldHVybiB7Y29tbWFuZDogY29uZmlnQ29tbWFuZC5jb21tYW5kLnRvU3RyaW5nKCksYXJnczogY29uZmlnQ29tbWFuZC5hcmdzfVxuLy9cbi8vIH1cbiJdfQ==