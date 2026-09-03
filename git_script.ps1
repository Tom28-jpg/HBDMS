$gitExe = 'C:\Program Files\Git\cmd\git.exe'
& $gitExe init
& $gitExe add .
& $gitExe config user.email "bot@example.com"
& $gitExe config user.name "AI Bot"
& $gitExe commit -m "Initial commit"
& $gitExe branch -M main
& $gitExe remote add origin https://github.com/Mukesh-2806/HBDMS-PORTAL.git
& $gitExe push -u origin main
