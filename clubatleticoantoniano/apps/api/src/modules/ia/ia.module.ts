import { Module } from "@nestjs/common";

import { IaController } from "./ia.controller";
import { ClaudeService } from "./claude.service";

@Module({
  controllers: [IaController],
  providers: [ClaudeService],
  exports: [ClaudeService],
})
export class IaModule {}
