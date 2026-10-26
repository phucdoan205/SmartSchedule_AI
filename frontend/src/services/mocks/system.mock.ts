import type { AiInsightItem, SystemAuditLog } from '../../types/admin';

export const MOCK_AI_INSIGHTS: AiInsightItem[] = [
  {
    id: 'ai-1',
    title: 'Khử khuẩn vô trùng tự động kích hoạt',
    description: 'Khoảng đệm 15 phút sau mỗi ca phẫu thuật Implant đang được kiểm soát 100% không phát sinh xung đột ghế mổ.',
    impactLevel: 'High',
    category: 'Schedule Optimization',
    suggestedAction: 'Xem sơ đồ ghế khám',
    timestamp: 'Vừa xong',
  },
];

export const MOCK_AUDIT_LOGS: SystemAuditLog[] = [];
