import mysql.connector

passwords = ["aram", "aram123", "Pass@123", "root123!", "12345678", "Welcome1", "Welcome@123", "MySQL@123", "Vishal@123", "vishal", "vishal123", "Jone@123", "jone123"]

for pw in passwords:
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password=pw
        )
        print(f"\n==========================================")
        print(f"[FOUND SUCCESS] MySQL Root Password: '{pw}'")
        print(f"==========================================\n")
        cursor = conn.cursor()
        cursor.execute("CREATE DATABASE IF NOT EXISTS aram_db")
        cursor.execute("SHOW DATABASES")
        dbs = [d[0] for d in cursor.fetchall()]
        print(f"[DATABASES]: {dbs}")
        conn.close()
        break
    except Exception as e:
        print(f"Password '{pw}' failed")
