import { useEffect, useRef } from 'react';
import { io }                from 'socket.io-client';
import { toast }             from 'react-hot-toast';
import useAuthStore          from '../store/authStore';
import useDeviceStore        from '../store/deviceStore';

const SOCKET_URL = 'http://localhost:5000';

const useSocket = () => {
  const token  = useAuthStore((s) => s.token);
  const store  = useDeviceStore();
  const socket = useRef(null);

  useEffect(() => {
    if (!token) return;

    socket.current = io(SOCKET_URL, {
      auth: { token },
      reconnectionAttempts: 5,
    });

    const s = socket.current;

    s.on('connect', () => console.log('Socket connected'));
    s.on('connect_error', (err) => console.error('Socket error:', err.message));

    // ── Cửa ──────────────────────────────────────────────
    s.on('door:status', ({ status }) => {
      store.setDoorStatus(status);
    });

    s.on('door:access', ({ result }) => {
      store.setLastAccess(result);
      if (result === 'granted') toast.success('Mở cửa thành công!');
      else                      toast.error('Thẻ không hợp lệ!');
    });

    s.on('door:uid_scanned', ({ uid }) => {
      store.setLastUID(uid);
      toast(`Thẻ vừa quẹt: ${uid}`, { icon: '🪪' });
    });

    s.on('door:uid_response', ({ uids }) => {
      const list = uids === 'empty' ? [] : uids.split(',');
      store.setUidList(list);
    });

    s.on('door:uid_result', ({ result }) => {
      const messages = {
        added:          'Thêm thẻ thành công!',
        already_exists: 'Thẻ đã tồn tại!',
        removed:        'Xóa thẻ thành công!',
        failed:         'Thao tác thất bại!',
        timeout:        'Hết thời gian học thẻ!',
        waiting_card:   'Đang chờ quẹt thẻ...',
      };
      toast(messages[result] || result, {
        icon: result === 'added' || result === 'removed' ? '✅' : '⚠️',
      });
    });

    // ── Giàn phơi + Mưa ──────────────────────────────────
    s.on('clothes:status', ({ status }) => {
      store.setClothesStatus(status);
    });

    s.on('clothes:warning', ({ reason }) => {
      if (reason === 'blocked_rain') toast.error('Đang mưa, không thể đẩy giàn ra!');
    });

    s.on('rain:status', ({ status }) => {
      store.setRainStatus(status);
      if (status === 'raining') toast('Trời đang mưa! Giàn phơi đã thu vào.', { icon: '🌧️' });
      else                      toast('Trời tạnh! Giàn phơi đã đẩy ra.', { icon: '☀️' });
    });

    // ── Phòng ─────────────────────────────────────────────
    s.on('room:dht', ({ temp, hum }) => {
      store.setDHT(temp, hum);
    });

    s.on('room:gas', ({ gas }) => {
      store.setGas(gas);
      if (gas === 1) toast.error('⚠️ Phát hiện khí gas!', { duration: 6000 });
    });

    s.on('room:people', ({ count }) => {
      store.setPeople(count);
    });

    s.on('room:light', ({ light }) => {
      store.setLight(light);
    });

    s.on('room:buzzer', ({ buzzer }) => {
      store.setBuzzer(buzzer);
    });

    s.on('room:fan_status', ({ status }) => {
      store.setFanStatus(status);
    });

    // ── Đèn ──────────────────────────────────────────────
    s.on('living:led_status', ({ status }) => {
      store.setLivingLed(status);
    });

    s.on('bedroom:led_status', ({ status }) => {
      store.setBedroomLed(status);
    });

    // ── Cảnh báo xâm nhập ────────────────────────────────
    s.on('alert:intruder', () => {
      store.setIntruderAlert(true);
      toast.error('🚨 CẢNH BÁO XÂM NHẬP!', { duration: 10000 });
      setTimeout(() => store.setIntruderAlert(false), 10000);
    });

    return () => s.disconnect();
  }, [token]);

  return socket.current;
};

export default useSocket;