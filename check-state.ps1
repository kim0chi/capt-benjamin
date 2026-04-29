param()
$p = "c:\Users\Benedict\Documents\code\Capt. Benjamin\hooks\useAppState.ts"
$c = [IO.File]::ReadAllText($p)

# Check current state
Write-Host "=== Current State ==="
Write-Host "Has jarId?: $($c.Contains('jarId?: string'))"
Write-Host "Has addBill in return: $($c.Contains('    addBill,'))"

# Find the exact bytes around createdBy param
$idx = $c.IndexOf("createdBy: 'manual' | 'kapitan' = 'manual'")
if ($idx -ge 0) {
  $snippet = $c.Substring($idx, [Math]::Min(150, $c.Length - $idx))
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($snippet.Substring(0, [Math]::Min(60, $snippet.Length)))
  Write-Host "Bytes after createdBy param: $($bytes -join ',')"
} else {
  Write-Host "createdBy param NOT FOUND"
}

# Find return section
$rIdx = $c.LastIndexOf("    addGoal,")
if ($rIdx -ge 0) {
  $snippet = $c.Substring($rIdx, [Math]::Min(150, $c.Length - $rIdx))
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($snippet.Substring(0, [Math]::Min(60, $snippet.Length)))
  Write-Host "Bytes at return addGoal: $($bytes -join ',')"
} else {
  Write-Host "addGoal return NOT FOUND"
}
