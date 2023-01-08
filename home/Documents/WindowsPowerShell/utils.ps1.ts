export default () => `
function SetEnv {
  param($Key, $Value);
  Set-Item env:\\$Key -Value $Value;
  #Environment]::SetEnvironmentVariable($Key, $Value, "User");
}
`;
