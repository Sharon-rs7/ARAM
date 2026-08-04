import os
import shutil
import subprocess
import time
import mysql.connector

MYSQLD = r"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe"
DATADIR = r"E:\prgt\My-aram-app\mysql_data_standalone"

if os.path.exists(DATADIR):
    shutil.rmtree(DATADIR, ignore_errors=True)

os.makedirs(DATADIR, exist_ok=True)

print("Initializing MySQL standalone data directory...")
init_proc = subprocess.run([MYSQLD, f"--datadir={DATADIR}", "--initialize-insecure", "--console"], capture_output=True, text=True)
print(init_proc.stdout)
print(init_proc.stderr)

print("Starting standalone MySQL 8.0 server on port 3307...")
server_proc = subprocess.Popen([MYSQLD, f"--datadir={DATADIR}", "--port=3307", "--console"])
time.sleep(4)

print("Connecting to standalone MySQL 8.0 on port 3307...")
conn = mysql.connector.connect(host="127.0.0.1", port=3307, user="root", password="")
cursor = conn.cursor()
cursor.execute("CREATE DATABASE IF NOT EXISTS aram_db")
cursor.execute("SHOW DATABASES")
dbs = [d[0] for d in cursor.fetchall()]
print(f"[MYSQL 8.0 DATABASES]: {dbs}")
conn.close()

# Keep server running
server_proc.wait()
