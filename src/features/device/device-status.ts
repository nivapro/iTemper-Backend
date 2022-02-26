export interface MemoryUsage {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
}

export interface UserInfo {
    username: string;
    uid: number;
    gid: number;
    shell: string;
    homedir: string;
}
export interface NetworkInterfaceInfo {
    address: string;
    netmask: string;
    family: string;
    mac: string;
    internal: boolean;
}
export interface CpuUsage {
    user: number;
    system: number;
}
export interface DeviceData {
    timestamp: number;
    hostname: string;
    loadavg: number[];
    uptime: number;
    freemem: number;
    totalmem: number;
    release: string;
    networkInterfaces: { [index: string]: NetworkInterfaceInfo[] };
    userInfo: UserInfo;
    memoryUsage: MemoryUsage;
    cpuUsage: CpuUsage;
    pid: number;
}

export function formatDeviceData (data: Partial<DeviceData>): string {
    
    return JSON.stringify(data, null, 2);
}
export function deviceDataReport (data: Partial<DeviceData>): Partial<DeviceData> {
    const report: Partial<DeviceData> = {}; 
    report.timestamp = data.timestamp;
    report.hostname = data.hostname;
    report.uptime = data.uptime;
    report.networkInterfaces = data.networkInterfaces;
    return 
}
