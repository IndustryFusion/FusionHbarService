import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DidService } from './endpoints/did/did.service';
import { DidController } from './endpoints/did/did.controller';
import { VcController } from './endpoints/vc/vc.controller';
import { AccountController } from './endpoints/account/account.controller';
import { VcService } from './endpoints/vc/vc.service';
import { AccountService } from './endpoints/account/account.service';
import { HederaClientProvider } from './hashgraph.provider';
import { MirrorNodeService } from './endpoints/vc/mirror-node.service';

@Module({
  imports: [],
  controllers: [AppController, DidController, VcController, AccountController],
  providers: [AppService, DidService, VcService, AccountService, HederaClientProvider, MirrorNodeService],
  exports: [HederaClientProvider]
})
export class AppModule {}
