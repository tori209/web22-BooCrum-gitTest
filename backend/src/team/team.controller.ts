import { Body, Controller, Get, Patch, Post, Req } from '@nestjs/common';
import { TeamDTO } from './dto/team.dto';
import { TeamMember } from './entity/team-member.entity';
import { Team } from './entity/team.entity';
import { TeamService } from './team.service';

@Controller('team')
export class TeamController {
  constructor(private teamService: TeamService) {}

  @Post('/create')
  async createTeam(@Body() teamDTO: TeamDTO): Promise<any> {
    return this.teamService.createTeam(teamDTO);
  }

  @Post('/select')
  async selectTeam(@Body() team: Team): Promise<any> {
    return await this.teamService.selectTeam(team);
  }

  @Patch('/team-update')
  async updateTeam(@Body() team: Team): Promise<any> {
    return await this.teamService.updateTeam(team);
  }

  @Patch('/member-update')
  async updateTeamMember(@Body() TeamMember: TeamMember): Promise<any> {
    return await this.teamService.updateTeamMember(TeamMember);
  }
}
