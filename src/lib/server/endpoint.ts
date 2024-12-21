/* eslint-disable @typescript-eslint/no-explicit-any */

import type { RequestHandler } from '@sveltejs/kit';
import dayjs from 'dayjs';
import { createDataResponse, createErrorResponse } from '$lib/server/utils';
import { parseDate } from '$lib/utils';

// Generic type for Prisma model
type PrismaModel = {
  findMany: (args: any) => Promise<any[]>;
};

// Configuration for the endpoint handler
interface EndpointConfig<T extends PrismaModel> {
  model: T;
  orderBy?: Record<string, 'asc' | 'desc'>;
  dateField?: string;
}

// Validate date range
function validateDateRange(startDate?: string | null, endDate?: string | null) {
  if (startDate && endDate) {
    try {
      const a = parseDate(startDate);
      const b = parseDate(endDate);

      // Check if start date is after end date
      if (a.isAfter(b)) {
        throw new Error('startDate is after endDate');
      }

      // Check if dates are in the past
      if (a.isBefore(dayjs().startOf('day')) || b.isBefore(dayjs().startOf('day'))) {
        throw new Error('startDate or endDate is in the past');
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Invalid date format');
    }
  }
}

// Create a generic Prisma endpoint handler
export function createPrismaEndpoint<T extends PrismaModel>(
  config: EndpointConfig<T>
): RequestHandler {
  return async ({ url }) => {
    try {
      const startDate = url.searchParams.get('startDate');
      const endDate = url.searchParams.get('endDate');

      // Validate dates if provided
      validateDateRange(startDate, endDate);

      // Prepare query conditions
      const where: Record<string, any> = {};
      const dateField = config.dateField || 'date';

      // Add date filtering if start and end dates are provided
      if (startDate && endDate) {
        where[dateField] = {
          gte: parseDate(startDate).startOf('day').toDate(),
          lte: parseDate(endDate).startOf('day').toDate()
        };
      } else {
        // Default to future dates if no specific range is provided
        where[dateField] = {
          gte: dayjs().startOf('day').toDate()
        };
      }

      // Fetch data using Prisma
      const results = await config.model.findMany({
        where,
        orderBy: config.orderBy || [{ [dateField]: 'asc' }]
      });

      return createDataResponse(results);
    } catch (error) {
      // Handle any errors during the process
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return createErrorResponse(400, errorMessage);
    }
  };
}

// Enhanced configuration for parameterized endpoints
interface ParamEndpointConfig {
  model: {
    findMany: (args: any) => Promise<any[]>;
    findFirst?: (args: any) => Promise<any | null>;
  };
  paramName: string;
  paramValidation?: {
    checkExists?: boolean;
    existsModel?: Record<string, any>;
  };
  dbField?: string;
  orderBy?: Record<string, 'asc' | 'desc'>[];
  dateField?: string;
  include?: Record<string, boolean>;
  additionalWhere?: Record<string, any>;
}

// Create a parameterized Prisma endpoint handler
export function createParameterizedPrismaEndpoint (
  config: ParamEndpointConfig
): RequestHandler {
  return async ({ url, params }) => {
    try {
      // Extract parameter value
      const paramValue = params[config.paramName];

      // Validate parameter
      if (!paramValue) {
        return createErrorResponse(400, `Missing ${config.paramName}`);
      }

      if (!config.dbField) {
        config.dbField = config.paramName;
      }

      // Optional parameter existence check
      if (config.paramValidation?.checkExists) {
        const existsModel = config.paramValidation.existsModel || config.model;
        const exists = await existsModel.findFirst({
          where: { id: paramValue }
        });

        if (!exists) {
          return createErrorResponse(404, `${config.paramName} not found`);
        }
      }

      // Extract date parameters
      const startDate = url.searchParams.get('startDate');
      const endDate = url.searchParams.get('endDate');

      // Validate dates if provided
      validateDateRange(startDate, endDate);

      // Prepare query conditions
      const where: Record<string, any> = {
        ...config.additionalWhere,
        [config.dbField]: paramValue
      };

      const dateField = config.dateField || 'date';

      // Add date filtering if start and end dates are provided
      if (startDate && endDate) {
        where[dateField] = {
          gte: parseDate(startDate).startOf('day').toDate(),
          lte: parseDate(endDate).endOf('day').toDate()
        };
      } else {
        // Default to future dates if no specific range is provided
        where[dateField] = {
          gte: dayjs().startOf('day').toDate()
        };
      }

      // Fetch data using Prisma
      const results = await config.model.findMany({
        where,
        include: config.include,
        orderBy: config.orderBy && config.orderBy.length > 0 ? [
          { [dateField]: 'asc' },
          ...config.orderBy.slice(1)
        ] : [{ [dateField]: 'asc' }]
      });

      return createDataResponse(results);
    } catch (error) {
      // Handle any errors during the process
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return createErrorResponse(400, errorMessage);
    }
  };
}

// Type for filter configuration
type FilterConfig = {
  field: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  operator?: 'equals' | 'contains' | 'gt' | 'gte' | 'lt' | 'lte' | 'in';
  required?: boolean;
  transform?: (value: string) => any;
};

// Configuration for the endpoint handler
interface FilteredEndpointConfig<T extends PrismaModel> {
  model: T;
  filters: FilterConfig[];
  orderBy?: Record<string, 'asc' | 'desc'>;
  dateField?: string;
  include?: Record<string, boolean>;
}

// Parse and validate filter value based on its type
function parseFilterValue(value: string, type: FilterConfig['type'], transform?: (value: string) => any): any {
  if (transform) {
    return transform(value);
  }

  switch (type) {
    case 'number':
      { const num = Number(value);
      if (isNaN(num)) throw new Error('Invalid number format');
      return num; }
    case 'boolean':
      if (value !== 'true' && value !== 'false') throw new Error('Invalid boolean format');
      return value === 'true';
    case 'date':
      return parseDate(value).toDate();
    default:
      return value;
  }
}

// Build Prisma where clause from filter parameters
function buildWhereClause(
  searchParams: URLSearchParams,
  filters: FilterConfig[],
  dateField: string
): Record<string, any> {
  const where: Record<string, any> = {};

  // Handle date range if dateField is specified
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (startDate && endDate) {
    where[dateField] = {
      gte: parseDate(startDate).startOf('day').toDate(),
      lte: parseDate(endDate).endOf('day').toDate()
    };
  } else {
    where[dateField] = {
      gte: dayjs().startOf('day').toDate()
    };
  }

  // Process each configured filter
  for (const filter of filters) {
    const value = searchParams.get(filter.field);

    // Check if required filter is missing
    if (filter.required && !value) {
      throw new Error(`Missing required filter: ${filter.field}`);
    }

    // Skip if filter value is not provided
    if (!value) continue;

    // Handle array values for 'in' operator
    if (filter.operator === 'in') {
      const values = value.split(',').map(v => parseFilterValue(v.trim(), filter.type, filter.transform));
      where[filter.field] = { in: values };
      continue;
    }

    // Parse the filter value
    const parsedValue = parseFilterValue(value, filter.type, filter.transform);

    // Build the where clause based on the operator
    switch (filter.operator) {
      case 'contains':
        where[filter.field] = { contains: parsedValue };
        break;
      case 'gt':
        where[filter.field] = { gt: parsedValue };
        break;
      case 'gte':
        where[filter.field] = { gte: parsedValue };
        break;
      case 'lt':
        where[filter.field] = { lt: parsedValue };
        break;
      case 'lte':
        where[filter.field] = { lte: parsedValue };
        break;
      default:
        where[filter.field] = parsedValue;
    }
  }

  return where;
}

// Create a filtered Prisma endpoint handler
export function createFilteredPrismaEndpoint<T extends PrismaModel>(
  config: FilteredEndpointConfig<T>
): RequestHandler {
  return async ({ url }) => {
    try {
      const dateField = config.dateField || 'date';

      // Build the where clause from filter parameters
      const where = buildWhereClause(url.searchParams, config.filters, dateField);

      // Fetch data using Prisma
      const results = await config.model.findMany({
        where,
        include: config.include,
        orderBy: config.orderBy || { [dateField]: 'asc' }
      });

      return createDataResponse(results);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return createErrorResponse(400, errorMessage);
    }
  };
}