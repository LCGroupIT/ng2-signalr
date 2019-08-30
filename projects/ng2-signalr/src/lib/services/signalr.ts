import { NgZone, Injectable, Inject } from '@angular/core';
import { IConnectionOptions } from './connection/connection.options';
import { SIGNALR_JCONNECTION_TOKEN } from './signalr.module';
import { HubConnection, LogLevel } from '@aspnet/signalr';
import { SignalRConfiguration } from './signalr.configuration';
import { SignalRConnection } from './connection/signalr.connection';

@Injectable()
export class SignalR {
  private _configuration: SignalRConfiguration;
  private _zone: NgZone;
  private _jHubConnectionFn: any;
  private hubConnection: HubConnection;

  public constructor(
    configuration: SignalRConfiguration,
    zone: NgZone,
    @Inject(SIGNALR_JCONNECTION_TOKEN) jHubConnectionFn: any /* use type 'any'; Suggested workaround from angular repository: https://github.com/angular/angular/issues/12631 */
  ) {
    this._configuration = configuration;
    this._zone = zone;
    this._jHubConnectionFn = jHubConnectionFn;
  }

  // public createConnection(options?: IConnectionOptions): SignalRConnection {
  public createConnection(options?: IConnectionOptions): SignalRConnection {
    const configuration = this.merge(options ? options : {});

    this.logConfiguration(configuration);

    this.hubConnection = this._jHubConnectionFn.withUrl(
      configuration.url,
      {
        accessTokenFactory(): string | Promise<string> {
          return configuration.qs.token;
        }
      }).configureLogging(LogLevel.Information)
      .build();

    return new SignalRConnection(this.hubConnection, {}, this._zone, configuration);
  }

  public connect(options?: IConnectionOptions): Promise<any> {
    const connection = this.createConnection(options);
    connection.start();

    return new Promise<any>((resolve) => {
      return resolve(connection);
    });
  }

  private logConfiguration(configuration: SignalRConfiguration) {
    try {
      const serializedQs = JSON.stringify(configuration.qs);
      const serializedTransport = JSON.stringify(configuration.transport);
      if (configuration.logging) {
        console.log(`Creating connecting with...`);
        console.log(`configuration:[url: '${ configuration.url }'] ...`);
        console.log(`configuration:[hubName: '${ configuration.hubName }'] ...`);
        console.log(`configuration:[qs: '${ serializedQs }'] ...`);
        console.log(`configuration:[transport: '${ serializedTransport }'] ...`);
      }
    } catch (err) { /* */
    }
  }

  private merge(overrides: IConnectionOptions): SignalRConfiguration {
    const merged: SignalRConfiguration = new SignalRConfiguration();
    merged.hubName = overrides.hubName || this._configuration.hubName;
    merged.url = overrides.url || this._configuration.url;
    merged.qs = overrides.qs || this._configuration.qs;
    merged.logging = this._configuration.logging;
    merged.jsonp = overrides.jsonp || this._configuration.jsonp;
    merged.withCredentials = overrides.withCredentials || this._configuration.withCredentials;
    merged.transport = overrides.transport || this._configuration.transport;
    merged.executeEventsInZone = overrides.executeEventsInZone || this._configuration.executeEventsInZone;
    merged.executeErrorsInZone = overrides.executeErrorsInZone || this._configuration.executeErrorsInZone;
    merged.executeStatusChangeInZone = overrides.executeStatusChangeInZone || this._configuration.executeStatusChangeInZone;
    merged.pingInterval = overrides.pingInterval || this._configuration.pingInterval;
    return merged;
  }
}
