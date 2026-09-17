# ARAM AI — Real-Time WebSocket & Event Architecture

**Protocol**: STOMP over SockJS  
**Endpoint**: `ws://localhost:8082/ws/updates`  
**Coordination**: Redis 7.0 Pub/Sub  

---

## 1. Destination Topics & Channel Mapping

| Destination Channel | Event Type | Target Audience | Payload Summary |
| :--- | :--- | :--- | :--- |
| `/topic/district/{district}` | `NEW_COMPLAINT` | Regional Admin | Complaint ID, Category, Priority, Complainant initials |
| `/topic/complaint/{complaintId}` | `NEW_MESSAGE` / `STATUS_UPDATE` | Citizen & Assigned Guide | Message text, sender role, milestone state |
| `/user/queue/notifications` | `NOTIFICATION_CREATED` | Individual User | In-app notification toast and unread count increment |

---

## 2. Reconnection & Resilience Policy

- **Exponential Backoff**: Reconnect interval begins at 1000ms, doubling up to a maximum of 30,000ms.
- **State Resynchronization**: Upon reconnect, the frontend triggers `GET /api/notifications` and `GET /api/complaints/my` to reconcile any events missed during connection drops.
