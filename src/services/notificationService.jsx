// notificationService.jsx — per-user notification subcollection helpers.
import { addDoc, collection, getDocs, orderBy, query, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase.jsx'

export async function createNotification(uid, { title, message, type }) {
  if (!uid) return
  await addDoc(collection(db, 'users', uid, 'notifications'), {
    title,
    message,
    type,
    read: false,
    createdAt: serverTimestamp(),
  })
}

export async function listNotifications(uid) {
  const q = query(collection(db, 'users', uid, 'notifications'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function markNotificationRead(uid, notificationId) {
  await updateDoc(doc(db, 'users', uid, 'notifications', notificationId), { read: true })
}
