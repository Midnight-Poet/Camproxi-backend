export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

export async function paginate<T, Args extends Record<string, any> = Record<string, any>>(
  model: any,
  args: Args = {} as Args,
  page: number = 1,
  limit: number = 20,
): Promise<PaginatedResult<T>> {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model.findMany({ ...args, skip, take: limit }),
    model.count({ where: (args as any).where || {} }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      lastPage: Math.ceil(total / limit) || 1,
    },
  };
}
