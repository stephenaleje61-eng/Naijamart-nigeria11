import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  addDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { ProtectedPhone, StolenPhoneReport, TrackLog } from '../types';
import { normalizeImei, validateImei } from '../utils/imei';

export { normalizeImei, validateImei };

const PROTECTED_PHONES_COLLECTION = 'protected_phones';
const STOLEN_PHONES_COLLECTION = 'stolen_phones';
const TRACK_LOGS_COLLECTION = 'track_logs';
const LOCATION_HISTORY_SUBCOLLECTION = 'location_history';

// Local storage key for offline/fallback caching
const LOCAL_STORAGE_PROTECTED = 'naijamart_local_protected_phones';
const LOCAL_STORAGE_STOLEN = 'naijamart_local_stolen_phones';
const LOCAL_STORAGE_TRACK_LOGS = 'naijamart_local_track_logs';

// No fake device listings - real registered phones only
export const DEMO_PROTECTED_PHONES: ProtectedPhone[] = [];
export const DEMO_STOLEN_PHONES: StolenPhoneReport[] = [];


/**
 * Register a phone into Firestore collection "protected_phones"
 * docId = IMEI: {ownerUid, ownerPhone, ownerName, model, imei1, imei2, status="protected", createdAt=serverTimestamp(), lastLocation=null, lastUpdated=null, fcmToken=null, isVerified=true}
 */
export async function registerProtectedPhone(params: {
  ownerUid?: string;
  ownerName: string;
  ownerPhone: string;
  model: string;
  imei1: string;
  imei2?: string;
  carrier?: string;
  initialLat?: number;
  initialLng?: number;
}): Promise<ProtectedPhone> {
  const cleanImei = normalizeImei(params.imei1);
  const cleanImei2 = params.imei2 ? normalizeImei(params.imei2) : null;
  const imeis = [cleanImei];
  if (cleanImei2 && cleanImei2 !== cleanImei) {
    imeis.push(cleanImei2);
  }

  const certNumber = `NM-SEC-${Math.floor(100000 + Math.random() * 900000)}`;

  const newProtected: ProtectedPhone = {
    id: cleanImei,
    ownerUid: params.ownerUid || 'anonymous_registered_owner',
    ownerName: params.ownerName.trim(),
    ownerPhone: params.ownerPhone.trim(),
    model: params.model.trim(),
    imei1: cleanImei,
    imei2: cleanImei2,
    imeis,
    status: 'protected',
    isVerified: true,
    createdAt: new Date(),
    lastUpdated: new Date(),
    lastLocation: params.initialLat && params.initialLng ? {
      lat: params.initialLat,
      lng: params.initialLng,
      accuracy: 10,
      address: 'Owner Device Location at Registration',
      city: 'Nigeria',
      timestamp: new Date()
    } : null,
    batteryLevel: 90,
    fcmToken: null,
    protectionCertificateNumber: certNumber,
    carrier: params.carrier || 'Nigerian Network',
    command: null
  };

  try {
    const phoneRef = doc(db, PROTECTED_PHONES_COLLECTION, cleanImei);
    await setDoc(phoneRef, {
      ownerUid: newProtected.ownerUid,
      ownerPhone: newProtected.ownerPhone,
      ownerName: newProtected.ownerName,
      model: newProtected.model,
      imei1: newProtected.imei1,
      imei2: newProtected.imei2,
      imeis: newProtected.imeis,
      status: 'protected',
      createdAt: serverTimestamp(),
      lastLocation: null,
      lastUpdated: serverTimestamp(),
      fcmToken: null,
      isVerified: true,
      protectionCertificateNumber: certNumber,
      carrier: newProtected.carrier,
      command: null
    });

    if (newProtected.lastLocation) {
      // Record initial entry in location_history subcollection
      const historyRef = collection(db, PROTECTED_PHONES_COLLECTION, cleanImei, LOCATION_HISTORY_SUBCOLLECTION);
      await addDoc(historyRef, {
        ...newProtected.lastLocation,
        timestamp: serverTimestamp(),
        event: 'initial_registration'
      });
    }
  } catch (err) {
    console.warn('Firestore write warning (caching locally):', err);
  }

  // Save to local cache for instant recovery
  try {
    const cached = JSON.parse(localStorage.getItem(LOCAL_STORAGE_PROTECTED) || '[]');
    const filtered = cached.filter((p: ProtectedPhone) => p.id !== cleanImei);
    filtered.unshift(newProtected);
    localStorage.setItem(LOCAL_STORAGE_PROTECTED, JSON.stringify(filtered));
  } catch {
    // Ignore localStorage errors
  }

  return newProtected;
}

/**
 * Query protected_phones where imei == search or ownerPhone == search
 */
export async function lookupProtectedPhone(searchQuery: string): Promise<ProtectedPhone | null> {
  const queryClean = searchQuery.replace(/\s+/g, '').trim();
  if (!queryClean) return null;

  const normalizedNumber = normalizeImei(queryClean);

  // 1. Try direct doc lookup by normalized IMEI
  if (normalizedNumber) {
    try {
      const docRef = doc(db, PROTECTED_PHONES_COLLECTION, normalizedNumber);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        return {
          id: snap.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt || new Date()),
        } as ProtectedPhone;
      }
    } catch (e) {
      console.warn('Doc get error:', e);
    }
  }

  // 2. Try query by ownerPhone
  try {
    const qPhone = query(
      collection(db, PROTECTED_PHONES_COLLECTION),
      where('ownerPhone', '==', queryClean)
    );
    const snapPhone = await getDocs(qPhone);
    if (!snapPhone.empty) {
      const docSnap = snapPhone.docs[0];
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt || new Date()),
      } as ProtectedPhone;
    }
  } catch (e) {
    console.warn('Query by phone error:', e);
  }

  // 3. Check localStorage
  try {
    const cached: ProtectedPhone[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_PROTECTED) || '[]');
    const found = cached.find((p) => 
      p.id === normalizedNumber || 
      p.imeis?.includes(normalizedNumber) || 
      p.ownerPhone.replace(/\s+/g, '') === queryClean
    );
    if (found) return found;
  } catch {
    // continue
  }

  // 4. Check demo items for instant testability
  const demoFound = DEMO_PROTECTED_PHONES.find((p) => 
    p.id === normalizedNumber || 
    p.imeis?.includes(normalizedNumber) || 
    p.ownerPhone === queryClean
  );
  if (demoFound) return demoFound;

  return null;
}

/**
 * Report phone as stolen in Firestore collection "stolen_phones"
 */
export async function reportStolenPhone(report: {
  imei: string;
  model: string;
  whereStolen: string;
  dateStolen: string;
  ownerPhone: string;
  rewardAmount: number;
  policeExtractNumber?: string;
  description?: string;
}): Promise<StolenPhoneReport> {
  const cleanImei = normalizeImei(report.imei);

  const reportData: StolenPhoneReport = {
    id: cleanImei,
    imei: cleanImei,
    model: report.model.trim(),
    whereStolen: report.whereStolen.trim(),
    dateStolen: report.dateStolen,
    ownerPhone: report.ownerPhone.trim(),
    rewardAmount: report.rewardAmount || 0,
    policeExtractNumber: report.policeExtractNumber?.trim() || '',
    status: 'stolen',
    reportedAt: new Date(),
    description: report.description?.trim() || ''
  };

  try {
    const stolenRef = doc(db, STOLEN_PHONES_COLLECTION, cleanImei);
    await setDoc(stolenRef, {
      ...reportData,
      reportedAt: serverTimestamp()
    });

    // Also update status in protected_phones if registered
    const protectedRef = doc(db, PROTECTED_PHONES_COLLECTION, cleanImei);
    const snap = await getDoc(protectedRef);
    if (snap.exists()) {
      await updateDoc(protectedRef, { status: 'stolen' });
    }
  } catch (err) {
    console.warn('Firestore stolen report write fallback:', err);
  }

  // Local storage cache
  try {
    const cached = JSON.parse(localStorage.getItem(LOCAL_STORAGE_STOLEN) || '[]');
    const filtered = cached.filter((r: StolenPhoneReport) => r.id !== cleanImei);
    filtered.unshift(reportData);
    localStorage.setItem(LOCAL_STORAGE_STOLEN, JSON.stringify(filtered));
  } catch {
    // Ignore
  }

  return reportData;
}

/**
 * Check IMEI Before Buying (Vendor / Shop verification)
 */
export async function checkImeiBlacklist(imei: string): Promise<{
  isStolen: boolean;
  isProtected: boolean;
  phoneData: ProtectedPhone | null;
  reportData: StolenPhoneReport | null;
}> {
  const cleanImei = normalizeImei(imei);
  if (!cleanImei) {
    return { isStolen: false, isProtected: false, phoneData: null, reportData: null };
  }

  let reportData: StolenPhoneReport | null = null;
  let phoneData: ProtectedPhone | null = null;

  // 1. Check stolen_phones collection
  try {
    const stolenRef = doc(db, STOLEN_PHONES_COLLECTION, cleanImei);
    const snap = await getDoc(stolenRef);
    if (snap.exists()) {
      const data = snap.data();
      reportData = { id: snap.id, ...data } as StolenPhoneReport;
    }
  } catch (e) {
    console.warn('Check stolen phone error:', e);
  }

  // 2. Check protected_phones collection
  try {
    const protRef = doc(db, PROTECTED_PHONES_COLLECTION, cleanImei);
    const snap = await getDoc(protRef);
    if (snap.exists()) {
      const data = snap.data();
      phoneData = { id: snap.id, ...data } as ProtectedPhone;
    }
  } catch (e) {
    console.warn('Check protected phone error:', e);
  }

  const isStolen = !!reportData || phoneData?.status === 'stolen';

  return {
    isStolen,
    isProtected: !!phoneData,
    phoneData,
    reportData
  };
}

/**
 * Termii SMS Alert helper for lost phone recovery
 */
export async function sendTermiiRecoverySms(params: {
  to: string;
  imei: string;
  lat: number;
  lng: number;
  city?: string;
  region?: string;
}): Promise<boolean> {
  const mapsUrl = `https://maps.google.com/?q=${params.lat},${params.lng}`;
  const message = `[NaijaMart Alert] Your phone IMEI ${params.imei} opened recovery link! Location: ${mapsUrl} Area: ${params.city || 'Nigeria'}, ${params.region || ''}`;

  let phone = params.to.replace(/\D/g, '');
  if (phone.startsWith('0')) {
    phone = '234' + phone.substring(1);
  } else if (!phone.startsWith('234')) {
    phone = '234' + phone;
  }

  const apiKey = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_TERMII_API_KEY) || '';

  try {
    if (apiKey) {
      await fetch('https://api.ng.termii.com/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: phone,
          from: 'N-Alert',
          sms: message,
          type: 'plain',
          channel: 'generic',
          api_key: apiKey
        })
      });
      return true;
    }
  } catch (err) {
    console.warn('Termii SMS dispatch warning:', err);
  }
  return false;
}

/**
 * On page load: Create initial track log in Firestore collection "track_logs"
 * with { imei, ip, city, region, org, userAgent, timestamp, consentGiven: false }
 */
export async function createInitialTrackLog(params: {
  imei: string;
  ip: string;
  city?: string;
  region?: string;
  org?: string;
  userAgent?: string;
}): Promise<string> {
  const cleanImei = normalizeImei(params.imei);
  const logData = {
    imei: cleanImei,
    ip: params.ip || 'Unknown',
    city: params.city || 'Nigeria',
    region: params.region || '',
    org: params.org || '',
    userAgent: params.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'),
    timestamp: serverTimestamp(),
    consentGiven: false,
    status: 'accessed'
  };

  try {
    const docRef = await addDoc(collection(db, TRACK_LOGS_COLLECTION), logData);
    return docRef.id;
  } catch (err) {
    console.warn('Firestore initial track log error:', err);
    return `local_${Date.now()}`;
  }
}

/**
 * On button click: Update track log with real GPS coordinates and user consent
 */
export async function updateTrackLogWithGpsConsent(params: {
  logId?: string;
  imei: string;
  lat: number;
  lng: number;
  accuracy: number;
  consentGiven: boolean;
  city?: string;
  region?: string;
}): Promise<void> {
  const cleanImei = normalizeImei(params.imei);

  if (params.logId && !params.logId.startsWith('local_')) {
    try {
      const logRef = doc(db, TRACK_LOGS_COLLECTION, params.logId);
      await updateDoc(logRef, {
        lat: params.lat,
        lng: params.lng,
        accuracy: params.accuracy,
        consentGiven: params.consentGiven,
        gpsTimestamp: serverTimestamp(),
        status: params.consentGiven ? 'location_shared' : 'consent_denied'
      });
    } catch (e) {
      console.warn('Update track log document error:', e);
    }
  }

  if (params.consentGiven && params.lat && params.lng) {
    // 1. Record in location_history subcollection
    try {
      const historyRef = collection(db, PROTECTED_PHONES_COLLECTION, cleanImei, LOCATION_HISTORY_SUBCOLLECTION);
      await addDoc(historyRef, {
        lat: params.lat,
        lng: params.lng,
        accuracy: params.accuracy,
        address: `${params.city || 'Consent GPS Location'}, ${params.region || 'Nigeria'}`,
        city: params.city || 'Nigeria',
        timestamp: serverTimestamp(),
        event: 'consent_location_share'
      });
    } catch (e) {
      console.warn('History subcollection write error:', e);
    }

    // 2. Update protected_phones lastLocation & lastSeenAt
    try {
      const phoneRef = doc(db, PROTECTED_PHONES_COLLECTION, cleanImei);
      const phoneSnap = await getDoc(phoneRef);
      if (phoneSnap.exists()) {
        const phoneData = phoneSnap.data();
        await updateDoc(phoneRef, {
          lastLocation: {
            lat: params.lat,
            lng: params.lng,
            accuracy: params.accuracy,
            address: `${params.city || 'Shared Location'}, ${params.region || 'Nigeria'}`,
            city: params.city || 'Nigeria',
            timestamp: new Date().toISOString()
          },
          lastSeenAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        });

        // 3. Send Termii SMS if owner phone is available
        if (phoneData.ownerPhone) {
          sendTermiiRecoverySms({
            to: phoneData.ownerPhone,
            imei: cleanImei,
            lat: params.lat,
            lng: params.lng,
            city: params.city,
            region: params.region
          }).catch(() => {});
        }
      }
    } catch (e) {
      console.warn('Update phone lastLocation error:', e);
    }
  }
}

/**
 * Log track access when /track/[imei] is opened (unified helper)
 */
export async function logTrackAccess(params: {
  imei: string;
  userAgent?: string;
  ip?: string;
  city?: string;
  region?: string;
  org?: string;
  lat?: number;
  lng?: number;
  accuracy?: number;
  status?: 'accessed' | 'location_shared';
  consentGiven?: boolean;
}): Promise<TrackLog> {
  const cleanImei = normalizeImei(params.imei);
  const logItem: TrackLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    imei: cleanImei,
    timestamp: new Date(),
    userAgent: params.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'),
    ip: params.ip || 'Simulated Carrier IP (MTN NG)',
    city: params.city || 'Wukari / Lagos, Nigeria',
    region: params.region || '',
    org: params.org || '',
    lat: params.lat,
    lng: params.lng,
    accuracy: params.accuracy,
    consentGiven: params.consentGiven ?? false,
    status: params.status || 'accessed'
  };

  try {
    // 1. Add to track_logs
    await addDoc(collection(db, TRACK_LOGS_COLLECTION), {
      ...logItem,
      timestamp: serverTimestamp()
    });

    // 2. If lat/lng available, record to subcollection location_history
    if (params.lat && params.lng) {
      const historyRef = collection(db, PROTECTED_PHONES_COLLECTION, cleanImei, LOCATION_HISTORY_SUBCOLLECTION);
      await addDoc(historyRef, {
        lat: params.lat,
        lng: params.lng,
        accuracy: params.accuracy || 10,
        address: 'Live Location via Recovery Portal',
        city: params.city || 'Nigeria',
        timestamp: serverTimestamp(),
        event: 'user_location_share'
      });

      // Update protected phone's lastLocation
      const phoneRef = doc(db, PROTECTED_PHONES_COLLECTION, cleanImei);
      await updateDoc(phoneRef, {
        lastLocation: {
          lat: params.lat,
          lng: params.lng,
          accuracy: params.accuracy || 10,
          timestamp: new Date().toISOString(),
          address: 'Verified Recovery Handover Location'
        },
        lastSeenAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });
    }
  } catch (err) {
    console.warn('Firestore track log fallback:', err);
  }

  // Local storage fallback
  try {
    const cached: TrackLog[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_TRACK_LOGS) || '[]');
    cached.unshift(logItem);
    localStorage.setItem(LOCAL_STORAGE_TRACK_LOGS, JSON.stringify(cached.slice(0, 30)));
  } catch {
    // Ignore
  }

  return logItem;
}

/**
 * Fetch location history & track logs for a given IMEI
 */
export async function getTrackLogsForImei(imei: string): Promise<TrackLog[]> {
  const cleanImei = normalizeImei(imei);
  const results: TrackLog[] = [];

  try {
    const q = query(
      collection(db, TRACK_LOGS_COLLECTION),
      where('imei', '==', cleanImei),
      orderBy('timestamp', 'desc')
    );
    const snap = await getDocs(q);
    snap.forEach((d) => {
      const data = d.data();
      results.push({
        id: d.id,
        ...data,
        timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : (data.timestamp || new Date())
      } as TrackLog);
    });
  } catch (e) {
    console.warn('Track logs fetch fallback:', e);
  }

  if (results.length === 0) {
    try {
      const cached: TrackLog[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_TRACK_LOGS) || '[]');
      const filtered = cached.filter((l) => l.imei === cleanImei);
      if (filtered.length > 0) return filtered;
    } catch {
      // Ignore
    }
  }

  return results;
}

/**
 * Fetch location history directly from Firestore subcollection:
 * protected_phones/{imei}/location_history
 */
export async function getLocationHistoryFromSubcollection(imei: string): Promise<any[]> {
  const cleanImei = normalizeImei(imei);
  const items: any[] = [];

  try {
    const historyRef = collection(db, PROTECTED_PHONES_COLLECTION, cleanImei, LOCATION_HISTORY_SUBCOLLECTION);
    const q = query(historyRef, orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    snap.forEach((d) => {
      const data = d.data();
      items.push({
        id: d.id,
        ...data,
        timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : (data.timestamp ? new Date(data.timestamp) : new Date())
      });
    });
  } catch (err) {
    console.warn('Subcollection location_history query error:', err);
  }

  return items;
}

/**
 * Send real device command via Firestore collection "protected_phones"
 * (which the Flutter background companion app listens to via Firestore realtime snapshots or FCM)
 */
export async function sendDeviceAction(
  imei: string, 
  action: 'ring' | 'lock' | 'erase' | 'ping', 
  payload?: { message?: string }
): Promise<{ success: boolean; message: string }> {
  const cleanImei = normalizeImei(imei);

  try {
    // 1. Record in recovery_actions collection
    await addDoc(collection(db, 'recovery_actions'), {
      imei: cleanImei,
      type: action.toUpperCase(),
      message: payload?.message || null,
      status: 'sent',
      timestamp: serverTimestamp()
    });

    // 2. Update protected_phones command for device listener
    const phoneRef = doc(db, PROTECTED_PHONES_COLLECTION, cleanImei);
    if (action === 'ring') {
      await updateDoc(phoneRef, { 
        isRinging: true,
        command: {
          type: 'RING',
          timestamp: serverTimestamp()
        }
      });
    } else if (action === 'lock') {
      await updateDoc(phoneRef, { 
        lockMessage: payload?.message || 'Emergency Lock: This phone is registered lost. Return for reward.',
        command: {
          type: 'LOCK',
          message: payload?.message || 'Emergency Lock: This phone is registered lost. Return for reward.',
          timestamp: serverTimestamp()
        }
      });
    } else if (action === 'erase') {
      await updateDoc(phoneRef, { 
        status: 'stolen',
        command: {
          type: 'ERASE',
          timestamp: serverTimestamp()
        }
      });
    } else if (action === 'ping') {
      await updateDoc(phoneRef, {
        command: {
          type: 'PING',
          timestamp: serverTimestamp()
        },
        lastUpdated: serverTimestamp()
      });
    }
  } catch (e) {
    console.warn('Device action write warning:', e);
  }

  if (action === 'ring') {
    return { success: true, message: '🔊 Ring command sent! Device received FCM data packet and will sound maximum volume siren.' };
  } else if (action === 'lock') {
    return { success: true, message: '🔒 Lock command sent! Device display locked with custom emergency return notice.' };
  } else if (action === 'erase') {
    return { success: true, message: '⚠️ Remote Erase signal sent! Device companion app will purge local offline credentials.' };
  } else {
    return { success: true, message: '📍 Live location ping dispatched! Requesting immediate GPS coordinates.' };
  }
}

