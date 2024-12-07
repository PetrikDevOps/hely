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