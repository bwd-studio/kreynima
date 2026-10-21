export const STATUS_COMMAND = "application.status" as const;
export interface Status {
  application: "KREYNIMA";
  build: "000";
  projectOpen: false;
  capabilities: readonly ["application.status"];
}
/** Pure shared command dispatcher. No filesystem, network, or process access. */
export function executeCommand(command: {
  type: typeof STATUS_COMMAND;
}): Status {
  if (command.type !== STATUS_COMMAND) throw new Error("Unsupported command");
  return {
    application: "KREYNIMA",
    build: "000",
    projectOpen: false,
    capabilities: [STATUS_COMMAND],
  };
}
