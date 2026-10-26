import type { Branch } from '../../types/admin';

export const MOCK_BRANCHES: Branch[] = [
  {
    id: 'CN01',
    name: 'Chi nhánh Biên Hòa (Trụ sở chính)',
    address: '123 Đường ABC, Phường Tam Hiệp, TP. Biên Hòa, Đồng Nai',
    phone: '0236 6555 555',
    doctorCount: 8,
    roomCount: 4,
    status: 'Active',
    imageUrl: 'https://res.cloudinary.com/dolpobdpw/image/upload/v1789394598/smartschedule_ai/branches/hbof0tkdwotc5nvgbwc5.jpg',
  },
  {
    id: 'CN02',
    name: 'Chi nhánh Quận 1 (Trung tâm)',
    address: '123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
    phone: '028 3822 1111',
    doctorCount: 6,
    roomCount: 4,
    status: 'Active',
    imageUrl: 'https://res.cloudinary.com/dolpobdpw/image/upload/v1789394599/smartschedule_ai/branches/lm4e0z8emvydtalxcsu0.jpg',
  },
  {
    id: 'CN03',
    name: 'Chi nhánh TP. Thủ Đức',
    address: '789 Đường Võ Văn Ngân, Phường Bình Thọ, TP. Thủ Đức, TP.HCM',
    phone: '028 3720 3333',
    doctorCount: 4,
    roomCount: 4,
    status: 'Active',
    imageUrl: 'https://res.cloudinary.com/dolpobdpw/image/upload/v1789394600/smartschedule_ai/branches/spek6sbrzvggnjjjonyi.jpg',
  },
];
