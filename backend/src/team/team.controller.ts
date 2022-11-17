import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Session,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthorizationGuard } from 'src/auth/guard/session.guard';
import { TeamDTO } from './dto/team.dto';
import { TeamMember } from './entity/team-member.entity';
import { Team } from './entity/team.entity';
import { Role } from './enum/role.enum';
import { TeamService } from './team.service';

@Controller('team')
export class TeamController {
  constructor(private teamService: TeamService) {}

  // Team 생성
  @Post('/')
  @UseGuards(AuthorizationGuard)
  async createTeam(@Session() session: Record<string, any>, @Body() teamDTO: TeamDTO): Promise<any> {
    teamDTO.userId = session.user.userId;
    return this.teamService.createTeam(teamDTO);
  }

  // Team Member 추가
  @Post('/:teamId/member')
  @UseGuards(AuthorizationGuard)
  async insertTeamMember(
    @Session() session: Record<string, any>,
    @Param('teamId') teamId: number,
    @Body() teamMember: TeamMember,
  ): Promise<any> {
    const user = await this.teamService.findTeamMember(teamId, session.user.userId);
    if (!user) throw new BadRequestException(`해당 팀에 대한 권한이 없습니다.`);
    if (user.role < 1) new BadRequestException(`해당 권한이 없습니다.`);
    teamMember.team = await this.teamService.findTeam(teamId);
    return this.teamService.insertTeamMember(teamId, teamMember);
  }

  // Team Member 조회
  @Get('/:teamId/member')
  @UseGuards(AuthorizationGuard)
  async selectTeamMember(@Session() session: Record<string, any>, @Param('teamId') teamId: number): Promise<any> {
    const user = await this.teamService.findTeamMember(teamId, session.user.userId);
    if (!user) throw new BadRequestException(`해당 팀에 대한 권한이 없습니다.`);
    if (user.role < 1) new BadRequestException(`해당 권한이 없습니다.`);
    return await this.teamService.selectTeamMember(teamId);
  }

  // Team Workspace 조회
  @Get('/:teamId/workspace')
  @UseGuards(AuthorizationGuard)
  async selectTeamWorkspace(@Param('teamId') teamId: number): Promise<any> {
    return await this.teamService.selectTeamWorkspace(teamId);
  }

  // Team 정보 수정
  @Patch('/')
  @UseGuards(AuthorizationGuard)
  async updateTeam(@Body() team: Team): Promise<any> {
    return await this.teamService.updateTeam(team);
  }

  // Team Member 정보 수정
  @Patch('/member')
  @UseGuards(AuthorizationGuard)
  async updateTeamMember(@Body() teamMember: TeamMember): Promise<any> {
    return await this.teamService.updateTeamMember(teamMember);
  }

  // Team Member 삭제
  @Delete('/:teamId/member/:userId')
  @UseGuards(AuthorizationGuard)
  async deleteTeamMember(@Param('teamId') teamId: number, @Param('userId') userId: string) {
    return await this.teamService.deleteTeamMember(teamId, userId);
  }

  // Team 삭제
  @Delete('/:teamId')
  @UseGuards(AuthorizationGuard)
  async delteTeam(@Param('teamId') teamId: number) {
    return await this.teamService.deleteTeam(teamId);
  }
}
