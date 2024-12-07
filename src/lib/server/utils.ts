import { json } from "@sveltejs/kit";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createDataResponse = (data: any) => {
  return json({
    status: "success",
    count: data.length,
    ...data,
  });
}

export const createErrorResponse = (status: number, message: string) => {
  return json({
    status: "error",
    message: message,
  }, {
    status: status,
  });
}