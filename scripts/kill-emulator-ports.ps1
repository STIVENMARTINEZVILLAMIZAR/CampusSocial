# Libera puertos de emuladores Firebase en Windows (8080, 5001, 9099, 4000, 9199)
$ports = 8080, 5001, 9099, 4000, 9199, 4400
foreach ($port in $ports) {
  $lines = netstat -ano | Select-String ":$port\s"
  foreach ($line in $lines) {
    if ($line -match '\s+(\d+)\s*$') {
      $pid = $Matches[1]
      if ($pid -ne '0') {
        Write-Host "Puerto $port -> PID $pid"
        taskkill /PID $pid /F 2>$null
      }
    }
  }
}
Write-Host "Listo. Ejecuta: cd Backend; npm run dev"
