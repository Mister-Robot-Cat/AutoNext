$repoPath = "C:\Users\user\desktop\antigravity"
Set-Location $repoPath

$prompt = @"
[AUTONOMOUS DEV AGENT] AutoNext Project Evolution Trigger:
1. Examine the current Git log, open issues, and codebase status.
2. Select the next logical enhancement from the ROADMAP.md.
3. Write clean, modular, production-ready code with complete TypeScript types.
4. Run 'npm run build' and 'npm test' to verify zero regression.
5. Create a conventional commit and push to origin main on GitHub.
"@

# Run the agy CLI in print mode, skipping permissions for full autonomy
# We log the output to a file so we can check on its progress
$dateStr = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$logFile = "$repoPath\scripts\logs\run_$dateStr.log"
New-Item -Path "$repoPath\scripts\logs" -ItemType Directory -Force | Out-Null

Write-Host "Starting autonomous agy execution at $(Get-Date)..."
agy --print $prompt --dangerously-skip-permissions > $logFile 2>&1
Write-Host "Execution finished. Logs at $logFile"
