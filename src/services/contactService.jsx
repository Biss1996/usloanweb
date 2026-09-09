// contactService.jsx — public contact form submissions.
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase.jsx'

export async function submitContactMessage({ name, email, phone, subject, message }) {
  await addDoc(collection(db, 'contactMessages'), {
    name,
    email,
    phone: phone || '',
    subject,
    message,
    status: 'new',
    createdAt: serverTimestamp(),
  })
}
