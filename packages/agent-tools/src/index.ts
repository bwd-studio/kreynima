import {
  CommandEngine,
  executeCommand,
  STATUS_COMMAND,
  requestSchema,
} from "@kreynima/command-engine";
export { requestSchema };
export const statusTool = {
  name: "kreynima_status",
  description:
    "Read BUILD 001 capabilities. This process does not control a running desktop.",
  run: () => executeCommand({ type: STATUS_COMMAND }),
};
/** Each server owns one isolated engine; schemas and operations are shared with the UI. */
export function createProjectTools() {
  const engine = new CommandEngine();
  return {
    read: () => engine.read(),
    command: (input: unknown) => engine.dispatch(input),
  };
}
