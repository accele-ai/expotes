/**
 * @module utils/ip
 * @description IP utility functions
 */
import { Request } from 'express';
import { IncomingMessage } from 'http';
// import { FastifyRequest } from 'fastify';

interface GeoIPData {
  country: string;
  countryCode: string;
  continent: string;
  continentCode: string;
  province: string;
  provinceCode: string;
  city: string;
  cityLongitude: number;
  cityLatitude: number;
  cityTimeZone: string;
}

/* Helper parse real ip from request */
export const getIp = (request: Request | IncomingMessage) => {
  const _ = request as any;

  let ip: string =
    _.headers['x-forwarded-for'] ||
    _.ip ||
    _.raw.connection.remoteAddress ||
    _.raw.socket.remoteAddress ||
    undefined;
  if (ip && ip.split(',').length > 0) {
    ip = ip.split(',')[0];
  }
  return ip;
};

const decodeHeaderValue = (value: string): string => {
  const iso88591Bytes = new Uint8Array(
    [...value].map((char) => char.charCodeAt(0)),
  );
  const utf8Decoder = new TextDecoder('utf-8');
  return utf8Decoder.decode(iso88591Bytes);
};

export const getGeo = (request: Request) => {
  const headers = (request as any).headers as any;

  const geoIPData: GeoIPData = {
    country: decodeHeaderValue(headers['x-geoip-country'] as string) || '未知',
    countryCode: (headers['x-geoip-country-code'] as string) || '',
    continent: decodeHeaderValue(headers['x-geoip-continent'] as string) || '',
    continentCode: (headers['x-geoip-continent-code'] as string) || '',
    province: decodeHeaderValue(headers['x-geoip-province'] as string) || '',
    provinceCode: (headers['x-geoip-province-code'] as string) || '',
    city: decodeHeaderValue(headers['x-geoip-city'] as string) || '',
    cityLongitude: parseFloat(headers['x-geoip-city-longitude'] as string) || 0,
    cityLatitude: parseFloat(headers['x-geoip-city-latitude'] as string) || 0,
    cityTimeZone: (headers['x-geoip-city-time-zone'] as string) || '',
  };

  return geoIPData;
};

export const getGeoRender = (geo: GeoIPData) => {
  return geo.city || geo.province || geo.continent || geo.country;
};

export const parseRelativeUrl = (path: string) => {
  if (!path || !path.startsWith('/')) {
    return new URL('http://a.com');
  }
  return new URL(`http://a.com${path}`);
};

// type GeoLocation = {
//   ip: string;
//   full_ip: string;
//   country: string;
//   country_code: string;
//   province: string | null;
//   city: string;
//   distinct: string | null;
//   isp: string | null;
//   operator: string | null;
//   lon: string;
//   lat: string;
//   net_str: string;
// };

// export const getGEOLocation = async (ip: string) => {
//   const response = await fetch(
//     `https://forge.speedtest.cn/api/location/info?ip=${ip}`,
//   ).then((res) => res.json() as Promise<GeoLocation>);

//   return [response.country, response.province, response.city, response.isp]
//     .filter(Boolean)
//     .join(' ');
// };
