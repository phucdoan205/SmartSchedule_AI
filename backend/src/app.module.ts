import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module.js';
import { UploadModule } from './modules/upload/upload.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { BranchesModule } from './modules/branches/branches.module.js';
import { ServicesModule } from './modules/services/services.module.js';
import { AppointmentsModule } from './modules/appointments/appointments.module.js';
import { OperatoriesModule } from './modules/operatories/operatories.module.js';
import { EquipmentModule } from './modules/equipment/equipment.module.js';
import { PatientsModule } from './modules/patients/patients.module.js';
import { FinanceModule } from './modules/finance/finance.module.js';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module.js';
import { StaffModule } from './modules/staff/staff.module.js';
import { RolesModule } from './modules/roles/roles.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UploadModule,
    AuthModule,
    BranchesModule,
    ServicesModule,
    AppointmentsModule,
    OperatoriesModule,
    EquipmentModule,
    PatientsModule,
    FinanceModule,
    AuditLogsModule,
    StaffModule,
    RolesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
