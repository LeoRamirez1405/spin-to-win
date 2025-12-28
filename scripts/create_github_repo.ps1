param(
  [string]$RepoName = "spin-to-win",
  [string]$GhUser = "LeoRamirez1405"
)

$Full = "$GhUser/$RepoName"

if (Get-Command gh -ErrorAction SilentlyContinue) {
  $auth = gh auth status 2>$null
  if ($LASTEXITCODE -ne 0) {
    Write-Host "gh CLI not authenticated. Run: gh auth login"
    exit 1
  }
  Write-Host "Creating repo using gh: $Full"
  gh repo create $Full --public --source=. --remote=origin --push
  Write-Host "Repository created and pushed: https://github.com/$Full"
  exit 0
}

if (-not $env:GITHUB_TOKEN) {
  Write-Host "gh CLI not found and GITHUB_TOKEN not set. Install gh or set GITHUB_TOKEN." -ForegroundColor Red
  exit 1
}

$body = @{ name = $RepoName; private = $false } | ConvertTo-Json
$resp = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Body $body -Headers @{ Authorization = "token $env:GITHUB_TOKEN"; "User-Agent" = "spin-to-win" }

$remoteUrl = "https://github.com/$Full.git"
git remote add origin $remoteUrl -ErrorAction SilentlyContinue
git branch -M main
git push -u origin main
Write-Host "Repository created and pushed: $remoteUrl"
