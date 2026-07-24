Set-Location "C:\Users\HP\OneDrive\Documents\GitHub\SIS-Pulse"
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
npm run dev *> "C:\Users\HP\OneDrive\Documents\GitHub\SIS-Pulse\dev-output.log"