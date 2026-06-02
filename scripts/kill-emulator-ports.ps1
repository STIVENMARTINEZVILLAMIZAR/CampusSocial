# Libera puertos de emuladores Firebase en Windows
# Nota: $pid es variable reservada en PowerShell — usar $procId

$ports = @(4000, 4400, 4401, 4500, 4501, 5001, 8080, 9099, 9150, 9199)
$killed = @{}

foreach ($port in $ports) {
  $matches = netstat -ano | Select-String ":$port\s"
  foreach ($line in $matches) {
    if ($line -match '\s+(\d+)\s*$') {
      $procId = [int]$Matches[1]
      if ($procId -le 0) { continue }
      if ($killed.ContainsKey($procId)) { continue }
      $killed[$procId] = $true
      Write-Host "Puerto $port -> PID $procId"
      taskkill /PID $procId /F 2>$null | Out-Null
    }
  }
}

Start-Sleep -Seconds 2
Write-Host "Puertos liberados. Ejecuta: cd Backend; npm run dev"
