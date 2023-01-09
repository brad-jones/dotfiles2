export default () => `
function SetEnv {
    param($Key, $Value);
    $currentValue = (Get-Item env:\\$Key -ErrorAction SilentlyContinue).Value
    if ($currentValue -ne $Value) {
        Set-Item env:\\$Key -Value $Value;
        [Environment]::SetEnvironmentVariable($Key, $Value, "User");
    }
}

function RefreshEnv {
    taskkill /f /im explorer.exe; explorer.exe
}
`;
