export const incidentKeys = {
  all: ['incidents'] as const,
  catalog: () => [...incidentKeys.all, 'catalog'] as const,
  list: (page: number, query: string, status: string) =>
    [...incidentKeys.all, 'list', page, query, status] as const,
  detail: (id: string) => ['incident', id] as const,
}

export const serviceKeys = {
  all: ['services'] as const,
}
