// Minecraft server status utility using mcstatus.io API (more reliable than deprecated npm package)

interface ServerStatus {
  online: boolean;
  players: { online: number; max: number };
  motd: string;
  version: string;
  latency: number;
  icon?: string;
}

const statusCache = new Map<string, { data: ServerStatus; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds

export async function getServerStatus(host: string, port: number = 25565): Promise<ServerStatus> {
  const cacheKey = `${host}:${port}`;
  const cached = statusCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const response = await fetch(`https://api.mcstatus.io/v2/status/java/${host}:${port}`, {
      next: { revalidate: 30 },
    });
    
    if (!response.ok) throw new Error('Failed to fetch status');
    
    const data = await response.json();
    
    const status: ServerStatus = {
      online: data.online ?? false,
      players: {
        online: data.players?.online ?? 0,
        max: data.players?.max ?? 0,
      },
      motd: data.motd?.clean ?? '',
      version: data.version?.name_clean ?? 'Unknown',
      latency: data.roundTripLatency ?? 0,
      icon: data.icon ?? undefined,
    };
    
    statusCache.set(cacheKey, { data: status, timestamp: Date.now() });
    return status;
  } catch (error) {
    const offlineStatus: ServerStatus = {
      online: false,
      players: { online: 0, max: 0 },
      motd: '',
      version: 'Unknown',
      latency: 0,
    };
    
    statusCache.set(cacheKey, { data: offlineStatus, timestamp: Date.now() });
    return offlineStatus;
  }
}

// Validate Minecraft username via Mojang API
export async function validateMinecraftUsername(username: string): Promise<{ valid: boolean; uuid?: string }> {
  try {
    const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`);
    if (response.status === 200) {
      const data = await response.json();
      return { valid: true, uuid: data.id };
    }
    return { valid: false };
  } catch {
    return { valid: false };
  }
}

// Get Minecraft head URL
export function getMinecraftHeadUrl(uuid: string, size: number = 64): string {
  return `https://crafatar.com/avatars/${uuid}?size=${size}&overlay`;
}

export function getMinecraftBodyUrl(uuid: string, size: number = 128): string {
  return `https://crafatar.com/renders/body/${uuid}?size=${size}&overlay`;
}
