export type Result = {
  type: "RESULT";
  requestId: string;
  result: string;
  success: boolean;
};
