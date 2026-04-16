import { create } from 'zustand';

const useDeviceStore = create((set) => ({
  // Cửa
  doorStatus:    'closed',
  lastAccess:    null,
  lastUID:       null,
  uidList:       [],

  // Giàn phơi + Mưa
  clothesStatus: 'out',
  rainStatus:    'clear',

  // Phòng
  temperature:   0,
  humidity:      0,
  gas:           0,
  people:        0,
  light:         'bright',
  buzzer:        0,
  fanStatus:     '0',

  // Đèn
  livingLed:     '0',
  bedroomLed:    '0',

  // Cảnh báo
  intruderAlert: false,

  // Setters
  setDoorStatus:    (doorStatus)    => set({ doorStatus }),
  setLastAccess:    (lastAccess)    => set({ lastAccess }),
  setLastUID:       (lastUID)       => set({ lastUID }),
  setUidList:       (uidList)       => set({ uidList }),
  setClothesStatus: (clothesStatus) => set({ clothesStatus }),
  setRainStatus:    (rainStatus)    => set({ rainStatus }),
  setDHT:           (temperature, humidity) => set({ temperature, humidity }),
  setGas:           (gas)           => set({ gas }),
  setPeople:        (people)        => set({ people }),
  setLight:         (light)         => set({ light }),
  setBuzzer:        (buzzer)        => set({ buzzer }),
  setFanStatus:     (fanStatus)     => set({ fanStatus }),
  setLivingLed:     (livingLed)     => set({ livingLed }),
  setBedroomLed:    (bedroomLed)    => set({ bedroomLed }),
  setIntruderAlert: (intruderAlert) => set({ intruderAlert }),

  // Load trạng thái ban đầu từ API
  initFromAPI: (data) => set({
    doorStatus:    data.door?.status    ?? 'closed',
    clothesStatus: data.clothes?.status ?? 'out',
    rainStatus:    data.rain?.status    ?? 'clear',
    temperature:   data.room?.temperature ?? 0,
    humidity:      data.room?.humidity    ?? 0,
    gas:           data.room?.gas         ?? 0,
    people:        data.room?.people      ?? 0,
    light:         data.room?.light       ?? 'bright',
    buzzer:        data.room?.buzzer      ?? 0,
    fanStatus:     data.room?.fanStatus   ?? '0',
    livingLed:     data.living?.ledStatus  ?? '0',
    bedroomLed:    data.bedroom?.ledStatus ?? '0',
  }),
}));

export default useDeviceStore;