import { executeCommand, STATUS_COMMAND } from "@kreynima/command-engine";
export const statusTool = {
  name: "kreynima_status",
  description:
    "Read KREYNIMA foundation capabilities. Does not inspect a running desktop session.",
  run: () => executeCommand({ type: STATUS_COMMAND }),
};
