import subprocess

passwords = [
    'root', 'admin', 'password', '123456', 'root123', 'aram', 'aram123', 'mysql', 
    'root@123', 'Password123', 'Vishal@123', 'Jone@123', 'Vishal', 'Jone', 
    '1234', '12345', '12345678', 'system', 'mysql123', 'aram_app', 'aram_db'
]

mysql_bin = r"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"

print("=" * 60)
print("TESTING MYSQL ROOT & ARAM_APP AUTHENTICATION")
print("=" * 60)

found = False
for user in ['root', 'aram_app']:
    for p in passwords:
        cmd = [mysql_bin, f"-u{user}", f"-p{p}", "-e", "SHOW DATABASES;"]
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode == 0:
            print(f"SUCCESS! User: '{user}', Password: '{p}'")
            print(res.stdout)
            found = True
            break

if not found:
    print("Could not connect with standard test passwords. Checking without password...")
    for user in ['root', 'aram_app']:
        cmd = [mysql_bin, f"-u{user}", "-e", "SHOW DATABASES;"]
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode == 0:
            print(f"SUCCESS! User: '{user}', Password: NONE")
            print(res.stdout)
            found = True

if not found:
    print("FAILED to authenticate with tested passwords.")
