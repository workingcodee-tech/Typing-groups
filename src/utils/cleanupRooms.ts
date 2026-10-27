import { collection, getDocs, doc, deleteDoc, query, limit } from 'firebase/firestore';
import { db } from '../firebase';

const STALE_ROOM_MAX_AGE_MS = 45 * 60 * 1000; // 45 daqiqa
const CLEANUP_THROTTLE_MS = 10 * 60 * 1000; // Har 10 daqiqada bir marta tekshirish

/**
 * Xonani va uning barcha ishtirokchilarini Firestore bazasidan to'liq o'chiradi.
 * Bu Firestore 1GB bepul xotirasi to'lib qolmasligini kafolatlaydi.
 */
export async function deleteRoomCompletely(roomId: string): Promise<void> {
  if (!roomId) return;
  try {
    const participantsRef = collection(db, 'rooms', roomId, 'participants');
    const snap = await getDocs(participantsRef);
    const deletePromises = snap.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deletePromises);
    await deleteDoc(doc(db, 'rooms', roomId));
  } catch (err) {
    console.warn(`Xonani (${roomId}) o'chirishda xatolik:`, err);
  }
}

/**
 * Ishtirokchini guruhdan o'chiradi. Agar xonada boshqa hech kim qolmasa,
 * bo'sh xonaning o'zini ham bazadan o'chiradi.
 */
export async function leaveAndCleanRoom(roomId: string, participantId: string): Promise<void> {
  if (!roomId || !participantId) return;
  try {
    const pRef = doc(db, 'rooms', roomId, 'participants', participantId);
    await deleteDoc(pRef);

    // Xonada qolgan ishtirokchilarni tekshirish
    const participantsRef = collection(db, 'rooms', roomId, 'participants');
    const remainingSnap = await getDocs(participantsRef);
    
    // Agar barcha o'yinchilar chiqib ketgan bo'lsa, xonani ham tozalash
    if (remainingSnap.empty) {
      await deleteDoc(doc(db, 'rooms', roomId));
    }
  } catch (err) {
    console.warn(`Ishtirokchi chiqishida xatolik:`, err);
  }
}

/**
 * Eskirgan yoki yopilgan xonalarni avtomatik tozalash funksiyasi.
 * Baza to'lib qolmasligi uchun vaqti-vaqti bilan eski (45+ daqiqalik) yoki
 * bo'sh xonalarni avtomatik o'chiradi.
 */
export async function cleanStaleRooms(): Promise<void> {
  try {
    const lastCleanupStr = localStorage.getItem('tg_last_rooms_cleanup');
    const now = Date.now();
    if (lastCleanupStr && now - Number(lastCleanupStr) < CLEANUP_THROTTLE_MS) {
      // Yaqinda tekshirilgan, kvotani tejaymiz
      return;
    }
    localStorage.setItem('tg_last_rooms_cleanup', String(now));

    // Oxirgi 25 ta xonani olib tekshiramiz
    const roomsRef = collection(db, 'rooms');
    const q = query(roomsRef, limit(25));
    const snap = await getDocs(q);

    if (snap.empty) return;

    for (const roomDoc of snap.docs) {
      const data = roomDoc.data();
      const roomId = roomDoc.id;

      // Xona yaratilgan vaqtini aniqlash
      let roomAgeMs = 0;
      if (typeof data.createdAtMs === 'number') {
        roomAgeMs = now - data.createdAtMs;
      } else if (data.createdAt) {
        const parsed = new Date(data.createdAt).getTime();
        if (!isNaN(parsed)) {
          roomAgeMs = now - parsed;
        }
      }

      // Agar xona 45 daqiqadan oshgan bo'lsa yoki 'finished' holatida 10 daqiqa turgan bo'lsa
      const isStale = roomAgeMs > STALE_ROOM_MAX_AGE_MS;
      const isFinishedOld = data.status === 'finished' && roomAgeMs > 10 * 60 * 1000;

      if (isStale || isFinishedOld) {
        await deleteRoomCompletely(roomId);
        continue;
      }

      // Bo'sh (0 ishtirokchi) xonani tekshirish
      try {
        const partsSnap = await getDocs(collection(db, 'rooms', roomId, 'participants'));
        if (partsSnap.empty && roomAgeMs > 5 * 60 * 1000) {
          // 5 daqiqadan ortiq bo'sh turgan xonani o'chirish
          await deleteDoc(doc(db, 'rooms', roomId));
        }
      } catch {
        // ignore
      }
    }
  } catch (err) {
    console.warn("Eski xonalarni tozalashda xatolik:", err);
  }
}
