import { ApiProperty } from "@nestjs/swagger";

// dto/create-account.dto.ts
export class CreateAccountDto {
  @ApiProperty({
    description: 'URN of the company/user',
    example: 'urn:company:microstep-001',
  })
  companyUrn: string; // unique user/company identifier
}