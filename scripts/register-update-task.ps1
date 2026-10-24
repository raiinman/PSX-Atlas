# Run once as the current user; no administrator password is needed.
$ErrorActionPreference = 'Stop'
$atlasRoot = Split-Path $PSScriptRoot -Parent
$atlasNode = (Get-Command node).Source
$atlasShell = (Get-Command pwsh).Source
$atlasInstaller = Join-Path $PSScriptRoot 'install-update.mjs'
$atlasLog = Join-Path $atlasRoot '_updates\scheduled-install.log'
New-Item -ItemType Directory -Path (Split-Path $atlasLog -Parent) -Force | Out-Null
$atlasCommand = "& '$($atlasNode.Replace("'","''"))' '$($atlasInstaller.Replace("'","''"))' *> '$($atlasLog.Replace("'","''"))'; exit `$LASTEXITCODE"
$atlasEncoded = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($atlasCommand))
$atlasIdentity = [Security.Principal.WindowsIdentity]::GetCurrent().User.Value
$atlasBoundary = [DateTime]::UtcNow.Date.AddHours(15).AddMinutes(7).ToString('yyyy-MM-ddTHH:mm:ssZ')
$atlasEscape = {param($value) [Security.SecurityElement]::Escape($value)}
$atlasXml = @"
<Task version="1.4" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo><Description>Install only verified PSX Atlas releases; retain the previous offline archive.</Description></RegistrationInfo>
  <Triggers><CalendarTrigger><StartBoundary>$atlasBoundary</StartBoundary><Enabled>true</Enabled><ScheduleByDay><DaysInterval>1</DaysInterval></ScheduleByDay></CalendarTrigger></Triggers>
  <Principals><Principal id="Author"><UserId>$atlasIdentity</UserId><LogonType>InteractiveToken</LogonType><RunLevel>LeastPrivilege</RunLevel></Principal></Principals>
  <Settings><MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy><DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries><StopIfGoingOnBatteries>false</StopIfGoingOnBatteries><StartWhenAvailable>true</StartWhenAvailable><RunOnlyIfNetworkAvailable>true</RunOnlyIfNetworkAvailable><ExecutionTimeLimit>PT15M</ExecutionTimeLimit><Hidden>true</Hidden></Settings>
  <Actions Context="Author"><Exec><Command>$(& $atlasEscape $atlasShell)</Command><Arguments>-NoProfile -NonInteractive -WindowStyle Hidden -EncodedCommand $atlasEncoded</Arguments><WorkingDirectory>$(& $atlasEscape $atlasRoot)</WorkingDirectory></Exec></Actions>
</Task>
"@
Register-ScheduledTask -TaskName 'PSX Atlas Daily Update' -Xml $atlasXml -Force | Select-Object TaskName,State
Get-ScheduledTaskInfo -TaskName 'PSX Atlas Daily Update' | Select-Object NextRunTime,LastTaskResult
