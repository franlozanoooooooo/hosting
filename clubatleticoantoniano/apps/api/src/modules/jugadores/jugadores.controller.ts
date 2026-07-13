import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { ROLES } from "@caa/shared";

import { JugadoresService } from "./jugadores.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser, type AuthUser } from "../../common/decorators/current-user.decorator";

@Controller("jugadores")
export class JugadoresController {
  constructor(private readonly jugadoresService: JugadoresService) {}

  // Todos los autenticados pueden listar; el servicio aplica el scoping por rol.
  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.jugadoresService.findAll(user);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.jugadoresService.findOne(id, user);
  }

  @Post()
  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.COORDINADOR)
  create(@Body() body: unknown) {
    return this.jugadoresService.create(body);
  }

  @Patch(":id")
  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.COORDINADOR)
  update(@Param("id") id: string, @Body() body: unknown) {
    return this.jugadoresService.update(id, body);
  }

  @Delete(":id")
  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN)
  remove(@Param("id") id: string) {
    return this.jugadoresService.remove(id);
  }
}
