$taskName = "AutoNext_Autonomous_Agent"
$scriptPath = "C:\Users\user\desktop\antigravity\scripts\auto-evolve.ps1"
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$scriptPath`""

# Run 6 times a day (every 4 hours)
$triggers = @(
    (New-ScheduledTaskTrigger -Daily -At "12:00 AM"),
    (New-ScheduledTaskTrigger -Daily -At "04:00 AM"),
    (New-ScheduledTaskTrigger -Daily -At "08:00 AM"),
    (New-ScheduledTaskTrigger -Daily -At "12:00 PM"),
    (New-ScheduledTaskTrigger -Daily -At "04:00 PM"),
    (New-ScheduledTaskTrigger -Daily -At "08:00 PM")
)

# Run whether user is logged on or not
$principal = New-ScheduledTaskPrincipal -LogonType Interactive

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $triggers -Principal $principal -Description "Autonomous GitHub Activity Agent for AutoNext" -Force

Write-Host "Successfully registered Scheduled Task '$taskName'."
Write-Host "The agent will now run autonomously 6 times a day."
Write-Host "You can manage or trigger this task manually in the Windows Task Scheduler application."
