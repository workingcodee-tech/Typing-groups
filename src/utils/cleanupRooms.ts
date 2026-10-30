import { collection, getDocs, doc, deleteDoc, query, limit, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Bo'sh xonani avtomatik o'chirish vaqti: 1 daqiqa (60 soniya)
export const EMPTY_ROOM_DELETE_TIMEOUT_MS = 60 * 1000;

// Xonalarni tozalash tekshiruvi oralig'i: 20 soniya
const CLEANUP_THROTTLE_MS = 20 * 1000;

/**
 * Xonani va uning barcha ishtirokchilarini Firestore bazasidan to'liq o'chiradi.
 * Subcollection (participants) hujjatlarini ham tozalab, 'ghost document' qolishining oldini oladi.
 */
export async function deleteRoomCompletely(roomId: string): Promise<void> {
  if (!roomId) return;
  try {
    const participantsRef = collection(db, 'rooms', roomId, 'participants');
    const snap = await getDocs(participantsRef);
    const deletePromises = snap.docs.map((d) => deleteDoc(d.ref).catch(() => {}));
    await Promise.all(deletePromises);
    await deleteDoc(doc(db, 'rooms', roomId)).catch(() => {});
  } catch (err) {
    console.warn(`Xonani (${roomId}) to'liq o'chirishda xatolik:`, err);
  }
}

/**
 * Ishtirokchini guruhdan o'chiradi. Agar xonada boshqa hech kim qolmasa,
 * xonaga 1 daqiqalik o'chish belgisini qo'yadi va 1 daqiqadan so'ng avtomatik tarzda o'chiradi.
 */
export async function leaveAndCleanRoom(roomId: string, participantId: string): Promise<void> {
  if (!roomId || !participantId) return;
  try {
    const pRef = doc(db, 'rooms', roomId, 'participants', participantId);
    await deleteDoc(pRef).catch(() => {});

    // Xonada qolgan ishtirokchilarni tekshirish
    const participantsRef = collection(db, 'rooms', roomId, 'participants');
    const remainingSnap = await getDocs(participantsRef);

    // Agar barcha a'zolar chiqib ketgan bo'lsa (xonada hech kim qolmadi)
    if (remainingSnap.empty) {
      const now = Date.now();
      const roomRef = doc(db, 'rooms', roomId);

      // Xonani bo'sh deb belgilash va 1 daqiqadan keyin o'chirish taymerini qayd etish
      await updateDoc(roomRef, {
        emptySince: now,
        scheduledDeletionAt: now + EMPTY_ROOM_DELETE_TIMEOUT_MS,
        status: 'abandoned'
      }).catch(async () => {
        // Agar xona yangilanmasa, darhol tozalashga urinish
        await deleteRoomCompletely(roomId);
      });

      // Brauzer ochiq tursa, 1 daqiqadan (60s) so'ng avtomatik o'chirish
      window.setTimeout(async () => {
        try {
          const checkParts = await getDocs(collection(db, 'rooms', roomId, 'participants'));
          if (checkParts.empty) {
            await deleteRoomCompletely(roomId);
          }
        } catch {
          // ignore
        }
      }, EMPTY_ROOM_DELETE_TIMEOUT_MS);
    }
  } catch (err) {
    console.warn(`Ishtirokchi chiqishida xatolik:`, err);
  }
}

/**
 * Eskirgan yoki 1 daqiqadan ortiq bo'sh turgan xonalarni Firestore'dan avtomatik tozalash funksiyasi.
 * Barcha a'zolari chiqib ketgan xonalarni 1 daqiqa o'tgach avtomatik o'chiradi.
 */
export async function cleanStaleRooms(): Promise<void> {
  try {
    const lastCleanupStr = localStorage.getItem('tg_last_rooms_cleanup');
    const now = Date.now();
    if (lastCleanupStr && now - Number(lastCleanupStr) < CLEANUP_THROTTLE_MS) {
      return;
    }
    localStorage.setItem('tg_last_rooms_cleanup', String(now));

    // Bazadagi xonalarni olib tekshiramiz
    const roomsRef = collection(db, 'rooms');
    const q = query(roomsRef, limit(50));
    const snap = await getDocs(q);

    if (snap.empty) return;

    for (const roomDoc of snap.docs) {
      const data = roomDoc.data();
      const roomId = roomDoc.id;

      // Xona yaratilgan vaqti
      let roomAgeMs = 0;
      if (typeof data.createdAtMs === 'number') {
        roomAgeMs = now - data.createdAtMs;
      } else if (data.createdAt) {
        const parsed = new Date(data.createdAt).getTime();
        if (!isNaN(parsed)) {
          roomAgeMs = now - parsed;
        }
      }

      // 1. Agar xona allaqachon emptySince belgisiga ega bo'lsa va 1 daqiqa (60s) o'tgan bo'lsa
      if (typeof data.emptySince === 'number') {
        if (now - data.emptySince >= EMPTY_ROOM_DELETE_TIMEOUT_MS) {
          await deleteRoomCompletely(roomId);
          continue;
        }
      }

      // 2. Ishtirokchilar sonini tekshirish
      try {
        const partsSnap = await getDocs(collection(db, 'rooms', roomId, 'participants'));
        if (partsSnap.empty) {
          // Xonada 0 ta ishtirokchi!
          // Agar 1 daqiqadan ko'proq vaqt oldin yaratilgan bo'lsa yoki emptySince 60s dan oshgan bo'lsa:
          if (roomAgeMs >= EMPTY_ROOM_DELETE_TIMEOUT_MS) {
            await deleteRoomCompletely(roomId);
          } else if (!data.emptySince) {
            // Hali emptySince belgisi bo'lmasa, uni belgilab qo'yamiz
            await updateDoc(doc(db, 'rooms', roomId), {
              emptySince: now,
              scheduledDeletionAt: now + EMPTY_ROOM_DELETE_TIMEOUT_MS,
              status: 'abandoned'
            }).catch(() => {});
          }
          continue;
        }
      } catch {
        // ignore
      }

      // 3. Eskirgan faol bo'lmagan xonalar (30 daqiqadan oshgan bo'lsa)
      if (roomAgeMs > 30 * 60 * 1000) {
        await deleteRoomCompletely(roomId);
      }
    }
  } catch (err) {
    console.warn("Xonalarni tozalashda xatolik:", err);
  }
}
