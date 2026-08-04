import os
import subprocess
import time
import mysql.connector

MYSQLD = r"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe"
DATADIR = r"E:\prgt\My-aram-app\mysql_clean"

print("Starting MySQL 8.0 server on 127.0.0.1:3307...")
server_proc = subprocess.Popen([MYSQLD, f"--datadir={DATADIR}", "--port=3307", "--console"])

time.sleep(3)

print("Connecting to standalone MySQL 8.0 on port 3307...")
for attempt in range(10):
    try:
        conn = mysql.connector.connect(host="127.0.0.1", port=3307, user="root", password="")
        cursor = conn.cursor()
        cursor.execute("CREATE DATABASE IF NOT EXISTS aram_db")
        cursor.execute("SHOW DATABASES")
        dbs = [d[0] for d in cursor.fetchall()]
        print(f"\n==========================================")
        print(f"[STANDALONE MYSQL 8.0 ONLINE ON PORT 3307]")
        print(f"Databases: {dbs}")
        print(f"==========================================\n")
        conn.close()
        break
    except Exception as e:
        print(f"Waiting for MySQL server... ({e})")
        time.sleep(2)

server_proc.wait()
