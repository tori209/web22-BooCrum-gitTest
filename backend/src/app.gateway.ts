import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { AxiosResponse } from 'axios';
import * as cookieParser from 'cookie-parser';
import { Server, Socket } from 'socket.io';
import { CreateObjectDTO } from './object-database/dto/create-object.dto';
import { UserMapVO } from './user-map.vo';

@WebSocketGateway(8080, { cors: '*', namespace: /workspace\/.+/ })
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');
  private userMap = new Map();

  constructor(private readonly httpService: HttpService) {}

  async handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);

    // 1. Workspace 존재 여부 체크
    const workspaceId = client.nsp.name.match(/workspace\/(.+)/)[1];
    const isValidWorkspace = await this.isExistWorkspace(workspaceId);
    if (!isValidWorkspace) {
      this.logger.log(`존재하지 않는 Workspace 접근`);
      client.disconnect();
      return;
    }

    // 2. 쿠키 존재 여부 조회 => 비회원 or 회원
    const cookie = client.handshake.headers.cookie;
    const userId = await this.getUserId(cookie, client.id);

    // 3. WorkspaceMember 존재 여부 조회 후 role 부여
    const role = await this.getUserRole(workspaceId, userId);

    // 4. Random 색상 지정
    const color = `#${Math.round(Math.random() * 0xffffff).toString(16)}`;

    // 5. room 추가
    client.join(workspaceId);
    client.join(userId);

    // 6. userMap 추가 (현재: key = client.id, 변경 시 : `${userId}_${workspaceId}`)
    this.userMap.set(`${userId}_${workspaceId}`, new UserMapVO(client.id, userId, workspaceId, role, color));

    // 7. Socket.io - Client 이벤트 호출
    const members = Array.from(this.userMap.keys())
      .filter((key: string) => key.split('_')[1] === workspaceId)
      .map((key: string) => key.split('_')[0]);
    const objects = await this.getAllObjects(workspaceId);

    this.server.to(workspaceId).emit('init', { members, objects });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.userMap.delete(client.id);
  }

  @SubscribeMessage('create')
  async createObject(@MessageBody() body: CreateObjectDTO, @ConnectedSocket() socket: Socket) {
    const result = await this.requestAPI(
      `http://localhost:3000/api/object-database/694cc960-0aed-4292-8eac-4a7f447f42ae/object`,
      'POST',
      body,
    );
  }

  async getAllObjects(workspaceId: string) {
    // TODO: Workspace에 해당하는 객체 API 호출 -> 객체 리스트 반환
    return [];
  }

  async isExistWorkspace(workspaceId: string) {
    try {
      const response = await this.httpService.axiosRef.get(
        `http://localhost:3000/api/workspace/${workspaceId}/info/metadata`,
        {
          headers: {
            accept: 'application/json',
          },
        },
      );
      if (response.data) return true;
    } catch (e) {
      return false;
    }
  }

  async getUserId(cookie: string, clientId: string) {
    if (!cookie) {
      return clientId;
    } else {
      const sessionId = cookieParser.signedCookie(decodeURIComponent(cookie.split('=')[1]), process.env.SESSION_SECRET);

      const response = await this.httpService.axiosRef.get(`http://localhost:3000/api/auth/info/${sessionId}`, {
        headers: {
          accept: 'application/json',
        },
      });
      return response.data;
    }
  }

  async getUserRole(workspaceId: string, userId: string) {
    const response = await this.httpService.axiosRef.get(
      `http://localhost:3000/api/workspace/${workspaceId}/role/${userId}`,
      {
        headers: {
          accept: 'application/json',
        },
      },
    );
    return response.data;
  }

  async requestAPI(address: string, method: 'GET' | 'POST' | 'PATCH' | 'DELETE', body: object | null) {
    const headers = {
      accept: 'application/json',
    };

    let response: AxiosResponse;

    switch (method) {
      case 'GET':
        response = await this.httpService.axiosRef.get(address, { headers });
        return response.data;
      case 'POST':
        response = await this.httpService.axiosRef.post(address, body, { headers });
        return response.data;
      default:
        console.log('default');
    }
  }
}
