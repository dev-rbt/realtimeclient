import { SystemMetrics } from '@/lib/types';
import { HubConnection, HubConnectionBuilder, LogLevel, HttpTransportType } from '@microsoft/signalr';
import { useEffect, useRef, useState } from 'react';

export const useSignalR = (hubUrl: string) => {
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const [error, setError] = useState<string | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        const createConnection = async () => {
            try {
                console.log('Attempting to connect to:', hubUrl);

                const newConnection = new HubConnectionBuilder()
                    .withUrl(hubUrl, {
                        skipNegotiation: true,
                        transport: HttpTransportType.WebSockets,
                        headers: {
                            'Access-Control-Allow-Credentials': 'true'
                        }
                    })
                    .configureLogging(LogLevel.Debug)
                    .withAutomaticReconnect([0, 2000, 5000, 10000, 20000])
                    .build();

                // Server timeout süresini artıralım
                newConnection.serverTimeoutInMilliseconds = 60000; // 60 saniye

                newConnection.onclose((error) => {
                    console.error('Connection closed with error:', error);
                });

                newConnection.onreconnecting((error) => {
                    console.warn('Reconnecting due to error:', error);
                });

                newConnection.onreconnected((connectionId) => {
                    console.log('Reconnected with ID:', connectionId);
                });

                console.log('Starting connection...');
                await newConnection.start();
                console.log("SignalR Connected successfully!");
                setConnection(newConnection);
                setError(null);
            } catch (err) {
                console.error("SignalR Connection Error:", err);
                setError('Failed to connect to SignalR hub');
                reconnectTimeoutRef.current = setTimeout(createConnection, 5000);
            }
        };

        createConnection();

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (connection) {
                connection.stop();
            }
        };
    }, [hubUrl]);

    return {
        connection,
        error
    };
};

export const useSystemMetrics = () => {
    const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
    const hubUrl = `${process.env.NEXT_PUBLIC_API_URL}/systemMetricsHub`;
    const { connection, error } = useSignalR(hubUrl);

    useEffect(() => {
        if (connection) {
            console.log('Subscribing to ReceiveMetrics');
            connection.on('ReceiveMetrics', (data: SystemMetrics) => {
                console.log('Received metrics:', data);
                setMetrics(data);
            });
        }

        return () => {
            if (connection) {
                connection.off('ReceiveMetrics');
            }
        };
    }, [connection]);

    return { metrics, error };
};
