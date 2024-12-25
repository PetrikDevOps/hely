/* eslint-disable @typescript-eslint/no-explicit-any */

import type { RequestHandler } from '@sveltejs/kit';
import { dayjs } from '$lib/utils';
import { createDataResponse, createErrorResponse } from '$lib/server/utils';
import { parseDate } from '$lib/utils';

type PrismaModel = {
  findMany: (args: any) => Promise<any[]>;
  findFirst?: (args: any) => Promise<any | null>;
};

interface EndpointConfig<T extends PrismaModel> {
  model: T;
  filters?: {
    field: string;
    type: 'string' | 'number' | 'boolean' | 'date';
    operator?: 'equals' | 'contains' | 'gt' | 'gte' | 'lt' | 'lte' | 'in';
    required?: boolean;
    transform?: (value: string) => any;
  }[];
  paramConfig?: {
    name: string;
    dbField?: string;
    checkExists?: boolean;
    existsModel?: Record<string, any>;
  };
  orderBy?: Record<string, 'asc' | 'desc'>[];
  dateHandling?: {
    enabled: boolean;
    field?: string;
  };
  include?: Record<string, boolean>;
  additionalWhere?: Record<string, any>;
}

function parseFilterValue(value: string, type: string, transform?: (value: string) => any): any {
  if (transform) return transform(value);

  switch (type) {
    case 'number': {
      const num = Number(value);
      if (isNaN(num)) throw new Error('Invalid number format');
      return num;
    }
    case 'boolean':
      if (value !== 'true' && value !== 'false') throw new Error('Invalid boolean format');
      return value === 'true';
    case 'date':
      return parseDate(value).toDate();
    default:
      return value;
  }
}

export function createPrismaEndpoint<T extends PrismaModel>(
  config: EndpointConfig<T>
): RequestHandler {
  return async ({ url, params }) => {
    try {
      const where: Record<string, any> = { ...config.additionalWhere };

      // Handle parameter-based filtering
      if (config.paramConfig) {
        const paramValue = params[config.paramConfig.name];
        if (!paramValue) {
          return createErrorResponse(400, `Missing ${config.paramConfig.name}`);
        }

        if (config.paramConfig.checkExists) {
          const existsModel = config.paramConfig.existsModel || config.model;
          const exists = await existsModel.findFirst({
            where: { id: paramValue }
          });
          if (!exists) {
            return createErrorResponse(404, `${config.paramConfig.name} not found`);
          }
        }

        where[config.paramConfig.dbField || config.paramConfig.name] = paramValue;
      }

      // Handle date range filtering only if enabled
      if (config.dateHandling?.enabled) {
        const dateField = config.dateHandling.field || 'date';
        const startDate = url.searchParams.get('startDate');
        const endDate = url.searchParams.get('endDate');

        if (startDate && endDate) {
          try {
            const start = parseDate(startDate);
            const end = parseDate(endDate);
            if (start.isAfter(end)) throw new Error('startDate is after endDate');
            if (start.isBefore(dayjs().startOf('day')) || end.isBefore(dayjs().startOf('day'))) {
              throw new Error('startDate or endDate is in the past');
            }
            where[dateField] = {
              gte: start.startOf('day').toDate(),
              lte: end.endOf('day').toDate()
            };
          } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Invalid date format');
          }
        } else {
          where[dateField] = {
            gte: dayjs().startOf('day').toDate()
          };
        }
      }

      // Handle custom filters
      if (config.filters) {
        for (const filter of config.filters) {
          const value = url.searchParams.get(filter.field);

          if (filter.required && !value) {
            throw new Error(`Missing required filter: ${filter.field}`);
          }
          if (!value) continue;

          if (filter.operator === 'in') {
            where[filter.field] = {
              in: value
                .split(',')
                .map((v) => parseFilterValue(v.trim(), filter.type, filter.transform))
            };
            continue;
          }

          const parsedValue = parseFilterValue(value, filter.type, filter.transform);
          where[filter.field] = filter.operator ? { [filter.operator]: parsedValue } : parsedValue;
        }
      }

      const results = await config.model.findMany({
        where,
        include: config.include,
        orderBy: config.orderBy || (config.dateHandling?.enabled ? [{ [config.dateHandling.field || 'date']: 'asc' }] : [])
      });

      return createDataResponse(results);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return createErrorResponse(400, errorMessage);
    }
  };
}