import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptions, Profile } from 'passport-github';
import { TeamService } from 'src/team/team.service';
import { UserDto } from 'src/user/dto/user.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private userService: UserService, private teamService: TeamService) {
    const options: StrategyOptions = {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    };
    super(options);
  }

  async validate(_accessToken: string, _refreshToken: string, profile: Profile) {
    const userData: UserDto = {
      userId: profile.id,
      nickname: profile.username,
    };
    const user = await this.userService.createOrFindUser(userData);
    const ret = { ...user, userTeamId: (await this.teamService.findUserTeam(user.userId)).teamId };
    return ret; // req.user에 담기는 정보
  }
}
