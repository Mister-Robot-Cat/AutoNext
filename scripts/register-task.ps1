$taskName = "AutoNext_Autonomous_Agent"
$scriptPath = "C:\Users\user\desktop\antigravity\scripts\auto-evolve.ps1"
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$scriptPath`""

# Trigger twice a day (e.g. 10 AM and 10 PM) or daily at 12 PM. Let's do Daily at 12 PM
$trigger = New-ScheduledTaskTrigger -Daily -At 12:00PM

# Run whether user is logged on or not
$principal = New-ScheduledTaskPrincipal -LogonType Interactive

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Description "Autonomous GitHub Activity Agent for AutoNext" -Force

Write-Host "Successfully registered Scheduled Task '$taskName'."
Write-Host "The agent will now run autonomously every day at 12:00 PM."
Write-Host "You can manage or trigger this task manually in the Windows Task Scheduler application."
