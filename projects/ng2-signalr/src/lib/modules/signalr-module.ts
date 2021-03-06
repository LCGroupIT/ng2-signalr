import { NgModule, ModuleWithProviders, NgZone, InjectionToken } from '@angular/core';
import { SignalR } from '../services/signalr';
import { SignalRConfiguration } from '../services/signalr.configuration';
import { HubConnectionBuilder } from '@aspnet/signalr';

const SIGNALR_CONFIGURATION = new InjectionToken<SignalRConfiguration>('SIGNALR_CONFIGURATION');

export function createSignalr(configuration: SignalRConfiguration, zone: NgZone) {
  return new SignalR(configuration, zone, new HubConnectionBuilder());
}


// function  getJConnectionFn(): any {
//   const hubConnectionFn = (window as any).jQuery.hubConnection;
//
//   return hubConnectionFn;
// }

@NgModule({
    providers: [{
        provide: SignalR,
        useValue: SignalR
    }]
})
export class SignalRModule {
    public static forRoot(getSignalRConfiguration: () => void): ModuleWithProviders {
        return {
            ngModule: SignalRModule,
            providers: [
                {
                    provide: SIGNALR_CONFIGURATION,
                    useFactory: getSignalRConfiguration
                },
                {
                    deps: [SIGNALR_CONFIGURATION, NgZone],
                    provide: SignalR,
                    useFactory: (createSignalr)
                }
            ],
        };
    }
    public static forChild(): ModuleWithProviders {
        throw new Error('forChild method not implemented');
    }
}
