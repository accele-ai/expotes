export declare class ExpoUpdatesV1HeadersDto {
    protocolVersion: string;
    platform: string;
    runtimeVersion: string;
    currentUpdateId: string;
    embeddedUpdateId: string;
}
export declare class ExpoUpdatesV1QueryDto {
    platform: string;
    runtimeVersion: string;
}
export declare class ExpoUpdatesV1Dto {
    protocolVersion: 0 | 1;
    platform: 'ios' | 'android';
    runtimeVersion: number;
    currentUpdateId: string;
    embeddedUpdateId?: string;
}
export declare const ExpoUpdatesV1: (...dataOrPipes: unknown[]) => ParameterDecorator;
