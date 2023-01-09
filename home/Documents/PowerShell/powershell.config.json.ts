export default () =>
  JSON.stringify(
    { "Microsoft.PowerShell:ExecutionPolicy": "Bypass" },
    null,
    "  ",
  );
