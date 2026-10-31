import { collection, getDocs, doc, deleteDoc, query, limit, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Bo'sh va faol bo'lmagan xonani avtomatik o'chirish vaqti: kamida 1 daqiqa (60 soniya)
export const INACTIVE_ROOM_TIMEOUT_MS = 60 * 1000;

// Xonalarni tozalash tekshiruvi oralig'i (har 30 soniyada)
const CLEANUP_THROTTLE_MS = 30 * 1000;

/**
 * Xonani va uning barcha ishtirokchilarini Firestore bazasidan to'liq o'chiradi.
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
 * Ishtirokchini guruhdan o'chiradi.
 * Agar xonada boshqa hech kim qolmasa, xonaga emptySince belgisini qo'yadi.
 * Xona darhol o'chirilmaydi - faqat 1 daqiqa davomida hech kim kirmasagina o'chiriladi.
 */
export async function leaveAndCleanRoom(roomId: string, participantId: string): Promise<void> {
  if (!roomId || !participantId) return;
  try {
    const pRef = doc(db, 'rooms', roomId, 'participants', participantId);
    await deleteDoc(pRef).catch(() => {});

    // Xonada qolgan ishtirokchilarni tekshirish
    const participantsRef = collection(db, 'rooms', roomId, 'participants');
    const remainingSnap = await getDocs(participantsRef);

    // Agar xonada boshqa o'yinchilar bo'lsa, xona davom etaveradi
    if (!remainingSnap.empty) {
      return;
    }

    // Xonada hech kim qolmadi: 1 daqiqa kutiladi
    const now = Date.now();
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      emptySince: now
    }).catch(() => {});

    // 1 daqiqa (60s) o'tgach qayta tekshirib, agar hali ham 0 ta bo'lsagina o'chiriladi
    window.setTimeout(async () => {
      try {
        const checkParts = await getDocs(collection(db, 'rooms', roomId, 'participants'));
        if (checkParts.empty) {
          await deleteRoomCompletely(roomId);
        }
      } catch {
        // ignore
      }
    }, INACTIVE_ROOM_TIMEOUT_MS);
  } catch (err) {
    console.warn(`Ishtirokchi chiqishida xatolik:`, err);
  }
}

/**
 * Faol bo'lmagan xonalarni tozalash:
 * Qat'iy qoida: Xona FAQAT va FAQAT uning ichida kamida 1 daqiqa (60 soniya) davomida
 * birorta ham faol foydalanuvchi bo'lmagan taqdirdagina bazadan to'liq o'chirilishi mumkin.
 * Agar xonada bitta bo'lsa ham foydalanuvchi bo'lsa yoki so'nggi 60 soniya ichida
 * faollik (heartbeat) bo'lgan bo'lsa, xona HECH QACHON o'chirilmaydi!
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
    const q = query(roomsRef, limit(30));
    const snap = await getDocs(q);

    if (snap.empty) return;

    for (const roomDoc of snap.docs) {
      const data = roomDoc.data();
      const roomId = roomDoc.id;

      // Xonadagi so'nggi faollik vaqti (heartbeat yoki yaratilgan vaqti)
      const lastActive = data.lastActiveMs || data.createdAtMs || (data.createdAt ? new Date(data.createdAt).getTime() : 0);
      const inactiveDurationMs = now - lastActive;

      // 1. Ishtirokchilar mavjudligini tekshirish
      try {
        const partsSnap = await getDocs(collection(db, 'rooms', roomId, 'participants'));

        // Agar xonada kamida 1 ta ishtirokchi bo'lsa - xona FAOL, HECH QACHON O'CHIRILMAYDI!
        if (!partsSnap.empty) {
          // Agar xonaga xato bilan emptySince qo'yilgan bo'lsa, uni tozalab qo'yamiz
          if (data.emptySince) {
            await updateDoc(doc(db, 'rooms', roomId), { emptySince: null }).catch(() => {});
          }
          continue;
        }

        // Xonada 0 ta ishtirokchi qolgan:
        // Qoidamiz: Xona 1 daqiqa (60 soniya) davomida butunlay bo'sh va nofaol tursagina o'chiriladi
        const isEmptyFor60Seconds = data.emptySince && (now - data.emptySince >= INACTIVE_ROOM_TIMEOUT_MS);
        const isInactiveFor60Seconds = inactiveDurationMs >= INACTIVE_ROOM_TIMEOUT_MS;

        if (isEmptyFor60Seconds || isInactiveFor60Seconds) {
          await deleteRoomCompletely(roomId);
        } else if (!data.emptySince) {
          // Hali emptySince belgilanmagan bo'lsa, 1 daqiqalik hisobni boshlaymiz
          await updateDoc(doc(db, 'rooms', roomId), {
            emptySince: now
          }).catch(() => {});
        }
      } catch {
        // ignore
      }
    }
  } catch (err) {
    console.warn("Xonalarni tozalashda xatolik:", err);
  }
}
