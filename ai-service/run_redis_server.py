import sys
import time
from fakeredis import TcpFakeServer

server = TcpFakeServer(('127.0.0.1', 6379))
print("[STANDALONE TCP REDIS SERVER ONLINE ON 127.0.0.1:6379]")
try:
    server.serve_forever()
except KeyboardInterrupt:
    server.shutdown()
