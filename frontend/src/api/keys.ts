// define keys for useQuery
export const qk = {
  dogs: () => ['dogs'] as const,
  runners: () => ['runners'] as const,
  sports: () => ['sports'] as const,
  dog: (id: number) => ['dog', id] as const,
};
