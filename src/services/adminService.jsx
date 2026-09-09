// adminService.jsx — admin-facing aggregate queries + audit logging.
// Real enforcement of "admin-only" happens in firestore.rules via custom claims;
// this module is a convenience layer for the admin dashboard UI.
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase.jsx'

export async function createAuditLogEntry({ actorId, actorType, action, targetId, details }) {
  await addDoc(collection(db, 'auditLogs'), {
    actorId: actorId || null,
    actorType: actorType || 'system',
    action,
    targetId: targetId || null,
    details: details || {},
    createdAt: serverTimestamp(),
  })
}

export async function listAuditLogs() {
  const q = query(collection(db, 'auditLogs'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function listAllUsers() {
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function listContactMessages() {
  const q = query(collection(db, 'contactMessages'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}
