@echo off
"C:\Program Files\Git\cmd\git.exe" init
"C:\Program Files\Git\cmd\git.exe" add .
"C:\Program Files\Git\cmd\git.exe" config user.email "bot@example.com"
"C:\Program Files\Git\cmd\git.exe" config user.name "AI Bot"
"C:\Program Files\Git\cmd\git.exe" commit -m "Initial commit"
"C:\Program Files\Git\cmd\git.exe" branch -M main
"C:\Program Files\Git\cmd\git.exe" remote add origin https://github.com/Mukesh-2806/HBDMS-PORTAL.git
"C:\Program Files\Git\cmd\git.exe" push -u origin main
