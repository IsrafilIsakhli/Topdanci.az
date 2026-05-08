import { Injectable } from '@nestjs/common';
import { CreateLeadEventDto } from './dto/create-lead-event.dto';

@Injectable()
export class LeadsService {
  track(dto: CreateLeadEventDto) {
    return {
      data: {
        accepted: true,
        type: dto.type,
      },
    };
  }
}
